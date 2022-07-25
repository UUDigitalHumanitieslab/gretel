from django.core.management.base import BaseCommand, CommandError


class Command(BaseCommand):
    help = 'Add LASSY corpus to BaseX database for use in GrETEL or ' \
           'for manual use.'

    def add_arguments(self, parser):
        parser.add_argument(
            'input_dir',
            help='input directory, which should contain a folder named COMPACT'
        )
        parser.add_argument(
            '--quiet',
            action='store_true',
            help='do not show progress messages; only show warnings and errors'
        )
        parser.add_argument(
            '--noninteractive',
            action='store_true',
            help='do not wait for user input and proceed with defaults'
        )
        parser.add_argument(
            '--group-by',
            help='group multiple files with the same prefix in one component '
                 '(see documentation for usage)',
            default=None
        )
        parser.add_argument(
            '--components-names',
            help='give user-friendly names to components that will be shown '
                 'in GrETEL according to a CSV file',
            default=None
        )

    def handle(self, *args, **options):
        pass
