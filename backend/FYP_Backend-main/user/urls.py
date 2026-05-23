from django.urls import path
from . import views

urlpatterns = [
    # Endpoint: http://127.0.0.1:8000/api/user/
    path('', views.user_list_create, name='user-list-create'),
    
    # Endpoint: http://127.0.0.1:8000/api/user/1/
    path('<int:pk>/', views.user_detail, name='user-detail'),
    
    # Endpoint: http://127.0.0.1:8000/api/user/login/
    path('login/', views.user_login, name='user-login'),
]