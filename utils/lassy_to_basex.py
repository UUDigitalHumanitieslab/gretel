#!/usr/bin/env python3

import argparse
import os
import sys
import logging
import gzip
import zlib
import re
import signal
import csv
from BaseXClient import BaseXClient


class InputError(Exception):
    pass


class ArgumentError(Exception):
    pass


def userinputyesno(prompt, default=False):
    if default is True:
        default_view = ' [Y/n]'
    else:
        default_view = ' [y/N]'
    sys.stderr.write(prompt + default_view + '\n')
    if args.noninteractive:
        logging.warning('Automatically given default answer.')
        return default
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


def break_handler(signum, frame):
    logging.warning('Processing interrupted by user.')
    # Restore handling of Ctrl+C to default
    signal.signal(signal.SIGINT, signal.default_int_handler)
    # Wrap up so that the part that was added can be used
    wrap_up(incomplete=True)
    exit(1)


def process_file(input_filename):
    """
    Process a .data.dz file by extracting it, counting number of sentences and
    words and outputting to an XML file that is ready for BaseX

    :param input_filename: Path to input file
    :return: a tuple of the output, the number of sentences and number of words
    """
    global logging
    current_id = 0
    number_of_sentences = 0
    number_of_words = 0
    try:
        f = gzip.open(fileobj.path, 'r')
    except gzip.BadGzipFile:
        logging.error(
            'Cannot open {}: bad gzip file.'.format(fileobj.name)
        )
        raise InputError
    # Read whole file to make sure it is not corrupted
    lines = []
    try:
        for line in f:
            try:
                lines.append(line.decode())
            except UnicodeDecodeError:
                logging.error(
                    'Error in unicode decoding in file {}.'
                    .format(fileobj.name)
                )
                raise InputError
    except (gzip.BadGzipFile, zlib.error, EOFError):
        logging.error(
            'Cannot open {}: bad gzip file.'.format(fileobj.name)
        )
        raise InputError

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


def get_prefix_candidate(filename):
    """
    Discover the prefix of a given filename based on the --group-by argument
    given by the user.
    """
    if args.group_by.isnumeric():
        # The prefix consists of the first given number of characters
        # (entered as <number>)
        return filename[:int(args.group_by)]
    elif len(args.group_by) > 1 and args.group_by[1:].isnumeric():
        # The prefix runs until the given occurance of the given character
        # (entered as <character><number>)
        character = args.group_by[0]
        number = int(args.group_by[1:])
        # Thanks to https://stackoverflow.com/questions/1883980/
        # find-the-nth-occurrence-of-substring-in-a-string
        occurances = [x.start()
                      for x in re.finditer(re.escape(character), filename)]
        if len(occurances) >= number:
            return filename[:occurances[number - 1]]
        else:
            return None
    else:
        # Incorrect user input for the group_by argument
        raise ArgumentError


def break_script():
    """
    Break the script in an orderly manner at any time in the process.
    """
    wrap_up(incomplete=True)
    sys.exit(1)


def wrap_up(incomplete=False):
    """
    Give summary to user and set as complete in database.
    Use with incomplete=False if called in the middle of the script.
    """
    if processing_started:
        if args.group_by:
            logging.info(
                'Exported {} components ({} files) with {} sentences '
                'and {} words.'
                .format(
                    len(components), total_number_of_files,
                    total_number_of_sentences, total_number_of_words
                )
            )
        else:
            logging.info(
                'Exported {} components with {} sentences and {} words.'
                .format(
                    total_number_of_files,
                    total_number_of_sentences,
                    total_number_of_words
                )
            )
        if skipped_files:
            logging.warning(
                'Skipped {} (sub)components with a total of {} sentences '
                'and {} words.'
                .format(
                    skipped_files,
                    skipped_sentences,
                    skipped_words
                )
            )

        if incomplete is True:
            unprocessed_files = (len(inputfiles) - total_number_of_files -
                                 skipped_files)
            logging.warning(
                '{} out of {} files were not processed because the process '
                'was interrupted.'
                .format(unprocessed_files, len(inputfiles)))

        generate_csv_component_list(treebank_title + '_components.csv')
        generate_gretel_configuration(treebank_title.lower() + '.php')
        generate_parts_files('treebank-parts')


def generate_gretel_configuration(output_filename: str):
    """
    Generate a GrETEL configuration file as a PHP source file
    """
    with open(output_filename, 'w') as f:
        f.write(
            '<?php\n\n$tb = new TreebankInfo(\'{}\', array(\n'
            .format(treebank_title)
        )
        for component in components:
            f.write(
                '    new TreebankComponent('
                '\'' + components_id[component] + '\', ' +
                '\'' + component + '\', ' +
                str(components_number_of_sentences[component]) + ', ' +
                str(components_number_of_words[component]) + ', ' +
                'null, null, null, false, null, null),\n'
            )
        f.write('));\n\nregisterTreebank($tb);\n')
    logging.info(
        'GrETEL configuration file written to {}'.format(output_filename)
    )


def generate_csv_component_list(output_filename: str):
    """
    Generate a component list as a CSV file for manual use
    """
    with open(output_filename, 'w') as f:
        writer = csv.writer(f, dialect='excel')
        writer.writerow(['Treebank', 'Component', 'ID/BaseX database',
                         'BaseX child databases',
                         'Number of sentences', 'Number of words'])
        for component in components:
            writer.writerow([
                treebank_title,
                component,
                components_id[component],
                ', '.join(components_child_databases[component]),
                components_number_of_sentences[component],
                components_number_of_words[component],
            ])
    logging.info(
        'List of components written to {}'.format(output_filename)
    )


def generate_parts_files(output_directory: str):
    if not args.group_by:
        return
    os.makedirs(output_directory, exist_ok=True)
    for component in components:
        f = open(os.path.join(
            output_directory,
            components_id[component] + '.lst'
        ), 'w')
        f.write('\n'.join(components_child_databases[component]))
        f.close()
    logging.info(
        'GrETEL treebank parts configuration files written to {}.'
        .format(output_directory)
    )


def get_commandline_arguments():
    """
    Return commandline arguments from argparse
    """
    parser = argparse.ArgumentParser(
        description='Add LASSY corpus to BaseX database for use in GrETEL or '
                    'for manual use.'
    )
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
        help='group multiple files with the same prefix in one component (see '
             'documentation for usage)',
        default=None
    )
    return parser.parse_args()


def get_all_dz_files(dirname: str) -> list:
    """
    Get a DirEntry list of all .dz files in a directory and its subdirectories
    """
    try:
        compactdir = os.scandir(dirname)
    except FileNotFoundError:
        logging.error(
            'Directory {} does not exist. Quitting.'
            .format(dirname)
        )
        break_script()
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
        logging.error(
            'Directory {} (or its subdirectories) does not contain .dz files. '
            'Quitting.'
            .format(compactdirname))
        break_script()
    inputfiles.sort(key=lambda x: x.path)
    return inputfiles


def get_basex_db_name(treebank_db_name: str, component_name: str) -> str:
    return treebank_db_name + '_' + component_name.upper()


args = get_commandline_arguments()
signal.signal(signal.SIGINT, break_handler)

processing_started = False

if not args.quiet:
    logging.basicConfig(level=logging.INFO)

# If group_by is given, check if the argument is in the correct format
if args.group_by is not None:
    try:
        get_prefix_candidate('test_string')
    except ArgumentError:
        logging.error(
            'Argument for --group-by option is incorrect - please refer '
            'to the documentation.')
        break_script()

# Import settings from lassy_import_settings.py.
try:
    from lassy_to_basex_settings import (
        BASEX_HOST, BASEX_PORT, BASEX_USER, BASEX_PASSWORD
    )
except ImportError:
    BASEX_HOST = 'localhost'
    BASEX_PORT = 1984
    BASEX_USER = 'admin'
    BASEX_PASSWORD = 'admin'
    logging.warning('lassy_to_basex_settings.py not found; using defaults')

# Get list of input files in alphabetical order as DirEntry objects
compactdirname = os.path.join(args.input_dir, 'COMPACT')
inputfiles = get_all_dz_files(compactdirname)
logging.info('Found {} files to process.'.format(len(inputfiles)))

# Open BaseX session
try:
    session = BaseXClient.Session(
        BASEX_HOST, BASEX_PORT, BASEX_USER, BASEX_PASSWORD
    )
except ConnectionRefusedError:
    logging.error('BaseX connection refused - is it running?')
    break_script()

# Remove trailing slash because os.path.basename would return empty string
input_dir = args.input_dir
if input_dir[-1:] == os.path.sep:
    input_dir = input_dir[:-1]
treebank_title = os.path.basename(input_dir)

treebank_db = treebank_title.upper() + '_ID'

# Check if BaseX databases already exist
all_basex_dbs = session.execute('LIST').split('\n')
current_dbs = [x[0:x.find(' ')]
               for x in all_basex_dbs
               if x[0:len(treebank_db)] == treebank_db]
if len(current_dbs) > 0:
    logging.error(
        '{} BaseX databases for this treebank already exist.'
        .format(len(current_dbs))
    )
    if userinputyesno('Delete them? (necessary to continue)', True):
        for db in current_dbs:
            session.execute('DROP DB {}'.format(db))
        logging.info('Deleted existing BaseX databases.')
    else:
        break_script()

# Start the processing
total_number_of_files = 0
total_number_of_sentences = 0
total_number_of_words = 0
skipped_files = 0
skipped_sentences = 0
skipped_words = 0

current_component = None
components = []
components_number_of_sentences = {}
components_number_of_words = {}
components_id = {}
components_child_databases = {}

processing_started = True

# Extract all dz files in separate xml files; make a component (separate
# BaseX database) for every file
for fileobj in inputfiles:
    success = False
    if fileobj.name[-8:] == '.data.dz':
        file_title = fileobj.name[:-8]
    else:
        file_title = fileobj.name
    # If a new prefix is detected, or if no grouping applies, start a new
    # component
    if args.group_by:
        prefix = get_prefix_candidate(fileobj.name)
        if prefix is None:
            prefix = 'main_group'
        if current_component != prefix:
            current_component = prefix
            components.append(current_component)
            components_number_of_sentences[current_component] = 0
            components_number_of_words[current_component] = 0
            components_child_databases[current_component] = []
            components_id[current_component] = treebank_db + '_' + \
                prefix.upper()
            logging.info(
                'Found new prefix {} - starting new component.'
                .format(current_component)
            )
    else:
        current_component = file_title
        components.append(current_component)
        components_child_databases[current_component] = []
        components_id[current_component] = treebank_db + '_' + \
            file_title.upper()
    try:
        output, number_of_sentences, number_of_words = process_file(
            fileobj.path)
    except InputError:
        logging.error('Cannot read file {}.'.format(fileobj.name))
    else:
        logging.info(
            'Extracted file {}: {} sentences, {} words.'
            .format(fileobj.name, number_of_sentences, number_of_words)
        )
        if args.group_by:
            basex_db = treebank_db + '_' + file_title.upper()
            components_number_of_sentences[current_component] += \
                number_of_sentences
            components_number_of_words[current_component] += number_of_words
            components_child_databases[current_component].append(basex_db)
        else:
            basex_db = components_id[current_component]
            components_number_of_words[current_component] = number_of_words
            components_number_of_sentences[current_component] = \
                number_of_sentences
        # Add to BaseX and wrap up if this succeeds
        try:
            session.create(basex_db, output)
        except OSError as err:
            logging.error(
                'Adding file {} to BaseX failed: {}.'
                .format(fileobj.name, err)
            )
        else:
            # Adding to BaseX succeeded
            total_number_of_files += 1
            total_number_of_sentences += number_of_sentences
            total_number_of_words += number_of_words
            success = True
            progress = int((total_number_of_files + skipped_files) /
                           len(inputfiles) * 100)
            logging.info(
                'Successfully added contents of {} to BaseX. '
                'Progress: {}%'.format(fileobj.name, progress)
            )
    if not success:
        logging.warning(
            'Could not add {} to BaseX because of errors - skipped.'
            .format(fileobj.name)
        )
        skipped_files += 1
        skipped_sentences += number_of_sentences
        skipped_words += number_of_words

wrap_up()
