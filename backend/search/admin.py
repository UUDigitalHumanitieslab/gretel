from django.contrib import admin
from django.contrib import messages

import threading

from .models import ComponentSearchResult


@admin.register(ComponentSearchResult)
class ComponentSearchResultAdmin(admin.ModelAdmin):
    list_display = ['component', 'xpath', 'search_completed',
                    'number_of_results', 'elapsed_time']
    actions = ['perform_component_search',
               'perform_component_search_parallel']
    readonly_fields = ['search_completed', 'last_accessed',
                       'number_of_results', 'errors', 'completed_part',
                       'elapsed_time', 'results']

    @admin.action(description='Perform component search')
    def perform_component_search(self, request, queryset):
        '''Admin action to manually perform component search for debug
        purposes'''
        errors = False
        for component_search in queryset:
            try:
                component_search.perform_search()
                if component_search.errors:
                    errors = True
            except component_search.SearchError:
                errors = True
        if not errors:
            self.message_user(request,
                              'Component search has successfully completed',
                              messages.SUCCESS)
        else:
            self.message_user(request,
                              'Component search has completed with errors',
                              messages.WARNING)

    @admin.action(description='Perform component search (parallel)')
    def perform_component_search_parallel(self, request, queryset):
        '''Admin action to perform component search in separate thread;
        no error reporting.'''
        thread = threading.Thread(target=self.perform_component_search,
                                  args=(request, queryset))
        thread.start()
