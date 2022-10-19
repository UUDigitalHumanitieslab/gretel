from django.contrib import admin

from .models import CanonicalForm, XPathQuery


@admin.register(CanonicalForm)
class CanonicalFormAdmin(admin.ModelAdmin):
    pass


@admin.register(XPathQuery)
class XPathQueryAdmin(admin.ModelAdmin):
    list_display = ('canonical', 'xpath', 'description')
