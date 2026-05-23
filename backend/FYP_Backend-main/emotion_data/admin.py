from django.contrib import admin

# Register your models here.
from django.contrib import admin
from .models import emotion_data, FinalAssessment

admin.site.register(emotion_data)


@admin.register(FinalAssessment)
class FinalAssessmentAdmin(admin.ModelAdmin):
    list_display = ('client_id', 'final_emotion', 'final_intensity', 'raw_emotion', 'raw_intensity', 'confidence_score', 'created_at')
    list_filter = ('final_emotion', 'created_at')
    search_fields = ('client_id__user__email', 'final_emotion', 'raw_emotion')
    readonly_fields = ('created_at', 'updated_at')
    ordering = ('-created_at',)
