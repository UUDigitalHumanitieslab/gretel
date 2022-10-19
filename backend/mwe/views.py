from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.generics import ListAPIView
from rest_framework.viewsets import ModelViewSet

from alpino_query.parser import parse_sentence
from mwe_query import Mwe

from .models import CanonicalForm, XPathQuery
from .serializers import CanonicalFormSerializer, XPathQuerySerializer, MweQuerySerializer


class CanonicalFormList(ListAPIView):
    queryset = CanonicalForm.objects.all()
    serializer_class = CanonicalFormSerializer


def generate_query(sentence, rank):
    """ Generates a set of queries using the mwe-query package.
    (https://github.com/UUDigitalHumanitieslab/mwe-query)

    This happens on the basis of an alpino parse tree and results in three
    queries:
    1. Multi-word expression query
    2. "Near-miss" query
    3. Superset query

    The superset query is special in the sense that it is executed directly on BaseX.
    The other queries are executed against the results of the superset query.
    This numbering scheme (1-3) is referred to as "rank" in the codebase, and reflects the idea that
    the results of query of rank i should be included in the results of query j if j>i.
    """

    # TODO: we could maybe replace the whole rank idea with an is_superset boolean
    mwe = Mwe(sentence)
    tree = parse_sentence(mwe.can_form)
    mwe.set_tree(tree)
    generated = mwe.generate_queries()[rank - 1]
    if not generated.xpath.startswith('//'):
        generated.xpath = '/alpino_ds' + generated.xpath
    return MweQuerySerializer(generated).data


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
