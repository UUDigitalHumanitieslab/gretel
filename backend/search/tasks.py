from celery import shared_task
from .models import SearchQuery


@shared_task
def run_search_query(query_id: int):
    query = SearchQuery.objects.get(id=query_id)
    query.perform_search()
