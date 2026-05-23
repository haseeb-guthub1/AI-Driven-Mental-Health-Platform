from django.contrib import admin

# Register your models here.
from django.contrib import admin
from .models import session_log

admin.site.register(session_log)
