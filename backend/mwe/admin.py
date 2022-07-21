from django.contrib import admin

from .models import CanonicalForm

@admin.register(CanonicalForm)
class CanonicalFormAdmin(admin.ModelAdmin):
    pass
