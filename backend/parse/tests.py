from django.test import TestCase

from services.alpino import _get_alpino_socket


class ParseViewTestCase(TestCase):
    def setUp(self):
        try:
            _get_alpino_socket()
        except ConnectionRefusedError:
            self.skipTest('need Alpino to run')

    def test_parse_view(self):
        response = self.client.post(
            '/parse/parse-sentence/',
            {'sentence': 'Dit is een zin.'},
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 200)
        # Return meaningful error if Alpino is not available
        with self.settings(ALPINO_PORT=1000):
            response = self.client.post(
                '/parse/parse-sentence/',
                {'sentence': 'Dit is een zin.'},
                content_type='application/json'
            )
            self.assertEqual(response.status_code, 500)
            self.assertIn('error', response.json())
