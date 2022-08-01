from .models import Treebank, Component
from .serializers import TreebankSerializer, ComponentSerializer
from rest_framework import viewsets, status
from rest_framework.decorators import api_view
from rest_framework.response import Response


class TreebankViewset(viewsets.ReadOnlyModelViewSet):
    # TODO: make sure that non-public treesets are hidden if needed
    queryset = Treebank.objects.all().order_by('slug')
    serializer_class = TreebankSerializer


@api_view(['GET'])
def components_for_treebank_view(request, treebank):
    try:
        treebank = Treebank.objects.get(slug=treebank)
        # TODO: test if treebank is public and if not if it is accessible
    except Treebank.DoesNotExist:
        return Response(None, status=status.HTTP_404_NOT_FOUND)
    components = Component.objects.filter(treebank=treebank)
    serializer = ComponentSerializer(components, many=True)
    return Response(serializer.data)
