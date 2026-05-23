from django.db import models

# DO NOT import serializers here!
# DO NOT import views here!

class emotion_data(models.Model):
    emotion_id = models.AutoField(primary_key=True)
    # Use string references for foreign keys to prevent circular loops
    client_id = models.ForeignKey('client.client', on_delete=models.CASCADE)
    session_id = models.ForeignKey('session_log.session_log', on_delete=models.CASCADE)
    emotion = models.CharField(max_length=50)
    intensity = models.IntegerField()
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.emotion} - {self.intensity}%"


class FinalAssessment(models.Model):
    """
    Stores AI-refined emotion analysis using Ollama
    Combines last 10 emotions + journal entry for balanced assessment
    """
    assessment_id = models.AutoField(primary_key=True)
    client_id = models.ForeignKey('client.client', on_delete=models.CASCADE)
    
    # Raw emotion data
    raw_emotion = models.CharField(max_length=50, help_text="Latest emotion from emotion_data")
    raw_intensity = models.IntegerField(help_text="Latest intensity from emotion_data")
    
    # AI-refined assessment
    final_emotion = models.CharField(max_length=50, help_text="Ollama-analyzed dominant emotion")
    final_intensity = models.IntegerField(help_text="Refined intensity (1-10)")
    
    # AI analysis and recommendation
    recommendation = models.TextField(help_text="AI-generated recommendation based on emotion trends")
    confidence_score = models.FloatField(default=0.0, help_text="AI confidence in assessment (0-1)")
    
    # Metadata
    emotions_analyzed = models.TextField(help_text="JSON string of 10 emotions analyzed")
    journal_entry = models.TextField(blank=True, null=True, help_text="Journal entry used in analysis")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Final Assessment'
        verbose_name_plural = 'Final Assessments'

    def __str__(self):
        return f"{self.client_id} - {self.final_emotion} ({self.final_intensity}/10) - {self.created_at.strftime('%Y-%m-%d')}"