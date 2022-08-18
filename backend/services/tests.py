from django.test import TestCase
from django.conf import settings

from .alpino import alpino, AlpinoError


class AlpinoServiceTestCase(TestCase):
    def test_alpino_server(self):
        if not (settings.ALPINO_HOST and settings.ALPINO_PORT):
            self.skipTest('need ALPINO_HOST and ALPINO_PORT to be set')
        with self.settings(ALPINO_PATH=None):
            alpino.client = None
            try:
                alpino.initialize()
            except AlpinoError:
                self.skipTest('cannot use Alpino server')
            alpino.client.parse_line('Werkt Alpino?', 'testzin')

    def test_alpino_executable(self):
        if not (settings.ALPINO_PATH):
            self.skipTest('need ALPINO_PATH to be set')
        with self.settings(ALPINO_HOST=None, ALPINO_PORT=None):
            alpino.client = None
            try:
                alpino.initialize()
            except AlpinoError:
                self.skipTest('cannot use Alpino executable')
            alpino.client.parse_line('Werkt Alpino?', 'testzin')
