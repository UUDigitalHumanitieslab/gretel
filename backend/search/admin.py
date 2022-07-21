from django.contrib import admin

from .models import ComponentSearchResult


@admin.register(ComponentSearchResult)
class ComponentSearchResultAdmin(admin.ModelAdmin):
    list_display = ['component', 'xpath', 'search_completed',
                    'number_of_results']
