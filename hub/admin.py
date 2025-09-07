from django.contrib import admin

from .models import Game


@admin.register(Game)
class GameAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "order")
    list_editable = ("order",)
    search_fields = ("name", "description", "slug")
    prepopulated_fields = {"slug": ("name",)}
