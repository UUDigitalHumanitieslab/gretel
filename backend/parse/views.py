from rest_framework.response import Response
from rest_framework.decorators import (
    api_view, parser_classes, renderer_classes, authentication_classes
)
from rest_framework.parsers import JSONParser
from rest_framework.renderers import JSONRenderer, BrowsableAPIRenderer
from rest_framework.authentication import BasicAuthentication
from rest_framework import status

from services.alpino import parse_sentence, AlpinoError


@api_view(['POST'])
@authentication_classes([BasicAuthentication])
@renderer_classes([JSONRenderer, BrowsableAPIRenderer])
@parser_classes([JSONParser])
def parse_view(request):
    data = request.data
    try:
        sentence = data['sentence']
    except KeyError as err:
        return Response(
            {'error': '{} is missing'.format(err)},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        parsed_sentence = parse_sentence(sentence)
    except ConnectionRefusedError:
        # TODO log error
        return Response(
            {'error': 'Cannot connect to Alpino'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    except AlpinoError as err:
        return Response(
            {'error': 'Parsing error: {}'.format(err)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    return Response({'parsed_sentence': parsed_sentence})
