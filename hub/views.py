from django.shortcuts import render

from .models import Game


def home(request):
    games = Game.objects.filter(is_active=True)
    return render(request, 'hub/home.html', {"games": games})
