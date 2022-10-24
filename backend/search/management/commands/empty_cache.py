from django.core.management.base import BaseCommand, CommandError
from search.models import ComponentSearchResult, SearchError


class Command(BaseCommand):
    help = 'Delete all component search results to avoid problems ' \
           'concerning compatibility with older GrETEL versions ' \
           'after an upgrade'

    def handle(self, *args, **kwargs):
        try:
            count = ComponentSearchResult.empty_cache()
        except SearchError as err:
            raise CommandError(str(err))
        self.stdout.write(self.style.SUCCESS(
            '{} cached component search results deleted'
            .format(count)
        ))
