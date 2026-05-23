from django.urls import path
from . import views

urlpatterns = [
    path('clients/', views.client_list_create, name='client-list'),
    path('clients/<int:pk>/', views.client_detail, name='client-detail'),
]