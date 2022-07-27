from django.db import models
from django.utils import timezone

from timeit import default_timer as timer

from treebanks.models import Component
from gretel.services import basex
from .basex_search import (generate_xquery_search, get_number_of_matches,
                           check_xpath)


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

    class SearchError(RuntimeError):
        pass

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
            if index < (len(databases) - 1):
                # Do a direct database update because this is faster than
                # calling save(). May yet be optimized by writing to the
                # database only after a certain number of milliseconds
                # have passed.
                ComponentSearchResult.objects.filter(pk=self.pk).update(
                    completed_part=self.completed_part,
                    number_of_results=self.number_of_results,
                    results=self.results
                )
        self.elapsed_time = (timer() - start_time) * 1000
        self.search_completed = timezone.now()
        self.save()


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
    completed_part = models.PositiveIntegerField(
        null=True, editable=False,
        help_text='Total size in KiB of databases for which the search has '
                  'been completed'
    )

    def perform_search(self):
        """Perform search and regularly update on progress"""
        print('Non-implemented method perform_search() called')

    def get_progress(self):
        """Read out search progress while perform_search() is running in
        a separate thread (or possibly has already been completed)"""
        print('Non-implemented method get_progress() called')
