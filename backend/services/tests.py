from django.test import TestCase

from .alpino import parse_sentence, _get_alpino_socket, AlpinoError


class AlpinoTestCase(TestCase):
    def setUp(self):
        try:
            _get_alpino_socket()
        except ConnectionRefusedError:
            self.skipTest('need Alpino to run')

    def test_parse_sentence(self):
        # Simple sentence
        parse_sentence('Dit is een voorbeeldzin.')
        # Complicated sentence with a result longer than the socket buffer
        parse_sentence('Dit is een voorbeeldzin, maar deze is wel heel erg '
                       'lang en het resultaat is groter dan 4096 tekens.')
        # Alpino returns error with empty sentence; check if this is deteceted
        self.assertRaises(AlpinoError, parse_sentence, '')
        # Check support for unicode
        parse_sentence('Dit is één zin ☺')
