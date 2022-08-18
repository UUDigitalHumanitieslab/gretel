from BaseXClient import BaseXClient

from django.conf import settings


class BaseXService:
    def perform_query(self, query):
        """Open a session, create a query, execute it, close the session
        and result the result"""
        session = self.get_session()
        response = session.query(query).execute()
        session.close()
        return response

    def execute(self, command):
        """Open a session, execute a command, close the session
        and return the result"""
        session = self.get_session()
        response = session.execute(command)
        session.close()
        return response

    def create(self, name, content):
        """Open a session, create a database and close the session"""
        session = self.get_session()
        session.create(name, content)
        session.close()

    def get_session(self):
        session = BaseXClient.Session(
                    settings.BASEX_HOST,
                    settings.BASEX_PORT,
                    settings.BASEX_USER,
                    settings.BASEX_PASSWORD
        )
        return session

    def test_connection(self):
        try:
            session = BaseXClient.Session(
                settings.BASEX_HOST,
                settings.BASEX_PORT,
                settings.BASEX_USER,
                settings.BASEX_PASSWORD
            )
        except ConnectionError:
            return False
        session.close()
        return True


basex = BaseXService()
