from django.db import models
from user.models import user # Assuming your custom user model is 'user'

class human_coach(models.Model):
    coach_id = models.AutoField(primary_key=True)
    user_id = models.OneToOneField(user, on_delete=models.CASCADE, related_name='coach_profile')
    full_name = models.CharField(max_length=100)
    specialization = models.CharField(max_length=100)
    license_id = models.CharField(max_length=100, unique=True, null=True, blank=True)
    is_approved = models.BooleanField(default=False)
    requested_at = models.DateTimeField(auto_now_add=True, null=True)
    approved_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.full_name} ({'Approved' if self.is_approved else 'Pending'})"

class ChatSession(models.Model):
    user = models.ForeignKey(user, on_delete=models.CASCADE, related_name='chats')
    # Link to coach once the user selects one
    assigned_coach = models.ForeignKey(human_coach, on_delete=models.SET_NULL, null=True, blank=True)
    
    # Stores the actual conversation as JSON
    transcript = models.JSONField(default=list) 
    
    # Risk score (1-10) updated in real-time by AI
    risk_score = models.IntegerField(default=0) 
    is_high_risk = models.BooleanField(default=False)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        # Automatically flag high risk if score >= 7
        self.is_high_risk = self.risk_score >= 7
        super().save(*args, **kwargs)