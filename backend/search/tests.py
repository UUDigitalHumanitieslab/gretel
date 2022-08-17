from django.test import TestCase
from django.conf import settings
from django.core.management import call_command
from django.utils import timezone

import unittest
import json
import lxml.etree as etree

from treebanks.models import Treebank
from services.basex import basex

from .basex_search import (check_db_name, check_xpath, generate_xquery_search,
                           generate_xquery_count, parse_search_result,
                           generate_xquery_for_variables,
                           check_xquery_variable_name,
                           parse_metadata_count_result,
                           generate_xquery_showtree)
from .models import ComponentSearchResult, SearchQuery, SearchError

test_treebank = None

# ‘Dit is een voorbeeldzin.’
XPATH1 = '//node[@cat="smain" and node[@rel="su" and @pt="vnw"] and' \
         ' node[@rel="hd" and @pt="ww"] and node[@rel="predc" and' \
         ' @cat="np" and node[@rel="det" and @pt="lid"] and' \
         ' node[@rel="hd" and @pt="n"]]]'
VAR_CHECK = [
    {
        'name': '$node',
        'path': '*'
    },
    {
        'name': '$node1',
        'path': '$node/node[@rel = "su" and @pt = "vnw"]'
    },
    {
        'name': '$node2',
        'path': '$node/node[@rel = "hd" and @pt = "ww"]',
        'props': {
            '_prop1': 'test'
        }
    }
]


def setUpModule():
    try:
        basex.start()
    except ConnectionError:
        # We cannot work with a real treebank, but let other tests continue
        print("NO CONNECTION: Skipping Basex tests")
        return
    print('Uploading a test treebank to BaseX (will be deleted afterwards)...')
    call_command(
        'upload-lassy',
        str(settings.BASE_DIR / 'testdata' / 'TEST_TROONREDE'),
        '--group-by=11'  # Create two components each consisting of two DBs
    )
    global test_treebank
    test_treebank = Treebank.objects.get(slug='test_troonrede')


def tearDownModule():
    if test_treebank is not None:
        test_treebank.delete()


class BaseXSearchTestCase(TestCase):
    DB_NAME_CHECK = 'EUROPARL_ID_EP-00_0000'
    SENT_ID_CHECK = 'troonrede1990.data.dz:63'

    def test_check_db_name(self):
        self.assertTrue(check_db_name(self.DB_NAME_CHECK))
        self.assertFalse(check_db_name(self.DB_NAME_CHECK + '") let $a := 0'))

    def test_check_xpath(self):
        self.assertTrue(check_xpath(XPATH1))
        self.assertFalse(check_xpath(XPATH1 + ' let $a := 0'))

    def test_check_xquery_variable_name(self):
        self.assertTrue(check_xquery_variable_name('$node1'))
        self.assertFalse(check_xquery_variable_name('node1'))
        self.assertFalse(check_xquery_variable_name('$node1 let $a := 0'))

    def test_xquery_search_count(self):
        # Check if function runs without error
        generate_xquery_search(self.DB_NAME_CHECK, XPATH1)
        generate_xquery_count(self.DB_NAME_CHECK, XPATH1)
        # Illegal arguments should raise error
        for func in (generate_xquery_search, generate_xquery_count):
            self.assertRaises(
                ValueError,
                func,
                self.DB_NAME_CHECK + ' ',
                XPATH1
            )
            self.assertRaises(
                ValueError,
                func,
                self.DB_NAME_CHECK,
                XPATH1 + ' let $a := 0'
            )

    def test_xquery_for_variables(self):
        # Should work well with VAR_CHECK
        let_fragment, return_fragment = \
            generate_xquery_for_variables(VAR_CHECK)
        # There should be two declared variables
        self.assertEqual(let_fragment.count('let $'), 2)
        # Return fragment should be valid XML
        etree.fromstring(return_fragment)
        # Empty variables lists result in empty strings
        let_fragment, return_fragment = \
            generate_xquery_for_variables([])
        self.assertEqual(let_fragment, '')
        self.assertEqual(return_fragment, '')

    def test_xquery_showtree(self):
        # Check if function runs without error
        generate_xquery_showtree(self.DB_NAME_CHECK, self.SENT_ID_CHECK)
        # TODO: check for valid XQuery
        # Illegal arguments should raise error
        self.assertRaises(
            ValueError, generate_xquery_showtree,
            self.DB_NAME_CHECK + ' ', self.SENT_ID_CHECK
        )
        self.assertRaises(
            ValueError, generate_xquery_showtree,
            self.DB_NAME_CHECK, self.SENT_ID_CHECK + '"'
        )

    def test_parse_search_result(self):
        input_str = '<match>id||sentence||ids||begins||xml_sentences' \
            '||meta||vars</match><match>id2||sentence2||ids2||begins2' \
            '||xml_sentences2||meta2||vars</match>'
        res = parse_search_result(input_str, 'component', 'db')
        self.assertEqual('sentence', res[0]['sentence'])
        self.assertEqual('meta2', res[1]['meta'])
        # Incomplete input string should raise exception
        input_str = '<match>id||sentence||ids||begins||xml_sentences' \
            '||meta||</match><match>id2||sentence2||id'
        self.assertRaises(ValueError, parse_search_result, input_str,
                          'component', 'db')
        input_str = '<match>id||sentence||ids||begins||xml_sentences' \
            '</match>'
        self.assertRaises(ValueError, parse_search_result, input_str,
                          'component', 'db')
        # Empty string should return an empty list
        self.assertEqual([], parse_search_result('', 'component', 'db'))
        self.assertEqual([], parse_search_result('\n ', 'component', 'db'))

    def test_parse_metadata_count_result(self):
        TEST_XML = """
<metadata>
  <meta name="uttstartlineno" type="int">
    <count value="33">1</count>
    <count value="216">1</count>
  </meta>
  <meta name="charencoding" type="text">
    <count value="UTF8">311</count>
  </meta>
  <meta name="charencoding" type="text">
    <count value="UTF8">100</count>
    <count value="UTF16">50</count>
  </meta>
</metadata>
"""
        EXPECTED_RESULT = {
            'uttstartlineno': {'33': 1, '216': 1},
            'charencoding': {'UTF8': 411, 'UTF16': 50}
        }
        totals = parse_metadata_count_result(
            TEST_XML
        )
        self.assertEqual(totals, EXPECTED_RESULT)
        # Empty list should give empty dict
        self.assertEqual(
            parse_metadata_count_result('<metadata></metadata>'),
            {}
        )
        # Invalid format should raise error
        with self.assertRaises(ValueError):
            parse_metadata_count_result('<something></something>')


class ComponentSearchResultTestCase(TestCase):
    def test_perform_search(self):
        if not basex.session:
            return self.skipTest('requires running BaseX server')
        if not test_treebank:
            return self.skipTest('requires an uploaded test treebank')
        component = test_treebank.components.get(slug='troonrede19')
        csr = ComponentSearchResult(
            xpath=XPATH1,
            component=component,
            variables=VAR_CHECK
        )
        csr.perform_search()
        # Compare results with what we know from GrETEL 4
        self.assertEqual(csr.number_of_results, 4)
        self.assertLessEqual(csr.search_completed, timezone.now())
        # There should be no errors and error string should be empty
        self.assertEqual(csr.errors, '')
        # Results should be valid JSON
        try:
            json.loads(csr.results)
        except json.JSONDecodeError:
            self.fail('search produces invalid JSON')
        csr.delete()  # Delete because CSR auto-saves
        # No component should throw exception
        csr2 = ComponentSearchResult(xpath=XPATH1)
        with self.assertRaises(SearchError):
            csr2.perform_search()
        csr2.component = component
        # Invalid or empty (= invalid) XPath should throw exception
        for xpath in ['//node[@cat=', '']:
            csr2.xpath = xpath
            with self.assertRaises(SearchError):
                csr2.perform_search()


class SearchQueryTestCase(TestCase):
    def setUp(self):
        if not basex.session:
            return self.skipTest('requires running BaseX server')
        if not test_treebank:
            return self.skipTest('requires an uploaded test treebank')

    def test_initialize(self):
        # Create a SQ and test if it gets the right number of CSRs
        sq = SearchQuery(xpath=XPATH1)
        sq.save()
        components = test_treebank.components.all()
        sq.components.add(*components)
        sq.initialize()
        self.assertEqual(sq.components.count(), sq.results.count())
        sq.results.all().delete()
        # Now do the same but first manually create a CSR
        component = test_treebank.components.all().first()
        csr = ComponentSearchResult(xpath=XPATH1, component=component)
        csr.save()
        sq2 = SearchQuery(xpath=XPATH1)
        sq2.save()
        components = test_treebank.components.all()
        sq.components.add(*components)
        sq.initialize()
        self.assertEqual(sq.components.count(), sq.results.count())

    def test_get_results(self):
        # No components means no results, but no error either
        sq = SearchQuery(xpath=XPATH1)
        sq.save()
        sq.initialize()
        results, percentage = sq.get_results()
        self.assertEqual(len(results), 0)

        # New SQ without any results
        # Make sure there are no results left from other tests
        ComponentSearchResult.objects.all().delete()
        sq2 = SearchQuery(xpath=XPATH1)
        sq2.save()
        components = test_treebank.components.all()
        sq2.components.add(*components)
        sq2.initialize()
        results, percentage = sq2.get_results()
        self.assertEqual(len(results), 0)
        self.assertEqual(percentage, 0)

        # Now manually search all CSRs and check if search is done
        nr_results = 0
        for csr in sq2.results.all():
            csr.perform_search()
            nr_results += csr.number_of_results
        results, percentage = sq2.get_results()
        self.assertEqual(len(results), nr_results)
        self.assertEqual(percentage, 100)

        # Check if from_number and to_number work
        # (there should be seven results)
        results2, _ = sq2.get_results(from_number=1)
        self.assertEqual(results[1:], results2)
        results3, _ = sq2.get_results(to_number=4)
        self.assertEqual(results[:4], results3)

    def test_perform_search(self):
        # Make sure there are no results left from other tests
        ComponentSearchResult.objects.all().delete()
        # SQ with full treebank
        sq = SearchQuery(xpath=XPATH1)
        sq.save()
        components = test_treebank.components.all()
        sq.components.add(*components)
        sq.initialize()

        # Manually search first component, then run perform_search()
        # and check if all components have been searched
        first_csr = sq.results.first()
        first_csr.perform_search()
        sq.perform_search()
        for csr in sq.results.all():
            self.assertIsNotNone(csr.search_completed)
