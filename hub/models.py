from django.db import models


class Game(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    link = models.URLField(help_text="Absolute or relative URL to launch the game")
    slug = models.SlugField(max_length=120, unique=True, help_text="Stable identifier for the game")
    order = models.PositiveIntegerField(default=0, help_text="Ordering on the homepage")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["order", "name"]

    def __str__(self) -> str:  # pragma: no cover - simple representation
        return self.name
