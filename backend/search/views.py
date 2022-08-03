from rest_framework.response import Response
from rest_framework.decorators import (
    api_view, parser_classes, renderer_classes
)
from rest_framework.parsers import JSONParser
from rest_framework.renderers import JSONRenderer, BrowsableAPIRenderer
from rest_framework import status

from treebanks.models import Component
from .models import SearchQuery


@api_view(['POST'])
@renderer_classes([JSONRenderer, BrowsableAPIRenderer])
@parser_classes([JSONParser])
def search_start(request):
    data = request.data
    try:
        xpath = data['xpath']
        treebank = data['treebank']
        components = data['components']
    except KeyError as err:
        return Response(
            {'error': '{} is missing'.format(err)},
            status=status.HTTP_400_BAD_REQUEST
        )
    components_obj = Component.objects.filter(
        slug__in=components,
        treebank__slug=treebank
    )

    query = SearchQuery(xpath=xpath)
    query.save()
    query.components.add(*components_obj)
    query.initialize()
    # query.perform_search()
    results, percentage = query.get_results()
    results = str(results)
    response = {
        'query_id': query.id,
        'search_percentage': percentage,
        'results': results,
    }
    return Response(response)
