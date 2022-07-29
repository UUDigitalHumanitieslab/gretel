from .models import Treebank, Component
from rest_framework import serializers


class TreebankSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Treebank
        fields = ['slug', 'title', 'description', 'url_more_info']


class ComponentSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Component
        fields = ['slug', 'title']
