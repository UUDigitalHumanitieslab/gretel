from django.urls import path

from .views import parse_view

urlpatterns = [
    path('parse-sentence/', parse_view, name='parse-sentence'),
]
