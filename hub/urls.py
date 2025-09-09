from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path('contact/basic/', views.contact_basic, name='contact_basic'),
    path('contact/form/', views.contact_form, name='contact_form'),
    path('contact/model/', views.contact_modelform, name='contact_modelform'),
    path('contact/success/', views.contact_success, name='contact_success'),
]
