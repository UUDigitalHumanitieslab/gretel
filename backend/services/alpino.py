from django.conf import settings

from corpus2alpino.annotators.alpino import AlpinoAnnotator


class AlpinoError(RuntimeError):
    pass


class AlpinoService:
    client = None

    def initialize(self):
        '''Connect to the Alpino server or the executable. The client
        will be reachable from the client attribute of this class
        using the interface provided by corpus2alpino.'''
        if self.client is None:
            try:
                if settings.ALPINO_HOST and settings.ALPINO_PORT:
                    annotator = AlpinoAnnotator(
                        settings.ALPINO_HOST, settings.ALPINO_PORT
                    )
                elif settings.ALPINO_PATH:
                    annotator = AlpinoAnnotator(
                        settings.ALPINO_PATH, []
                    )
                else:
                    raise AlpinoError('Alpino has not been configured.')
                self.client = annotator.client
            except Exception as e:
                raise AlpinoError(str(e))


alpino = AlpinoService()