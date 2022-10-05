from django.conf import settings
from django.contrib import admin
from django.urls import include, path, re_path
from django.views.generic.base import RedirectView

from .index import index
from .proxy_frontend import proxy_frontend

if settings.PROXY_FRONTEND:
    spa_url = re_path(r'^(?P<path>.*)$', proxy_frontend)
else:
    spa_url = re_path(r'', index)

urlpatterns = [
    path('treebanks/', include('treebanks.urls')),
    path('parse/', include('parse.urls')),
    path('search/', include('search.urls')),

    path('mwe/', include('mwe.urls')),
    path('admin', RedirectView.as_view(url='/admin/', permanent=True)),
    path('admin/', admin.site.urls),
    spa_url,  # catch-all; unknown paths to be handled by a SPA
]
