from django.urls import path

from .views import search_view, tree_view

urlpatterns = [
    path('search/', search_view),
    path('tree/', tree_view),
]
