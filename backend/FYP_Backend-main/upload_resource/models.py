from django.db import models

# Create your models here.
from django.db import models
from human_coach.models import human_coach

class uploaded_resource(models.Model):
    resource_id = models.AutoField(primary_key=True)
    coach_id = models.ForeignKey(human_coach, on_delete=models.CASCADE)
    resource_type = models.CharField(max_length=50)
    resource_url = models.URLField()
    upload_date = models.DateField()

    def __str__(self):
        return f"Resource {self.resource_id}"
