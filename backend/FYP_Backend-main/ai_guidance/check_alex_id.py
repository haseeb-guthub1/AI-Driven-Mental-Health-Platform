import os, sys, django
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myproject.settings')
django.setup()

from user.models import user
from client.models import client

u = user.objects.filter(email='alex.johnson@test.com').first()
if u:
    print(f"User ID: {u.user_id}")
    c = client.objects.filter(user_id=u).first()
    if c:
        print(f"Client ID: {c.client_id}")
    else:
        print("No client profile found")
else:
    print("User not found")
