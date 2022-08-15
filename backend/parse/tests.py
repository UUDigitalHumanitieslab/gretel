from django.test import TestCase

from services.alpino import alpino, AlpinoError

EXAMPLE_XML = '''<?xml version="1.0" encoding="UTF-8"?><alpino_ds
version="1.6">
<parser build="Alpino-x86_64-linux-glibc2.5-git572-sicstus"
date="2022-08-11T09:22" cats="1" skips="0" />  <node begin="0" cat="top"
end="4" id="0" rel="top">    <node begin="0" cat="smain" end="4" id="1"
rel="--">      <node begin="0" end="1"
frame="determiner(het,nwh,nmod,pro,nparg)" getal="ev" his="normal"
his_1="decap" his_1_1="normal" id="2" infl="het" lcat="np" lemma="dit"
naamval="stan" pdtype="pron" persoon="3o" pos="det"
postag="VNW(aanw,pron,stan,vol,3o,ev)" pt="vnw" rel="su" rnum="sg" root="dit"
sense="dit" status="vol" vwtype="aanw" wh="nwh" word="Dit"/>      <node
begin="1" end="2" frame="verb(unacc,sg_heeft,copula)" his="normal"
his_1="normal" id="3" infl="sg_heeft" lcat="smain" lemma="zijn" pos="verb"
postag="WW(pv,tgw,ev)" pt="ww" pvagr="ev" pvtijd="tgw" rel="hd" root="ben"
sc="copula" sense="ben" stype="declarative" tense="present" word="is"
wvorm="pv"/>      <node begin="2" cat="np" end="4" id="4" rel="predc">
<node begin="2" end="3" frame="determiner(een)" his="normal" his_1="normal"
id="5" infl="een" lcat="detp" lemma="een" lwtype="onbep" naamval="stan"
npagr="agr" pos="det" postag="LID(onbep,stan,agr)" pt="lid" rel="det"
root="een" sense="een" word="een"/>        <node begin="3" end="4"
frame="noun(both,both,both)" gen="both" genus="zijd" getal="ev" graad="basis"
his="noun" id="6" lcat="np" lemma="voorbeeldzin." naamval="stan" ntype="soort"
num="both" pos="noun" postag="N(soort,ev,basis,zijd,stan)" pt="n" rel="hd"
rnum="sg" root="voorbeeldzin." sense="voorbeeldzin." word="voorbeeldzin."/>
</node>    </node>  </node>  <sentence sentid="127.0.0.1">Dit is een
voorbeeldzin.</sentence></alpino_ds>
'''


class ParseViewTestCase(TestCase):
    def setUp(self):
        try:
            alpino.initialize()
        except AlpinoError:
            self.skipTest('need Alpino to run')

    def test_parse_view(self):
        response = self.client.post(
            '/parse/parse-sentence/',
            {'sentence': 'Dit is een zin.'},
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 200)
        # Return meaningful error if Alpino is not available, so
        # de-initialize Alpino and remove correct settings
        with self.settings(ALPINO_HOST=None, ALPINO_PATH=None):
            alpino.client = None
            response = self.client.post(
                '/parse/parse-sentence/',
                {'sentence': 'Dit is een zin.'},
                content_type='application/json'
            )
            self.assertEqual(response.status_code, 500)
            self.assertIn('error', response.json())


class GenerateXPathViewTestCase(TestCase):
    def test_xpath_view(self):
        request_data = {
            'xml': EXAMPLE_XML,
            'tokens': ['Dit', 'is', 'een', 'voorbeeldzin', '.'],
            'attributes': ['pos', 'pos', 'pos', 'pos', 'pos'],
            'ignoreTopNode': False,
            'respectOrder': False
        }
        response = self.client.post(
            '/parse/generate-xpath/',
            request_data,
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 200)
        # Invalid XML
        request_data['xml'] = request_data['xml'][:100]
        response = self.client.post(
            '/parse/generate-xpath/',
            request_data,
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 500)
