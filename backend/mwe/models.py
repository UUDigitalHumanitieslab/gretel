from django.db import models

from rest_framework import serializers


class CanonicalForm(models.Model):
    text = models.TextField(unique=True)


class CanonicalFormSerializer(serializers.ModelSerializer):
    class Meta:
        model = CanonicalForm
        fields = ['id', 'text']


class XPathQuery(models.Model):
    canonical = models.ForeignKey(CanonicalForm, on_delete=models.PROTECT)
    query = models.TextField()
    description = models.CharField(max_length=200)
    rank = models.PositiveSmallIntegerField()

    def xpath(self):
        return self.query

class XPathQuerySerializer(serializers.ModelSerializer):
    class Meta:
        model = XPathQuery
        fields = ['id', 'canonical', 'xpath', 'description', 'rank']
