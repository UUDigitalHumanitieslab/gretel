from django.db import models
from django.db.models.signals import pre_delete
from django.dispatch import receiver
from django.contrib.auth.models import User

import logging

from services.basex import basex

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

    def __str__(self):
        return '{} ({})'.format(self.title, self.slug)


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
    treebank = models.ForeignKey(Treebank, on_delete=models.CASCADE)
    total_database_size = models.PositiveIntegerField(
        default=0, editable=False,
        help_text='Total size in KiB of all databases for this component'
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['slug', 'treebank'],
                                    name='one_slug_per_treebank')
        ]

    def __str__(self):
        return '{} ({})'.format(self.title, self.slug)


class BaseXDB(models.Model):
    dbname = models.CharField(max_length=200, primary_key=True,
                              verbose_name='Database name')
    size = models.IntegerField(help_text='Size of BaseX database in KiB')
    component = models.ForeignKey(Component, on_delete=models.CASCADE)

    class Meta:
        verbose_name = 'BaseX database'

    def __str__(self):
        return str(self.dbname)

    def delete_basex_db(self):
        """Delete this database from BaseX (called when BaseXDB objects
        are deleted)"""
        try:
            basex.start()
            basex.session.execute('DROP DB {}'.format(self.dbname))
            logger.info('Deleted database {} from BaseX.'.format(self.dbname))
        except OSError as err:
            logger.error(
                'Cannot delete database {} from BaseX: {}.'
                .format(self.dbname, err)
            )


@receiver(pre_delete, sender=BaseXDB)
def delete_basex_db_callback(sender, instance, using, **kwargs):
    instance.delete_basex_db()
