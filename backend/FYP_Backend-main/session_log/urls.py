from django.urls import path
from . import views

urlpatterns = [
    path('sessions/', views.sessionlog_list_create, name='session-list'),
    path('sessions/<int:pk>/', views.sessionlog_detail, name='session-detail'),
    path('sessions/<int:session_id>/summary/', views.generate_session_summary, name='session-summary'),
]