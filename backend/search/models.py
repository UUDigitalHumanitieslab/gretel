from django.db import models

from treebanks.models import Component


class ComponentSearchResult(models.Model):
    xpath = models.TextField()
    component = models.ForeignKey(Component, on_delete=models.CASCADE)
    search_completed = models.DateTimeField(null=True, editable=False)
    last_accessed = models.DateField(null=True, editable=False)
    results = models.TextField(default='', editable=False)
    number_of_results = models.PositiveIntegerField(null=True, editable=False)
    completed_part = models.PositiveIntegerField(
        null=True, editable=False,
        help_text='Total size in KiB of databases for which the search has '
                  'been completed'
    )

    def __str__(self):
        return '"{}…" for {}'.format(self.xpath[:10], self.component)

    def perform_search(self):
        """Perform full component search and regularly update on progress"""
        print('Non-implemented method perform_search() called')


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
