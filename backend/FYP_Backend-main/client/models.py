from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from user.models import user

class client(models.Model):
    client_id = models.AutoField(primary_key=True)
    user_id = models.ForeignKey(user, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    age = models.IntegerField(validators=[MinValueValidator(13), MaxValueValidator(120)])  # Age must be 13-120
    gender = models.CharField(max_length=20)
    email = models.EmailField()

    def __str__(self):
        return f"Client {self.client_id}"

# Create your models here.
