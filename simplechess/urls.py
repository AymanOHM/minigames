from django.urls import path
from . import views

urlpatterns = [
    path('simplechess/', views.chess_game, name='chess_game'),
    path('', views.home, name='home'),
]