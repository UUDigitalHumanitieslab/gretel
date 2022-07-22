from django.test import TestCase

from .basex_search import (check_db_name, check_xpath, generate_xquery_search,
                           generate_xquery_count)


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
