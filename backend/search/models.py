from django.db import models
from django.utils import timezone
from django.db.models import F

from timeit import default_timer as timer

from treebanks.models import Component
from gretel.services import basex
from .basex_search import (generate_xquery_search, get_number_of_matches,
                           check_xpath)


class SearchError(RuntimeError):
    pass


class ComponentSearchResult(models.Model):
    xpath = models.TextField()
    component = models.ForeignKey(Component, on_delete=models.CASCADE)
    search_completed = models.DateTimeField(null=True, editable=False)
    last_accessed = models.DateField(null=True, editable=False)
    results = models.TextField(default='', editable=False)
    number_of_results = models.PositiveIntegerField(null=True, editable=False)
    errors = models.TextField(default='', editable=False)
    elapsed_time = models.PositiveBigIntegerField(
        null=True, editable=False,
        help_text='Elapsed time in ms'
    )
    completed_part = models.PositiveIntegerField(
        null=True, editable=False,
        help_text='Total size in KiB of databases for which the search has '
                  'been completed'
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['xpath', 'component'],
                                    name='componentsearchresult_uniqueness')
        ]

    def __str__(self):
        return '"{}…" for {}'.format(self.xpath[:10], self.component)

    def perform_search(self):
        """Perform full component search and regularly update on progress"""
        if not check_xpath(self.xpath):
            raise self.SearchError('Malformed XPath')

        databases = self.component.get_databases()
        self.results = ''
        self.completed_part = 0
        self.number_of_results = 0
        self.errors = ''
        start_time = timer()
        next_save_time = start_time + 1
        for keys_enumerated in enumerate(databases):
            index = keys_enumerated[0]
            database = keys_enumerated[1]
            size = databases[database]
            query = generate_xquery_search(database, self.xpath)
            try:
                result = basex.perform_query(query)
            except OSError as err:
                self.errors += 'Error searching database {}: ' \
                    .format(database) + str(err) + \
                    '\nResults may be incomplete.\n'
                result = ''  # No break because completed_part is to be updated
            self.results += result
            self.completed_part += size
            self.number_of_results += get_number_of_matches(result)
            if index < (len(databases) - 1) and timer() > next_save_time:
                # Do a direct database update because this is faster than
                # calling save().
                ComponentSearchResult.objects.filter(pk=self.pk).update(
                    completed_part=self.completed_part,
                    number_of_results=self.number_of_results,
                    results=self.results
                )
                next_save_time = timer() + 1
        self.elapsed_time = (timer() - start_time) * 1000
        self.search_completed = timezone.now()
        self.save()

    def parse_results(self):
        '''Get results in JSON. Probably better to save it immediately this
        way.'''
        results = str(self.results).split('</match>')[:-1]
        results_dict = []
        i = 0
        for result in results:
            result = result.strip().removeprefix('<match>')
            (sentid, sentence, ids, begins, xml_sentences, meta, _) \
                = result.split('||')
            sentid = sentid.strip() + '+match=' + str(i)
            results_dict.append({
                'sentid': sentid,
                'sentence': sentence,
                'ids': ids,
                'begins': begins,
                'xml_sentences': xml_sentences,
                'meta': meta,
            })
            i += 1
        return results_dict


class SearchQuery(models.Model):
    # User-defined fields
    components = models.ManyToManyField(Component)
    xpath = models.TextField()
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
                component=component
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
            maximum_results = to_number - from_number
        stop_adding = False
        results = []
        for result_obj in self.results.all().order_by('component'):
            # Add results to list, as long as no empty or partial search result
            # has been encountered.
            if not (stop_adding or result_obj.number_of_results is None):
                if to_skip >= result_obj.number_of_results:
                    # Skip completely
                    to_skip -= result_obj.number_of_results
                else:
                    comp_res = result_obj.parse_results()
                    results.extend(comp_res[to_skip:])
                    to_skip = 0
            # Count completed part (for all results)
            if result_obj.completed_part is not None:
                completed_part += result_obj.completed_part
            # If result is empty or partially complete, stop adding
            if not result_obj.search_completed:
                stop_adding = True
        search_percentage = 100 * completed_part / self.total_database_size
        return (results, search_percentage)

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
            print(result_obj)
            # Check if search has been completed by now by a concurrent
            # search. If so, continue
            result_obj.refresh_from_db()
            if result_obj.search_completed:
                continue
            try:
                result_obj.perform_search()
            except SearchError:
                raise
            self.completed_part += result_obj.completed_part
            self.save()

    @property
    def errors(self):
        # TODO collect errors
        pass
