from django.urls import path

from .views import search_view, tree_view, metadata_count_view

urlpatterns = [
    path('search/', search_view),
    path('tree/', tree_view),
    path('metadata-count/', metadata_count_view),
]
