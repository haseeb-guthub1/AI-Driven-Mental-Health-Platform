# """
# Quick script to delete remaining test user accounts
# """
# import os
# import sys
# import django

# sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
# os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myproject.settings')
# django.setup()

# from user.models import user

# test_emails = [
#     'emma.thompson@test.com',
#     'michael.chen@test.com',
#     'sarah.williams@test.com',
#     'david.rodriguez@test.com',
#     'jessica.park@test.com',
#     'dr.sarah.johnson@mindwell.com'
# ]

# print("\n🗑️  Deleting remaining test user accounts...\n")

# deleted = 0
# for email in test_emails:
#     result = user.objects.filter(email=email).delete()
#     if result[0] > 0:
#         deleted += 1
#         print(f"✓ Deleted: {email}")
#     else:
#         print(f"  Skipped (not found): {email}")

# print(f"\n✅ Total deleted: {deleted} user accounts\n")
