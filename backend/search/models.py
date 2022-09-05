from django.db import models
from django.utils import timezone
from django.db.models import F, Sum
from django.conf import settings
from django.db.models.signals import pre_delete
from django.dispatch import receiver

from timeit import default_timer as timer
import math
import logging
import pathlib
import re
from datetime import timedelta

from treebanks.models import Component
from services.basex import basex
from .basex_search import (generate_xquery_search,
                           check_xpath, parse_search_result,
                           generate_xquery_count)

logger = logging.getLogger(__name__)


class SearchError(RuntimeError):
    pass


class ComponentSearchResult(models.Model):
    xpath = models.TextField()
    component = models.ForeignKey(Component, on_delete=models.CASCADE)
    variables = models.JSONField(blank=True, default=list)
    search_completed = models.DateTimeField(null=True, editable=False)
    last_accessed = models.DateField(null=True, editable=False)
    number_of_results = models.PositiveIntegerField(null=True, editable=False)
    cache_size = models.PositiveBigIntegerField(
        null=True, editable=False,
        help_text='Size of the cached results in bytes')
    errors = models.TextField(default='', editable=False)
    completed_part = models.PositiveIntegerField(
        null=True, editable=False,
        help_text='Total size in KiB of databases for which the search has '
                  'been completed'
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['xpath', 'component', 'variables'],
                                    name='componentsearchresult_uniqueness')
        ]

    def __str__(self):
        return '"{}…" for {}'.format(self.xpath[:10], self.component)

    def _get_cache_path(self, create_dir: bool) -> pathlib.Path:
        """Get the Path of the caching file corresponding to this
        ComponentSearchResult. If create_dir is True, create the parent
        directory if needed."""
        try:
            settings.CACHING_DIR.mkdir(exist_ok=True, parents=True)
        except (FileExistsError, FileNotFoundError):
            raise SearchError('Could not access or create caching directory')
        return settings.CACHING_DIR / str(self.id)

    def get_results(self) -> dict:
        """Return results as a dict"""
        cache_filename = str(self._get_cache_path(False))
        try:
            cache_file = open(cache_filename, 'r')
        except FileNotFoundError:
            logger.error(
                'Could not open cache file for ComponentSearchResult {}: {}'
                .format(self.id, cache_filename)
            )
            raise SearchError('Cache file not found')
        results = cache_file.read()
        cache_file.close()
        self.last_accessed = timezone.now()
        self.save()
        return parse_search_result(results, self.component.slug)

    def _truncate_results(self, results: str, number: int) -> str:
        matches = list(re.finditer('<match>', results))
        start_of_nth_match = matches[number].span()[0]
        return results[:start_of_nth_match]

    def perform_search(self, query_id=None):
        """Perform full component search and regularly update on progress"""
        if not self.component_id:
            raise SearchError('Field component not filled in')
        if not check_xpath(self.xpath):
            raise SearchError('Malformed XPath')
        if not self.id:
            # Save, because we need the id for the caching file
            self.save()
        databases_with_size = self.component.get_databases()
        self.results = ''
        self.completed_part = 0
        self.number_of_results = 0
        start_time = timer()
        next_save_time = start_time + 1
        try:
            resultsfile = self._get_cache_path(True).open(mode='w')
        except OSError:
            raise SearchError('Could not open caching file')
        cancelled = False
        stop_adding_results = False
        for database in databases_with_size:
            size = databases_with_size[database]
            if not stop_adding_results:
                print('Searching db')
                query = generate_xquery_search(
                    database, self.xpath, self.variables
                )
                try:
                    result = basex.perform_query(query)
                except (OSError, UnicodeDecodeError) as err:
                    self.errors += 'Error searching database {}: ' \
                        .format(database) + str(err) + '\n'
                    result = ''  # No break, keep going
                results_for_database = result.count('<match>')
                maximum_to_add = settings.MAXIMUM_RESULTS_PER_COMPONENT - \
                    self.number_of_results
                self.number_of_results += results_for_database
                if results_for_database > maximum_to_add:
                    result = self._truncate_results(
                        result, maximum_to_add
                    )
                if results_for_database >= maximum_to_add:
                    stop_adding_results = True
                resultsfile.write(result)
            else:
                print('Counting db')
                # Only count from now on
                query = generate_xquery_count(database, self.xpath)
                try:
                    count = int(basex.perform_query(query))
                except (OSError, UnicodeDecodeError, ValueError) as err:
                    self.errors += 'Error searching database {}: ' \
                        .format(database) + str(err) + '\n'
                    count = 0
                self.number_of_results += count
            self.completed_part += size
            if timer() > next_save_time:
                self.save()
                next_save_time = timer() + 1
                # Also check if search has been cancelled
                if query_id is not None:
                    cancelled_value = SearchQuery.objects \
                        .values_list('cancelled', flat=True).get(id=query_id)
                    if cancelled_value:
                        cancelled = True
                        break
        resultsfile.close()
        self.cache_size = self._get_cache_path(False).stat().st_size
        if not cancelled:
            self.search_completed = timezone.now()
        self.last_accessed = timezone.now()
        self.save()

    def delete_cache_file(self):
        """Delete the cache file belonging to this ComponentSearchResult.
        This method is called automatically on delete."""
        cache_path = self._get_cache_path(False)
        cache_path.unlink(missing_ok=True)
        logger.info('Deleted cache for ComponentSearchResult with ID {}.'
                    .format(self.id))

    @classmethod
    def purge_cache(cls):
        yesterday = timezone.now() - timedelta(days=1)
        # Get total cache size
        total_size = \
            cls.objects.aggregate(Sum('cache_size'))['cache_size__sum']
        if total_size is None:
            # This happens if all CSRs have no filled in cache size
            return
        # Calculate how much data we should delete
        maximum_size = settings.MAXIMUM_CACHE_SIZE * 1024 * 1024
        to_delete = total_size - maximum_size
        if to_delete <= 0:
            logger.info('Size of component search result cache is ok.')
            return
        # Get CSRs starting with lowest last accessed date
        number_deleted = 0
        for csr in cls.objects.order_by('last_accessed'):
            if csr.cache_size is None:
                continue
            if csr.searchquery_set.filter(
                last_accessed__lt=yesterday
            ).count() > 0:
                # Do not delete if there are queries that might still be active
                continue
            to_delete -= csr.cache_size
            csr.delete()
            number_deleted += 1
            if to_delete <= 0:
                break
        if to_delete <= 0:
            logger.info('Deleted the {} component search results having the '
                        'earliest last access date to make space in cache.'
                        .format(number_deleted))
        else:
            logger.warning('Deleted {} component search results to make '
                           'space in cache, but cache is still larger than '
                           'maximum size.'.format(number_deleted))


@receiver(pre_delete, sender=ComponentSearchResult)
def delete_basex_db_callback(sender, instance, using, **kwargs):
    instance.delete_cache_file()


class SearchQuery(models.Model):
    # User-defined fields
    components = models.ManyToManyField(Component)
    xpath = models.TextField()
    variables = models.JSONField(blank=True, default=list)
    # Fields that are filled in as soon as searching has started
    results = models.ManyToManyField(ComponentSearchResult, editable=False)
    total_database_size = models.PositiveIntegerField(
        null=True, editable=False,
        help_text='Total size in KiB of all databases for this query'
    )
    cancelled = models.BooleanField(
        default=False,
        help_text='True if the query was cancelled by the user'
    )
    last_accessed = models.DateTimeField(null=True, editable=False)

    def initialize(self) -> None:
        """Initialize search query after entering XPath and list of
        components by calculating total database size and creating
        ComponentSearchResult-s"""
        self.total_database_size = 0
        if not self.pk:
            # If object has not been saved we cannot add ComponentSearchResult
            raise RuntimeError(
                'SearchQuery should be saved before calling initialize()'
            )
        results = []
        for component in self.components.all():
            result, created = ComponentSearchResult.objects.get_or_create(
                xpath=self.xpath,
                component=component,
                variables=self.variables
            )
            self.total_database_size += component.total_database_size
            results.append(result)
        self.results.add(*results)
        self.save()

    def get_results(self, from_number: int = 0, to_number: int = None) \
            -> (list, float):
        """Get results so far. Object should have been initialized with
        initialize() method but search does not have to be started yet
        with perform_search() method. Return a tuple of the result as
        a list of dictionaries and the percentage of search completion.
        This method saves the object to update last accessed time."""
        completed_part = 0
        to_skip = from_number
        if to_number is not None:
            results_to_go = to_number - from_number
        else:
            results_to_go = math.inf
        stop_adding = False
        if to_number is not None and to_number <= from_number:
            # Maximum number of results was already reached, so don't retrieve
            # any results - but we still need to calculate the count and the
            # search percentage.
            stop_adding = True
        all_matches = []
        for result_obj in self.results.all().order_by('component'):
            # Add matches to list, as long as no empty or partial search result
            # has been encountered.
            if not (stop_adding or result_obj.number_of_results is None):
                if to_skip >= result_obj.number_of_results:
                    # Skip completely
                    to_skip -= result_obj.number_of_results
                else:
                    matches = result_obj.get_results()
                    all_matches.extend(matches[to_skip:])
                    results_to_go -= len(matches) - to_skip
                    to_skip = 0
                    if results_to_go <= 0:
                        stop_adding = True
            # Count completed part (for all results)
            if result_obj.completed_part is not None:
                completed_part += result_obj.completed_part
            # If result is empty or partially complete, stop adding.
            # There might still be results in later ComponentSearchResult-s,
            # but if we give them back already they will be returned in
            # the incorrect order and we would have to keep track of what
            # has already been returned and what not. We continue our loop
            # though, because we still want to know the count so far and
            # the search percentage.
            if not result_obj.search_completed:
                stop_adding = True
        if self.total_database_size != 0:
            search_percentage = int(
                100 * completed_part / self.total_database_size
            )
        else:
            search_percentage = 100
        # Check if too many results have been added
        if results_to_go < 0:
            to_remove = -results_to_go
            all_matches = all_matches[0:-to_remove]
        self.last_accessed = timezone.now()
        self.save()
        return (all_matches, search_percentage)

    def perform_search(self) -> None:
        """Perform search and regularly update on progress"""

        # Get result objects for this query, but only those that have not
        # completed yet, and starting with those that have not started yet
        # (because those for which search has already started may finish
        # early).
        result_objs = self.results \
            .filter(search_completed__isnull=True) \
            .order_by(F('completed_part').desc(nulls_first=True))

        for result_obj in result_objs:
            # Check if search has been completed by now by a concurrent
            # search. If so, continue
            result_obj.refresh_from_db()
            if result_obj.search_completed and result_obj.errors == '':
                continue
            try:
                result_obj.perform_search(self.id)
            except SearchError:
                raise
            # Check if search has been cancelled in the meantime
            self.refresh_from_db(fields=['cancelled'])
            if self.cancelled:
                break

    def get_errors(self) -> str:
        errs = ''
        result_objs = self.results.order_by('component')
        for result_obj in result_objs:
            if result_obj.errors:
                errs += 'Errors in searching component {}: ' \
                    '\n{}\n\n' \
                    .format(result_obj.component, result_obj.errors)
        return errs

    def cancel_search(self) -> None:
        """Mark search as cancelled and save object"""
        self.cancelled = True
        self.save()
