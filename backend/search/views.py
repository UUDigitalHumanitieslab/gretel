from rest_framework.response import Response
from rest_framework.decorators import (
    api_view, parser_classes, renderer_classes, authentication_classes
)
from rest_framework.parsers import JSONParser
from rest_framework.renderers import JSONRenderer, BrowsableAPIRenderer
from rest_framework.authentication import BasicAuthentication
from rest_framework import status
from django.conf import settings

import threading

from treebanks.models import Component
from .models import SearchQuery


def run_search(query_obj) -> None:
    query_obj.perform_search()


@api_view(['POST'])
@authentication_classes([BasicAuthentication])  # No CSRF verification for now
@renderer_classes([JSONRenderer, BrowsableAPIRenderer])
@parser_classes([JSONParser])
def search_view(request):
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
    query_id = data.get('query_id', None)
    start_from = data.get('start_from', 0)
    is_analysis = data.get('is_analysis', False)
    if is_analysis:
        maximum_results = settings.MAXIMUM_RESULTS_ANALYSIS
    else:
        maximum_results = settings.MAXIMUM_RESULTS

    if query_id:
        new_query = False
        try:
            # We also require the right XPath to avoid the possibility of
            # tampering with queries of other users.
            # TODO: also check if the component list is correct
            query = SearchQuery.objects.get(xpath=xpath, pk=query_id)
        except SearchQuery.DoesNotExist:
            return Response(
                {'error': 'Cannot find given query_id'},
                status=status.HTTP_400_BAD_REQUEST
            )
    else:
        new_query = True
        query = SearchQuery(xpath=xpath)
        query.save()
        query.components.add(*components_obj)
        query.initialize()

    # Get results so far, if any
    results, percentage = query.get_results(start_from, maximum_results)
    if request.accepted_renderer.format == 'api':
        results = str(results)[0:5000] + \
            '… (remainder hidden because of slow rendering)'
    response = {
        'query_id': query.id,
        'search_percentage': percentage,
        'results': results,
    }
    if percentage == 100:
        response['errors'] = query.get_errors()

    if new_query:
        # Start searching in a new thread
        thread = threading.Thread(target=run_search, args=(query,))
        thread.start()

    return Response(response)
