from django.core.management.base import BaseCommand, CommandError
from django.utils.text import slugify
from django.utils import timezone

import os
import sys
import gzip
import zlib
import re
import csv

from treebanks.models import Treebank, Component, BaseXDB

from BaseXClient import BaseXClient

BASEX_HOST = 'localhost'
BASEX_PORT = 1984
BASEX_USER = 'admin'
BASEX_PASSWORD = 'admin'


def userinputyesno(prompt, default=False):
    if default is True:
        default_view = ' [Y/n]'
    else:
        default_view = ' [y/N]'
    sys.stderr.write(prompt + default_view + '\n')
    answer = input()
    if answer[:1].lower() == 'y':
        return True
    elif answer[:1].lower() == 'n':
        return False
    elif answer.strip() == '':
        return default
    else:
        sys.stderr.write('Invalid answer given.\n')
        return userinputyesno(prompt, default)


class BaseXService:
    session = None

    def perform_query(self, query):
        if self.session is None:
            try:
                self.start()
            except ConnectionError:
                raise
        return self.session.query(query).execute()

    def start(self):
        if self.session is None:
            try:
                self.session = BaseXClient.Session(
                    BASEX_HOST, BASEX_PORT, BASEX_USER, BASEX_PASSWORD
                )
            except ConnectionError:
                raise


basex = BaseXService()


class Command(BaseCommand):
    help = 'Add LASSY corpus to BaseX database for use in GrETEL or ' \
           'for manual use.'

    def add_arguments(self, parser):
        parser.add_argument(
            'input_dir',
            help='input directory, which should contain a folder named COMPACT'
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

    class InputError(RuntimeError):
        pass

    class ArgumentError(RuntimeError):
        pass

    def process_file(self, input_filename):
        """
        Process a .data.dz file by extracting it, counting number of sentences
        and words and outputting to an XML file that is ready for BaseX

        :param input_filename: Path to input file
        :return: a tuple of the output, the number of sentences and number of
        words
        """
        current_id = 0
        number_of_sentences = 0
        number_of_words = 0
        try:
            f = gzip.open(input_filename, 'r')
        except gzip.BadGzipFile:
            self.stdout.write(self.style.ERROR(
                'Cannot open {}: bad gzip file.'.format(input_filename)
            ))
            raise self.InputError
        # Read whole file to make sure it is not corrupted
        lines = []
        try:
            for line in f:
                try:
                    lines.append(line.decode())
                except UnicodeDecodeError:
                    self.stdout.write(self.style.ERROR(
                        'Error in unicode decoding in file {}.'
                        .format(input_filename)
                    ))
                    raise self.InputError
        except (gzip.BadGzipFile, zlib.error, EOFError):
            self.stdout.write(self.style.ERROR(
                'Cannot open {}: bad gzip file.'.format(input_filename)
            ))
            raise self.InputError

        output = '<treebank>\n'

        for line in lines:
            if line[0:5] == '<?xml':
                number_of_sentences += 1
                continue  # Do not include <?xml line in output file
            if 'cat="top"' in line:
                # Like gretel-upload, determine number of words using the
                # 'end' attribute in the top-level node
                number_of_words += int(
                    re.search('end=\"(.+?)\"', line).group(1)
                )
            if '<alpino_ds' in line:
                # Add id to the end of the tag for identification in GrETEL
                tagend_pos = line.find('>')
                id_attr = ' id="{}:{}"'.format(input_filename, current_id)
                line = line[:tagend_pos] + id_attr + line[tagend_pos:]
                current_id += 1
            output += line

        output += '</treebank>'
        return (output, number_of_sentences, number_of_words)

    def determine_component_id(self, filename: str):
        """
        Discover the component id for a given filename based on the --group-by
        argument given by the user.
        """
        if not self.group_by:
            return filename
        if self.group_by.isnumeric():
            # The prefix consists of the first given number of characters
            # (entered as <number>)
            return filename[:int(self.group_by)]
        elif len(self.group_by) > 1 and self.group_by[1:].isnumeric():
            # The prefix runs until the given occurance of the given character
            # (entered as <character><number>)
            character = self.group_by[0]
            number = int(self.group_by[1:])
            # Thanks to https://stackoverflow.com/questions/1883980/
            # find-the-nth-occurrence-of-substring-in-a-string
            occurances = [x.start()
                          for x in re.finditer(re.escape(character), filename)]
            if len(occurances) >= number:
                return filename[:occurances[number - 1]]
            else:
                # Separate component if file does not belong to group
                return filename
        else:
            # Incorrect user input for the group_by argument
            raise self.ArgumentError

    def get_all_dz_files(self, dirname: str) -> list:
        """
        Get a DirEntry list of all .dz files in a directory and its subdirs
        """
        try:
            compactdir = os.scandir(dirname)
        except FileNotFoundError:
            raise CommandError(
                'Directory {} does not exist. Quitting.'
                .format(dirname)
            )
        inputfiles = []
        for fileobj in (x for x in compactdir):
            if fileobj.is_file() and fileobj.name[-3:] == '.dz':
                inputfiles.append(fileobj)
            elif fileobj.is_dir():
                subdir = os.scandir(fileobj.path)
                dzfiles = (x for x in subdir if
                           (x.is_file and x.name[-3:] == '.dz'))
                for fileobj2 in dzfiles:
                    inputfiles.append(fileobj2)
        if not inputfiles:
            raise CommandError(
                'Directory {} (or its subdirectories) does not contain .dz '
                'files. Quitting.'
                .format(dirname))
        inputfiles.sort(key=lambda x: x.path)
        return inputfiles

    def get_basex_db_name(self, treebank_db_name: str,
                          component_name: str) -> str:
        return treebank_db_name + '_' + component_name.upper()

    def wrap_up(self, incomplete=False):
        """
        Give summary to user and set as complete in database.
        Use with incomplete=False if called in the middle of the script.
        """
        self.stdout.write(self.style.SUCCESS(
            'Exported {} components ({} files) with {} sentences '
            'and {} words.'
            .format(
                self.number_of_components, self.total_number_of_files,
                self.total_number_of_sentences, self.total_number_of_words
            )
        ))
        if self.skipped_files:
            self.stdout.write(self.style.WARNING(
                'Skipped {} (sub)components with a total of {} sentences '
                'and {} words.'
                .format(
                    self.skipped_files,
                    self.skipped_sentences,
                    self.skipped_words
                )
            ))
        self.treebank.processed = timezone.now()
        self.treebank.save()

    def handle(self, *args, **options):
        self.group_by = options['group_by']
        self.input_dir = options['input_dir']

        # Load list of user-friendly components names, if given
        self.components_names = {}
        if options['components_names']:
            try:
                f = open(options['components_names'], 'r')
                reader = csv.reader(f)
                self.components_names = {x[0]: x[1] for x in reader}
            except FileNotFoundError:
                raise CommandError('Components names CSV file not found.')
            except csv.Error:
                raise CommandError('Error processing components names file.')
            except IndexError:
                raise CommandError(
                    'Components names file may be correct CSV file but it '
                    'contains lines with fewer than two columns.'
                )

        # If group_by is given, check if the argument is in the correct format
        if self.group_by is not None:
            try:
                self.determine_component_id('test_string')
            except self.ArgumentError:
                raise CommandError(
                    'Incorrect argument for --group-by option - please refer '
                    'to the documentation.')

        # Get list of input files in alphabetical order as DirEntry objects
        compactdirname = os.path.join(self.input_dir, 'COMPACT')
        self.inputfiles = self.get_all_dz_files(compactdirname)
        self.stdout.write(self.style.SUCCESS('Found {} files to process.'
                                             .format(len(self.inputfiles))))

        try:
            basex.start()
        except ConnectionError as err:
            raise CommandError('Cannot connect to BaseX: {}. '
                               'This command needs BaseX to run.'
                               .format(err))

        # Remove trailing slash because os.path.basename would return empty
        # string
        if self.input_dir[-1:] == os.path.sep:
            self.input_dir = self.input_dir[:-1]
        treebank_title = os.path.basename(self.input_dir)
        treebank_db = treebank_title.upper() + '_ID'

        # Check if treebank already exists
        treebank_slug = slugify(treebank_title)
        try:
            existing_treebank = Treebank.objects.get(slug=treebank_slug)
        except Treebank.DoesNotExist:
            pass
        else:
            self.stdout.write(self.style.WARNING(
                'Treebank {} already exists.'.format(treebank_slug)
            ))
            if userinputyesno('Delete existing treebank?', True):
                existing_treebank.delete()
                self.stdout.write(self.style.SUCCESS(
                    'Deleted existing treebank.'
                ))
            else:
                raise CommandError(
                    'Cannot continue without deleting existing treebank.'
                )

        self.treebank = Treebank()
        self.treebank.title = treebank_title
        self.treebank.slug = treebank_slug
        self.treebank.save()

        # Check if BaseX databases already exist
        all_basex_dbs = basex.session.execute('LIST').split('\n')
        current_dbs = [x[0:x.find(' ')]
                       for x in all_basex_dbs
                       if x[0:len(treebank_db)] == treebank_db]
        if len(current_dbs) > 0:
            self.stdout.write(self.style.WARNING(
                '{} BaseX databases with prefix {} already exist.'
                .format(len(current_dbs), treebank_db)
            ))
            if userinputyesno('Delete them? (necessary to continue)', True):
                for db in current_dbs:
                    basex.session.execute('DROP DB {}'.format(db))
                self.stdout.write(self.style.SUCCESS(
                    'Deleted existing BaseX databases.'
                ))
            else:
                raise CommandError(
                    'Cannot continue without deleting existing databases'
                )

        # Start the processing
        self.total_number_of_files = 0
        self.total_number_of_sentences = 0
        self.total_number_of_words = 0
        self.number_of_components = 0
        self.skipped_files = 0
        self.skipped_sentences = 0
        self.skipped_words = 0

        current_comp_id = None

        # Extract all dz files in separate xml files; make a BaseX database
        # for every file and put them in components according to the user's
        # preferences
        for fileobj in self.inputfiles:
            success = False
            if fileobj.name.endswith('.data.dz'):
                file_title = fileobj.name[:-8]
            else:
                file_title = fileobj.name
            # Start new component if a new component id is detected
            comp_id = self.determine_component_id(file_title)
            if current_comp_id != comp_id:
                component = Component()
                component.nr_sentences = 0
                component.nr_words = 0
                component.slug = slugify(comp_id)
                component.title = self.components_names.get(comp_id, comp_id)
                component.treebank = self.treebank
                component.save()
                self.stdout.write(
                    'Starting new component {}.'
                    .format(comp_id)
                )
                self.number_of_components += 1
                current_comp_id = comp_id
            try:
                output, number_of_sentences, number_of_words = \
                    self.process_file(fileobj.path)
            except self.InputError:
                self.stdout.write(self.style.ERROR(
                    'Cannot read file {}.'.format(fileobj.name)
                ))
            else:
                # Determine BaseX database name
                basex_db = treebank_db + '_' + file_title.upper()
                # Add to BaseX and wrap up if this succeeds
                try:
                    basex.session.create(basex_db, output)
                    # Get database size in KiB
                    dbsize = int(basex.perform_query(
                        'db:property("{}", "size")'.format(basex_db)
                    ))
                    dbsize_kib = int(dbsize / 1024)
                except OSError as err:
                    self.stdout.write(self.style.ERROR(
                        'Adding file {} to BaseX failed: {}.'
                        .format(fileobj.name, err)
                    ))
                else:
                    # Adding to BaseX succeeded; save to database
                    component.nr_sentences += number_of_sentences
                    component.nr_words += number_of_words
                    component.save()
                    basexdb_obj = BaseXDB(dbname=basex_db, size=dbsize_kib)
                    basexdb_obj.component = component
                    basexdb_obj.save()
                    self.total_number_of_files += 1
                    self.total_number_of_sentences += number_of_sentences
                    self.total_number_of_words += number_of_words
                    success = True
                    progress = int((self.total_number_of_files +
                                    self.skipped_files) / len(self.inputfiles)
                                   * 100)
                    self.stdout.write(
                        'Successfully added contents of {} to BaseX. '
                        'Progress: {}%'.format(fileobj.name, progress)
                    )
            if not success:
                self.stdout.write(self.style.WARNING(
                    'Could not add {} to BaseX because of errors - skipped.'
                    .format(fileobj.name)
                ))
                self.skipped_files += 1
                self.skipped_sentences += number_of_sentences
                self.skipped_words += number_of_words

        self.wrap_up()
