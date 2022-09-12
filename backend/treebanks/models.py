from django.db import models
from django.db.models.signals import pre_delete
from django.dispatch import receiver
from django.contrib.auth.models import User
from django.conf import settings

import logging

from services.basex import basex
from search.basex_search import (
    generate_xquery_count_words, generate_xquery_count_sentences
)

logger = logging.getLogger(__name__)


class Treebank(models.Model):
    slug = models.SlugField(max_length=200, primary_key=True)
    title = models.CharField(max_length=1000)
    description = models.TextField(blank=True)
    url_more_info = models.URLField(blank=True)
    # The following fields are for user-uploaded treebanks only
    input_file = models.FileField(upload_to='uploaded_treebanks/', blank=True)
    upload_timestamp = models.DateTimeField(
        verbose_name='Upload date and time', null=True, blank=True
    )
    uploaded_by = models.ForeignKey(User, null=True, blank=True,
                                    on_delete=models.SET_NULL)
    public = models.BooleanField(default=True)
    sentence_tokenized = models.BooleanField(null=True)
    word_tokenized = models.BooleanField(null=True)
    sentences_have_labels = models.BooleanField(null=True)
    processed = models.DateTimeField(null=True, blank=True)
    variants = models.JSONField(blank=True, default=list)
    groups = models.JSONField(blank=True, default=dict)

    def __str__(self):
        return '{}'.format(self.slug)


class Component(models.Model):
    slug = models.SlugField(max_length=200)
    title = models.CharField(max_length=1000)
    description = models.TextField(blank=True)
    nr_sentences = models.PositiveIntegerField(
        verbose_name='Number of sentences'
    )
    nr_words = models.PositiveBigIntegerField(
        verbose_name='Number of words'
    )
    treebank = models.ForeignKey(Treebank, on_delete=models.CASCADE,
                                 related_name='components')
    variant = models.CharField(max_length=100, blank=True, default='')
    group = models.CharField(max_length=100, blank=True, default='')

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['slug', 'treebank'],
                                    name='one_slug_per_treebank')
        ]

    def __str__(self):
        return '{}: {}'.format(self.treebank, self.slug)

    def get_databases(self):
        '''Return a dictionary of all BaseX databases (keys) and their
        sizes in KiB (values)'''
        return {db['dbname']: db['size'] for db in self.databases.values()}

    @property
    def total_database_size(self):
        return self.databases.all().aggregate(models.Sum('size'))['size__sum']


class BaseXDB(models.Model):
    dbname = models.CharField(max_length=200, primary_key=True,
                              verbose_name='Database name')
    size = models.IntegerField(help_text='Size of BaseX database in KiB')
    component = models.ForeignKey(Component, on_delete=models.CASCADE,
                                  related_name='databases')

    class Meta:
        verbose_name = 'BaseX database'

    def __str__(self):
        return str(self.dbname)

    def get_db_size(self):
        """Get database size in KiB"""
        dbsize = int(basex.perform_query(
                        'db:property("{}", "size")'.format(self.dbname)
                    ))
        return int(dbsize / 1024)

    def get_number_of_words(self):
        return int(basex.perform_query(
            generate_xquery_count_words(self.dbname)
        ))

    def get_number_of_sentences(self):
        return int(basex.perform_query(
            generate_xquery_count_sentences(self.dbname)
        ))

    def delete_basex_db(self):
        """Delete this database from BaseX (called when BaseXDB objects
        are deleted)"""
        try:
            basex.get_session().execute('DROP DB {}'.format(self.dbname))
            logger.info('Deleted database {} from BaseX.'.format(self.dbname))
        except OSError as err:
            logger.error(
                'Cannot delete database {} from BaseX: {}.'
                .format(self.dbname, err)
            )


@receiver(pre_delete, sender=BaseXDB)
def delete_basex_db_callback(sender, instance, using, **kwargs):
    if settings.DELETE_COMPONENTS_FROM_BASEX is True:
        instance.delete_basex_db()
    else:
        logger.warning('Database {} was removed but corresponding BaseX '
                       'database was not deleted because setting '
                       'DELETE_COMPONENTS_FROM_BASEX is False.'
                       .format(str(instance)))
