from django.core.management.base import BaseCommand, CommandError
from django.utils.text import slugify
from django.utils import timezone

import os
import sys
import glob
import gzip
import zlib
import re
import csv
import json

from treebanks.models import Treebank, Component, BaseXDB
from services.basex import basex


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


class Command(BaseCommand):
    help = 'Add treebank for which BaseX databases already exist'

    def add_arguments(self, parser):
        parser.add_argument(
            'configuration',
            help='JSON configuration file'
        )

    class InputError(RuntimeError):
        pass

    class ArgumentError(RuntimeError):
        pass

    def create_database(self, dbname: str):
        # Get database size (and check if it exists)
        basex_db = BaseXDB(dbname)
        basex_db.size = basex_db.get_db_size()
        return basex_db

    def create_component(self, comp: dict):
        try:
            slug = comp['slug']
            title = comp['title']
            description = comp['description']
            databases = comp['databases']
        except KeyError as err:
            raise CommandError('Key {} missing in component definition.'
                               .format(err))
        component = Component(slug=slug, title=title,
                              description=description)
        component.treebank = self.treebank
        basex_dbs = []
        nr_words = 0
        nr_sentences = 0
        for dbname in databases:
            basex_db = self.create_database(dbname)
            basex_dbs.append(basex_db)
        component.nr_words = nr_words
        component.nr_sentences = nr_sentences
        return component

    def handle(self, *args, **options):
        if not basex.test_connection():
            raise CommandError('Cannot connect to BaseX. '
                               'This command needs BaseX to run.')

        config_file = options['configuration']
        try:
            self.configuration = json.loads(open(config_file, 'r').read())
        except OSError as err:
            raise CommandError('Cannot open configuration file: {}.'
                               .format(str(err)))
        except json.JSONDecodeError as err:
            raise CommandError('Cannot parse configuration file: {}.'
                               .format(str(err)))

        self.treebank = Treebank()
        try:
            self.treebank.slug = self.configuration['slug']
            self.treebank.title = self.configuration['title']
            self.config_components = self.configuration['components']
        except KeyError as err:
            raise CommandError('Key {} missing from configuration file.'
                               .format(err))
        if Treebank.objects.filter(slug=self.treebank.slug).count() != 0:
            raise CommandError('Treebank {} already exists.'
                               .format(self.treebank.slug))

        components = []
        for component in self.config_components:
            components.append(self.create_component(component))

        self.treebank.save()
        for component in components:
            component.save()
