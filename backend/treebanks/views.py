from .models import Treebank
from .serializers import TreebankSerializer, ComponentSerializer
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response


@api_view(['GET'])
def treebank_view(request):
    # TODO: make sure that non-public treesets are hidden if needed
    treebanks = Treebank.objects.all() \
        .exclude(slug__startswith='GRETEL-UPLOAD-')
    serializer = TreebankSerializer(treebanks, many=True)
    return Response(serializer.data)


@api_view(['GET'])
def treebank_components_view(request, treebank):
    try:
        treebank = Treebank.objects.get(slug=treebank)
        # TODO: test if treebank is public and if not if it is accessible
    except Treebank.DoesNotExist:
        return Response(None, status=status.HTTP_404_NOT_FOUND)
    components = treebank.components
    serializer = ComponentSerializer(components, many=True)
    return Response(serializer.data)
