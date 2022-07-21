from .models import Treebank, Component
from .serializers import TreebankSerializer, ComponentSerializer
from rest_framework import viewsets


class TreebankViewset(viewsets.ModelViewSet):
    # TODO: make sure that non-public treesets are hidden if needed
    queryset = Treebank.objects.all().order_by('slug')
    serializer_class = TreebankSerializer


class ComponentViewset(viewsets.ModelViewSet):
    # TODO: make sure that components of non-public treebanks are hidden if
    # needed
    queryset = Component.objects.all().order_by('slug')
    serializer_class = ComponentSerializer
