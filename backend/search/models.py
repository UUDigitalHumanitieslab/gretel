from django.db import models
from django.utils import timezone
from django.db.models import F

from timeit import default_timer as timer
import json
import math

from treebanks.models import Component
from services.basex import basex
from .basex_search import (generate_xquery_search,
                           check_xpath, parse_search_result)


class SearchError(RuntimeError):
    pass


class ComponentSearchResult(models.Model):
    xpath = models.TextField()
    component = models.ForeignKey(Component, on_delete=models.CASCADE)
    variables = models.JSONField(blank=True, default=list)
    search_completed = models.DateTimeField(null=True, editable=False)
    last_accessed = models.DateField(null=True, editable=False)
    results = models.TextField(default='', editable=False)
    number_of_results = models.PositiveIntegerField(null=True, editable=False)
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

    def perform_search(self, query_id=None):
        """Perform full component search and regularly update on progress"""
        if not check_xpath(self.xpath):
            raise SearchError('Malformed XPath')
        if not self.component_id:
            raise SearchError('Field component not filled in')
        databases_with_size = self.component.get_databases()
        self.results = ''
        self.completed_part = 0
        self.number_of_results = 0
        start_time = timer()
        next_save_time = start_time + 1
        matches = []
        for database in databases_with_size:
            size = databases_with_size[database]
            query = generate_xquery_search(
                database,
                self.xpath,
                self.variables
            )
            try:
                result = basex.perform_query(query)
            except (OSError, UnicodeDecodeError) as err:
                self.errors += 'Error searching database {}: ' \
                    .format(database) + str(err) + '\n'
                result = ''  # No break because completed_part is to be updated
            try:
                matches.extend(parse_search_result(
                    result, self.component.slug, database)
                )
            except ValueError as err:
                self.errors += 'Error parsing search result in database {}: ' \
                    '{}\n'.format(database, err)
            self.number_of_results = len(matches)
            self.results = json.dumps(matches)
            self.completed_part += size
            if timer() > next_save_time:
                self.save()
                next_save_time = timer() + 1
                # Also check if search has been cancelled
                if query_id is not None:
                    cancelled = SearchQuery.objects \
                        .values_list('cancelled', flat=True).get(id=query_id)
                    if cancelled:
                        return
        self.search_completed = timezone.now()
        self.save()


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
    # completed_part can be removed because it is obtained dynamically
    completed_part = models.PositiveIntegerField(
        null=True, editable=False,
        help_text='Total size in KiB of databases for which the search has '
                  'been completed'
    )
    cancelled = models.BooleanField(
        default=False,
        help_text='True if the query was cancelled by the user'
    )

    def initialize(self) -> None:
        """Initialize search query after entering XPath and list of
        components by calculating total database size and creating
        ComponentSearchResult-s"""
        self.completed_part = 0
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
        a list of dictionaries and the percentage of search completion."""
        completed_part = 0
        to_skip = from_number
        if to_number is not None:
            results_to_go = to_number - from_number
        else:
            results_to_go = math.inf
        stop_adding = False
        all_matches = []
        for result_obj in self.results.all().order_by('component'):
            # Add matches to list, as long as no empty or partial search result
            # has been encountered.
            if not (stop_adding or result_obj.number_of_results is None):
                if to_skip >= result_obj.number_of_results:
                    # Skip completely
                    to_skip -= result_obj.number_of_results
                else:
                    matches_json = result_obj.results
                    matches = json.loads(matches_json)
                    all_matches.extend(matches[to_skip:])
                    to_skip = 0
                    results_to_go -= len(matches)
                    if results_to_go <= 0:
                        stop_adding = True
            # Count completed part (for all results)
            if result_obj.completed_part is not None:
                completed_part += result_obj.completed_part
            # If result is empty or partially complete, stop adding
            # (this is to make sure that the user will see the results
            # in the correct order)
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
