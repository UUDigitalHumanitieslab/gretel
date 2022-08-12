from django.contrib import admin
from django.contrib import messages
from django.utils import formats

import threading

from .models import ComponentSearchResult, SearchQuery, SearchError


@admin.action(description='Perform search')
def perform_search(modeladmin, request, queryset):
    '''Admin action to manually perform search for debug purposes'''
    errors = False
    for component_search in queryset:
        try:
            component_search.perform_search()
            if component_search.errors:
                errors = True
        except SearchError:
            errors = True
    if not errors:
        modeladmin.message_user(request,
                                'Component search has successfully completed',
                                messages.SUCCESS)
    else:
        modeladmin.message_user(request,
                                'Component search has completed with errors',
                                messages.WARNING)


@admin.action(description='Perform search (parallel)')
def perform_search_parallel(modeladmin, request, queryset):
    '''Admin action to perform search in separate thread;
    no error reporting.'''
    thread = threading.Thread(target=perform_search,
                              args=(modeladmin, request, queryset))
    thread.start()


@admin.register(SearchQuery)
class SearchQueryAdmin(admin.ModelAdmin):
    list_display = ['id', 'xpath', 'query_of', 'total_database_size',
                    'completed_part', 'completed_percentage']
    readonly_fields = ['total_database_size', 'completed_part']

    def completed_percentage(self, obj):
        if not (obj.completed_part and obj.total_database_size):
            return 'Not started'
        return str(formats.localize(round(
            obj.completed_part / obj.total_database_size * 100, 1
        ))) + '%'

    def query_of(self, obj):
        return str(obj.components.all().first()) + ', …'


@admin.register(ComponentSearchResult)
class ComponentSearchResultAdmin(admin.ModelAdmin):
    list_display = ['component', 'xpath', 'search_completed',
                    'number_of_results']
    actions = [perform_search,
               perform_search_parallel]
    readonly_fields = ['search_completed', 'last_accessed',
                       'number_of_results', 'errors', 'completed_part',
                       'results']
