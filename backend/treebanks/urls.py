from django.urls import include, path
from rest_framework import routers
from .views import TreebankViewset, components_for_treebank_view

router = routers.DefaultRouter()
router.register(r'treebanks', TreebankViewset)

urlpatterns = [
    path('', include(router.urls)),
    path(
        'components-for-treebank/<slug:treebank>',
        components_for_treebank_view
    ),
    path(
        'api-auth/',
        include('rest_framework.urls', namespace='rest_framework')
    ),
]
