from rest_framework import serializers

from .models import CanonicalForm, XPathQuery


class CanonicalFormSerializer(serializers.ModelSerializer):
    class Meta:
        model = CanonicalForm
        fields = ['id', 'text']


class MweQuerySerializer(serializers.Serializer):
    xpath = serializers.CharField()
    description = serializers.CharField()
    rank = serializers.IntegerField()


class XPathQuerySerializer(serializers.ModelSerializer):
    class Meta:
        model = XPathQuery
        fields = ['id', 'canonical', 'xpath', 'description', 'rank']
