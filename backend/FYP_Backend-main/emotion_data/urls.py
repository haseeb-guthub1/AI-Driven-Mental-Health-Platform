from django.urls import path
from . import views

urlpatterns = [
    path('', views.emotion_list_create, name='emotion-list-create'),
    path('final-assessment/', views.final_assessment_view, name='final-assessment'),
]