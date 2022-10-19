from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path('admin/', admin.site.urls),
    path('treebanks/', include('treebanks.urls')),
    path('parse/', include('parse.urls')),
    path('search/', include('search.urls')),

    path('mwe/', include('mwe.urls')),
]
