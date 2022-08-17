from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.generics import ListAPIView
from rest_framework.viewsets import ModelViewSet

from alpino_query.parser import parse_sentence
from mwe_query import Mwe

from .models import CanonicalForm, CanonicalFormSerializer, XPathQuery, XPathQuerySerializer, MweQuerySerializer


class CanonicalFormList(ListAPIView):
    queryset = CanonicalForm.objects.all()
    serializer_class = CanonicalFormSerializer


def generate_query(sentence, rank):
    parsed_xml = parse_sentence(sentence)
    mwe = Mwe(sentence, parsed_xml)
    # a placeholder function for Martin Kroon's query generator
    # there should also be an alpino parse step here
    generated = mwe.generate_queries()
    return MweQuerySerializer(generated[rank - 1]).data


class GenerateMweQueries(APIView):
    def post(self, request, format=None):
        """ Generate XPath queries for a given canonical form of a MWE.
        If the MWE is a known form, it may have manually adjusted stored queries.
        Otherwise, queries are generated on-the-fly """
        queries = dict()
        text = request.data['canonical'].lower()
        canonical = CanonicalForm.objects.filter(text=text).first()

        if canonical:
            # look for saved queries
            for query in canonical.xpathquery_set.all():
                queries[query.rank] = XPathQuerySerializer(query).data

        # complement saved queries with newly generated ones, based on rank
        for rank in range(1, 4):
            if rank not in queries:
                queries[rank] = generate_query(text, rank)

        return Response(queries.values())


class XPathQueryViewSet(ModelViewSet):
    serializer_class = XPathQuerySerializer

    def get_queryset(self):
        return XPathQuery.objects.all()
