from .models import Treebank, Component
from rest_framework import serializers


class TreebankSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Treebank
        fields = ['slug', 'title']


class ComponentSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Component
        fields = ['slug', 'title']
