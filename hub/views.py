from __future__ import annotations

from django.shortcuts import render, redirect
from django.urls import reverse
from django import forms
from django.core.validators import validate_email

from .models import Game, ContactMessage


def home(request):
    games = Game.objects.filter(is_active=True)
    return render(request, 'hub/home.html', {"games": games})


def contact_success(request):
    return render(request, 'hub/contact_success.html')


def contact_basic(request):
    """Manual form handling without Django's Form classes."""
    errors: dict[str, list[str]] = {}
    data: dict[str, str] = {}

    if request.method == "POST":
        data = {
            "name": (request.POST.get("name") or "").strip(),
            "email": (request.POST.get("email") or "").strip(),
            "message": (request.POST.get("message") or "").strip(),
        }
        company = (request.POST.get("company") or "").strip()  # honeypot

        def add_error(field: str, message: str) -> None:
            errors.setdefault(field, []).append(message)

        if company:
            add_error("non_field_errors", "Spam detected.")

        if not data["name"]:
            add_error("name", "Name is required.")
        if not data["email"]:
            add_error("email", "Email is required.")
        else:
            try:
                validate_email(data["email"])
            except forms.ValidationError:
                add_error("email", "Enter a valid email address.")

        if not data["message"]:
            add_error("message", "Message is required.")

        if not errors:
            ContactMessage.objects.create(**data)
            return redirect(reverse("contact_success"))
    # GET or POST with errors -> render
    return render(request, "hub/contact_basic.html", {"data": data, "errors": errors})


def contact_form(request):
    """Using a Django Form (not tied to a model)."""
    class ContactDjangoForm(forms.Form):
        name = forms.CharField(max_length=120)
        email = forms.EmailField()
        message = forms.CharField(widget=forms.Textarea, max_length=5000)
        company = forms.CharField(required=False, widget=forms.HiddenInput)

        def clean(self):
            cleaned = super().clean()
            if cleaned.get("company"):
                raise forms.ValidationError("Spam detected.")
            return cleaned

    if request.method == "POST":
        form = ContactDjangoForm(request.POST)
        if form.is_valid():
            cleaned = dict(form.cleaned_data)
            cleaned.pop("company", None)
            ContactMessage.objects.create(**cleaned)
            return redirect("contact_success")
    else:
        form = ContactDjangoForm()
    return render(request, "hub/contact_form.html", {"form": form})


def contact_modelform(request):
    """Using a ModelForm directly tied to ContactMessage."""
    class ContactModelForm(forms.ModelForm):
        company = forms.CharField(required=False, widget=forms.HiddenInput)

        class Meta:
            model = ContactMessage
            fields = ["name", "email", "message"]

        def clean(self):
            cleaned = super().clean()
            if cleaned.get("company"):
                raise forms.ValidationError("Spam detected.")
            return cleaned

    if request.method == "POST":
        form = ContactModelForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect("contact_success")
    else:
        form = ContactModelForm()
    return render(request, "hub/contact_modelform.html", {"form": form})
