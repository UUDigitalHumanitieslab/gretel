from django.urls import path

from rest_framework.routers import SimpleRouter

from .views import home, CanonicalFormList, GenerateMweQueries, XPathQueryViewSet

urlpatterns = [
    path('', home, name='home'),
    path('canonical', CanonicalFormList.as_view(), name='canonical'),
    path('generate', GenerateMweQueries.as_view(), name='generate'),
]

router = SimpleRouter()
router.register('xpath', XPathQueryViewSet, basename='xpath')

urlpatterns += router.urls
