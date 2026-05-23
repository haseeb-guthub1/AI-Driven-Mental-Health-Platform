from django.urls import path
from . import views

urlpatterns = [
    path('resources/', views.uploadedresource_list_create, name='resource-list'),
    path('resources/<int:pk>/', views.uploadedresource_detail, name='resource-detail'),
]