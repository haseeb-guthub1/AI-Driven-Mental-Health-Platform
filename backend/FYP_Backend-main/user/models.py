
from django.db import models
from django.core.validators import MinLengthValidator

class user(models.Model):
    user_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=255, validators=[MinLengthValidator(6)], default='password123')  # Add password field with default
    role = models.CharField(max_length=50)
    created_at = models.DateField(auto_now_add=True)

    def __str__(self):
        return self.name

