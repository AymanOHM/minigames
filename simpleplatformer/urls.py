from django.urls import path
from . import views

urlpatterns = [
    path('', views.platformer, name='platformer'),
]