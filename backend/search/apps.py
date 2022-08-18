from django.apps import AppConfig

import os
import logging

from gretel.celery import app as celery_app

logger = logging.getLogger(__name__)


class SearchConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'search'

    def ready(self):
        if os.environ.get('RUN_MAIN') == 'true':
            # Warn the user if Celery's broker is not functioning
            try:
                celery_app.broker_connection().ensure_connection(max_retries=1)
            except Exception:
                logger.warning(
                    'No connection with Celery message broker. Searching will '
                    'happen in a single request, which may take a long time '
                    'on large treebanks.'
                )
