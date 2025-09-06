from django.urls import path
from . import views

urlpatterns = [
    path('', views.fps, name='fps'),
]