import logging

from django.apps import AppConfig
from gretel.services import basex


class TreebanksConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'treebanks'

    def ready(self):
        # Try to make BaseX connection to give user an early warning
        try:
            basex.start()
        except ConnectionRefusedError:
            logging.warning(
                'Could not connect to BaseX. Check if it is running and that '
                'connection settings are correct. GrETEL will run but '
                'searching will not work.'
            )
