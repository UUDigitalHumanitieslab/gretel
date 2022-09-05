import os

from celery import Celery
from celery.schedules import crontab

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'gretel.settings')

app = Celery('gretel')

app.config_from_object('django.conf:settings', namespace='CELERY')

app.autodiscover_tasks()


@app.on_after_configure.connect
def setup_periodic_tasks(sender, **kwargs):
    sender.add_periodic_task(crontab(hour=3), purge_cache.s())


@app.task
def purge_cache():
    from search.models import ComponentSearchResult
    ComponentSearchResult.purge_cache()
