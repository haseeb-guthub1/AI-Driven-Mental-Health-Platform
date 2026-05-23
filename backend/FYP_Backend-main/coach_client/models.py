from django.db import models
from human_coach.models import human_coach
from client.models import client

class coach_client(models.Model):
    coach_client_id = models.AutoField(primary_key=True)
    coach_id = models.ForeignKey(human_coach, on_delete=models.CASCADE)
    client_id = models.ForeignKey(client, on_delete=models.CASCADE)
    assigned_date = models.DateField()
    status = models.CharField(max_length=50)

    def __str__(self):
        return f"{self.coach_id} - {self.client_id}"


class Appointment(models.Model):
    APPOINTMENT_STATUS = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('cancelled', 'Cancelled'),
        ('completed', 'Completed'),
    ]
    
    appointment_id = models.AutoField(primary_key=True)
    coach_id = models.ForeignKey(human_coach, on_delete=models.CASCADE, related_name='appointments')
    client_id = models.ForeignKey(client, on_delete=models.CASCADE, related_name='appointments')
    appointment_date = models.DateTimeField()
    duration_minutes = models.IntegerField(default=60)
    status = models.CharField(max_length=20, choices=APPOINTMENT_STATUS, default='pending')
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-appointment_date']
    
    def __str__(self):
        return f"{self.client_id.name} with {self.coach_id.full_name} on {self.appointment_date}"

