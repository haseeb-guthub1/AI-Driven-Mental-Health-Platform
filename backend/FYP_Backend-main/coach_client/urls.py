from django.urls import path
from . import views

urlpatterns = [
    path('coach-clients/', views.coachclient_list_create, name='coachclient-list'),
    path('coach-clients/<int:pk>/', views.coachclient_detail, name='coachclient-detail'),
    
    # Coach listing and appointment endpoints
    path('available-coaches/', views.available_coaches, name='available-coaches'),
    path('appointments/', views.book_appointment, name='book-appointment'),
    path('appointments/client/<int:client_id>/', views.client_appointments, name='client-appointments'),
    path('appointments/<int:pk>/', views.appointment_detail, name='appointment-detail'),
]