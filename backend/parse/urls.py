from django.urls import path

from .views import parse_view, generate_xpath_view

urlpatterns = [
    path('parse-sentence/', parse_view, name='parse-sentence'),
    path('generate-xpath/', generate_xpath_view, name='generate-xpath'),
]
