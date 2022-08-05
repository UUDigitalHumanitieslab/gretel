from django.test import TestCase

from .basex_search import (check_db_name, check_xpath, generate_xquery_search,
                           generate_xquery_count, parse_search_result)


class BaseXSearchTestCase(TestCase):
    DB_NAME_CHECK = 'EUROPARL_ID_EP-00_0000'
    XPATH_CHECK = '//node[@cat="smain" and node[@rel="su" and @pt="vnw"] and' \
                  ' node[@rel="hd" and @pt="ww"] and node[@rel="predc" and' \
                  ' @cat="np" and node[@rel="det" and @pt="lid"] and' \
                  ' node[@rel="hd" and @pt="n"]]]'

    def test_check_db_name(self):
        self.assertTrue(check_db_name(self.DB_NAME_CHECK))
        self.assertFalse(check_db_name(self.DB_NAME_CHECK + '") let $a := 0'))

    def test_check_xpath(self):
        self.assertTrue(check_xpath(self.XPATH_CHECK))
        self.assertFalse(check_xpath(self.XPATH_CHECK + ' let $a := 0'))

    def test_xquery_search_count(self):
        # Check if function runs without error
        generate_xquery_search(self.DB_NAME_CHECK, self.XPATH_CHECK)
        generate_xquery_count(self.DB_NAME_CHECK, self.XPATH_CHECK)
        # Illegal arguments should raise error
        for func in (generate_xquery_search, generate_xquery_count):
            self.assertRaises(
                ValueError,
                func,
                self.DB_NAME_CHECK + ' ',
                self.XPATH_CHECK
            )
            self.assertRaises(
                ValueError,
                func,
                self.DB_NAME_CHECK,
                self.XPATH_CHECK + ' let $a := 0'
            )

    def test_parse_search_result(self):
        input_str = '<match>id||sentence||ids||begins||xml_sentences' \
            '||meta||</match><match>id2||sentence2||ids2||begins2' \
            '||xml_sentences2||meta2||</match>'
        res = parse_search_result(input_str)
        self.assertEqual('sentence', res[0]['sentence'])
        self.assertEqual('meta2', res[1]['meta'])
        # Incomplete input string should raise exception
        input_str = '<match>id||sentence||ids||begins||xml_sentences' \
            '||meta||</match><match>id2||sentence2||id'
        self.assertRaises(ValueError, parse_search_result, input_str)
        input_str = '<match>id||sentence||ids||begins||xml_sentences' \
            '</match>'
        self.assertRaises(ValueError, parse_search_result, input_str)
        # Empty string should return an empty list
        self.assertEqual([], parse_search_result(''))
        self.assertEqual([], parse_search_result('\n '))
