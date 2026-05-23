
from django.contrib import admin
from django.urls import include, path
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

@api_view(['GET'])
@permission_classes([AllowAny])
def api_root(request):
    """
    API Root - Lists all available endpoints
    """
    return Response({
        'admin': '/admin/',
        'ai-guidance': '/api/ai-guidance/',
        'client': '/api/client/',
        'coach_client': '/api/coach_client/',
        'coach_feedback': '/api/coach_feedback/',
        'emotion-data': '/api/emotion-data/',
        'human_coach': '/api/human_coach/',
        'notification': '/api/notification/',
        'sessions': '/api/sessions/',
        'upload_resource': '/api/upload_resource/',
        'user': '/api/user/',
    })

urlpatterns = [
    path('', api_root, name='api-root'),
    path('admin/', admin.site.urls),
    path('api/ai-guidance/', include('ai_guidance.urls')),
    path('api/client/', include('client.urls')),
    path('api/coach_client/', include('coach_client.urls')),
    path('api/coach_feedback/', include('coach_feedback.urls')),
    path('api/emotion-data/', include('emotion_data.urls')),
    path('api/human_coach/', include('human_coach.urls')),
    path('api/notification/', include('notification.urls')),
    path('api/', include('session_log.urls')),
    path('api/upload_resource/', include('upload_resource.urls')),
    path('api/user/', include('user.urls')),
]


