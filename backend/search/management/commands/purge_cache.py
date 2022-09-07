from django.core.management.base import BaseCommand, CommandError
from search.models import ComponentSearchResult, SearchError


class Command(BaseCommand):
    help = 'Delete component search results that have the earliest ' \
           'last use date to make space'

    def handle(self, *args, **kwargs):
        try:
            ComponentSearchResult.purge_cache()
        except SearchError as err:
            raise CommandError(str(err))
