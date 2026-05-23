from django.urls import path
from . import views

urlpatterns = [
    path('coaches/', views.humancoach_list_create, name='coach-list'),
    path('coaches/<int:pk>/', views.humancoach_detail, name='coach-detail'),
]