from .models import Treebank, Component
from rest_framework import serializers


class TreebankSerializer(serializers.ModelSerializer):
    class Meta:
        model = Treebank
        fields = ['slug', 'title', 'description', 'url_more_info']


class ComponentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Component
        fields = ['slug', 'title', 'description', 'nr_sentences', 'nr_words']
