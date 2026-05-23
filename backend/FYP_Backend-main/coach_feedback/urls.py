from django.urls import path
from . import views

urlpatterns = [
    path('feedback/', views.coachfeedback_list_create, name='feedback-list'),
    path('feedback/<int:pk>/', views.coachfeedback_detail, name='feedback-detail'),
]