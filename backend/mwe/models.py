from django.db import models

from rest_framework import serializers


class CanonicalForm(models.Model):
    text = models.TextField(unique=True)

    def __str__(self):
        return self.text


class CanonicalFormSerializer(serializers.ModelSerializer):
    class Meta:
        model = CanonicalForm
        fields = ['id', 'text']


class XPathQuery(models.Model):
    class Meta:
        verbose_name = 'XPath Query'
        verbose_name_plural = 'XPath Queries'

    canonical = models.ForeignKey(CanonicalForm, on_delete=models.PROTECT)
    xpath = models.TextField()
    description = models.CharField(max_length=200)
    rank = models.PositiveSmallIntegerField()


class XPathQuerySerializer(serializers.ModelSerializer):
    class Meta:
        model = XPathQuery
        fields = ['id', 'canonical', 'xpath', 'description', 'rank']
