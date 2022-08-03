from django.urls import include, path
from .views import treebank_view, treebank_components_view

urlpatterns = [
    path('', treebank_view),
    path('<slug:treebank>/components/', treebank_components_view),
    path(
        'api-auth/',
        include('rest_framework.urls', namespace='rest_framework')
    ),
]
