from django.db import models


class Game(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    link = models.URLField(help_text="Absolute or relative URL to launch the game")
    slug = models.SlugField(max_length=120, unique=True, help_text="Stable identifier for the game")
    order = models.PositiveIntegerField(default=0, help_text="Ordering on the homepage")
    is_active = models.BooleanField(default=True, help_text="Hide/show this game on the homepage")
    thumbnail = models.ImageField(
        upload_to='games/thumbnails/', blank=True, null=True,
        help_text="Optional thumbnail image shown on the homepage"
    )
    asset = models.FileField(
        upload_to='games/assets/', blank=True, null=True,
        help_text="Optional downloadable file (e.g., zip, instructions)"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["order", "name"]

    def __str__(self) -> str:  # pragma: no cover - simple representation
        return self.name

    @property
    def thumbnail_url(self) -> str | None:
        """Safe access to the thumbnail URL or None if missing."""
        try:
            return self.thumbnail.url  # type: ignore[return-value]
        except Exception:
            return None


class ContactMessage(models.Model):
    """Stores messages submitted via the contact forms."""
    name = models.CharField(max_length=120)
    email = models.EmailField()
    message = models.TextField(max_length=5000)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:  # pragma: no cover - simple representation
        return f"{self.name} <{self.email}>"
