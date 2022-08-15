from django.apps import AppConfig

import logging
import os

from .basex import basex
from .alpino import alpino, AlpinoError

logger = logging.getLogger(__name__)


class ServicesConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'services'

    def ready(self):
        if os.environ.get('RUN_MAIN') == 'true':
            # Try to connect to BaseX and Alpino as soon as server starts to
            # warn the user immediately
            try:
                basex.start()
            except ConnectionRefusedError:
                logger.warning(
                    'Could not connect to BaseX. Check if it is running and '
                    'connection settings are correct. GrETEL will run but '
                    'searching will not work.'
                )
            try:
                alpino.initialize()
            except AlpinoError as err:
                logger.warning(
                    'Error communicating to Alpino: {} GrETEL will run but '
                    'parsing will not work.'.format(err)
                )
