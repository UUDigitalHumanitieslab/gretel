from BaseXClient import BaseXClient

from .settings import BASEX_HOST, BASEX_PORT, BASEX_USER, BASEX_PASSWORD


class BaseXService:
    session = None

    def perform_query(self, query):
        if self.session is None:
            try:
                self.start()
            except OSError:
                raise
        return self.session.query(query).execute()

    def start(self):
        if self.session is None:
            try:
                self.session = BaseXClient.Session(
                    BASEX_HOST, BASEX_PORT, BASEX_USER, BASEX_PASSWORD
                )
            except ConnectionError:
                raise


basex = BaseXService()
