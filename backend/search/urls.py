from django.urls import include, path

from .views import search_view

urlpatterns = [
    path('search/', search_view),
]
