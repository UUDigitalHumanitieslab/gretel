from BaseXClient import BaseXClient

from django.conf import settings


class BaseXService:
    session = None

    def perform_query(self, query):
        if self.session is None:
            try:
                self.start()
            except ConnectionError:
                raise
        return self.session.query(query).execute()

    def start(self):
        if self.session is None:
            try:
                self.session = BaseXClient.Session(
                    settings.BASEX_HOST,
                    settings.BASEX_PORT,
                    settings.BASEX_USER,
                    settings.BASEX_PASSWORD
                )
            except ConnectionError:
                raise


basex = BaseXService()
