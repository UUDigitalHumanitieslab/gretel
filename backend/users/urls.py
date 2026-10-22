from django.urls import path
from .views import current_user

urlpatterns = [
    path('current/', current_user, name='current-user')
]
