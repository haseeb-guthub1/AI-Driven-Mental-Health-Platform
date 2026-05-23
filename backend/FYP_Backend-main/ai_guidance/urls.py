from django.urls import path
from . import views

urlpatterns = [
    # Removing 'ai-guidance/' from here because it's already in the main urls.py
    path('', views.aiguidance_list_create, name='ai-guidance-list'),
    path('<int:pk>/', views.aiguidance_detail, name='ai-guidance-detail'),
    path('messages/', views.chat_messages_by_session, name='chat-messages-by-session'),
    
    # Mandatory coaching & risk assessment endpoints
    path('check-lock/', views.check_mandatory_coaching_lock, name='check-mandatory-lock'),
    path('assign-coach/', views.assign_coach_to_client, name='assign-coach'),
    path('available-coaches/', views.get_available_coaches, name='available-coaches'),
]