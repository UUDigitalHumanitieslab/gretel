from django.contrib import admin
from django.contrib import messages
from django.utils import formats

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


@admin.register(SearchQuery)
class SearchQueryAdmin(admin.ModelAdmin):
    list_display = ['id', 'xpath', 'query_of', 'total_database_size']
    readonly_fields = ['total_database_size']

    def query_of(self, obj):
        return str(obj.components.all().first()) + ', …'


@admin.register(ComponentSearchResult)
class ComponentSearchResultAdmin(admin.ModelAdmin):
    list_display = ['component', 'xpath', 'search_completed',
                    'number_of_results']
    actions = [perform_search]
    readonly_fields = ['search_completed', 'last_accessed',
                       'number_of_results', 'errors', 'completed_part',
                       'cache_size']
