from django.db import models

# Create your models here.
from django.db import models
from human_coach.models import human_coach
from session_log.models import session_log

class coach_feedback(models.Model):
    feedback_id = models.AutoField(primary_key=True)
    coach_id = models.ForeignKey(human_coach, on_delete=models.CASCADE)
    session_id = models.ForeignKey(session_log, on_delete=models.CASCADE)
    comment = models.TextField()
    rating = models.IntegerField()

    def __str__(self):
        return f"Feedback {self.feedback_id}"
