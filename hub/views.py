from django.shortcuts import render

from .models import Game


def home(request):
    games = Game.objects.all()
    return render(request, 'hub/home.html', {"games": games})
