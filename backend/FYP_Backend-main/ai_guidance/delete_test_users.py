# """
# Delete All Test Users and Associated Data
# Removes all test users created by the seed_test_users.py script
# """

# import os
# import sys
# import django

# # Setup Django
# sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
# os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myproject.settings')
# django.setup()

# from user.models import user
# from client.models import client
# from session_log.models import session_log
# from emotion_data.models import emotion_data
# from human_coach.models import human_coach
# from coach_client.models import coach_client
# from ai_guidance.models import ai_guidance, ChatMessage, MessageEmotion


# # Test user emails to delete
# TEST_USER_EMAILS = [
#     'emma.thompson@test.com',
#     'michael.chen@test.com',
#     'sarah.williams@test.com',
#     'david.rodriguez@test.com',
#     'jessica.park@test.com',
#     'dr.sarah.johnson@mindwell.com'
# ]


# def delete_test_users():
#     """Delete all test users and their associated data"""
#     print("\n" + "🗑️  " * 35)
#     print("DELETING ALL TEST USER DATA")
#     print("🗑️  " * 35 + "\n")
    
#     total_deleted = {
#         'users': 0,
#         'clients': 0,
#         'sessions': 0,
#         'emotions': 0,
#         'ai_guidance': 0,
#         'chat_messages': 0,
#         'message_emotions': 0,
#         'coaches': 0,
#         'coach_assignments': 0
#     }
    
#     for email in TEST_USER_EMAILS:
#         print(f"\n{'='*70}")
#         print(f"Processing: {email}")
#         print(f"{'='*70}")
        
#         try:
#             # Find user
#             test_user = user.objects.filter(email=email).first()
            
#             if not test_user:
#                 print(f"⚠️  User not found: {email}")
#                 continue
            
#             print(f"✓ Found user: {test_user.name} (ID: {test_user.user_id})")
            
#             # Find client profile
#             test_client = client.objects.filter(user_id=test_user).first()
            
#             if test_client:
#                 print(f"✓ Found client profile (ID: {test_client.client_id})")
                
#                 # Delete sessions and associated data
#                 sessions = session_log.objects.filter(client_id=test_client)
#                 session_count = sessions.count()
                
#                 if session_count > 0:
#                     print(f"  Deleting {session_count} sessions...")
                    
#                     # Delete emotions for these sessions
#                     emotions = emotion_data.objects.filter(client_id=test_client)
#                     emotion_count = emotions.count()
#                     emotions.delete()
#                     total_deleted['emotions'] += emotion_count
#                     print(f"    ✓ Deleted {emotion_count} emotion records")
                    
#                     # Delete AI guidance
#                     guidance = ai_guidance.objects.filter(client_id=test_client)
#                     guidance_count = guidance.count()
#                     guidance.delete()
#                     total_deleted['ai_guidance'] += guidance_count
#                     print(f"    ✓ Deleted {guidance_count} AI guidance records")
                    
#                     # Delete chat messages
#                     messages = ChatMessage.objects.filter(client_id=test_client)
#                     message_count = messages.count()
                    
#                     # Delete message emotions first (FK constraint)
#                     msg_emotions = MessageEmotion.objects.filter(message__client_id=test_client)
#                     msg_emotion_count = msg_emotions.count()
#                     msg_emotions.delete()
#                     total_deleted['message_emotions'] += msg_emotion_count
#                     print(f"    ✓ Deleted {msg_emotion_count} message emotion records")
                    
#                     messages.delete()
#                     total_deleted['chat_messages'] += message_count
#                     print(f"    ✓ Deleted {message_count} chat messages")
                    
#                     # Delete coach assignments
#                     assignments = coach_client.objects.filter(client_id=test_client)
#                     assignment_count = assignments.count()
#                     assignments.delete()
#                     total_deleted['coach_assignments'] += assignment_count
#                     if assignment_count > 0:
#                         print(f"    ✓ Deleted {assignment_count} coach assignments")
                    
#                     # Delete sessions
#                     sessions.delete()
#                     total_deleted['sessions'] += session_count
#                     print(f"    ✓ Deleted {session_count} sessions")
                
#                 # Delete client profile
#                 test_client.delete()
#                 total_deleted['clients'] += 1
#                 print(f"  ✓ Deleted client profile")
            
#             # Check if user is a coach
#             coach_profile = human_coach.objects.filter(user_id=test_user).first()
#             if coach_profile:
#                 print(f"✓ Found coach profile (ID: {coach_profile.coach_id})")
                
#                 # Delete coach-client assignments
#                 assignments = coach_client.objects.filter(coach_id=coach_profile)
#                 assignment_count = assignments.count()
#                 assignments.delete()
#                 total_deleted['coach_assignments'] += assignment_count
#                 if assignment_count > 0:
#                     print(f"  ✓ Deleted {assignment_count} coach assignments")
                
#                 # Delete coach profile
#                 coach_profile.delete()
#                 total_deleted['coaches'] += 1
#                 print(f"  ✓ Deleted coach profile")
            
#             # Delete user
#             test_user.delete()
#             total_deleted['users'] += 1
#             print(f"  ✓ Deleted user account")
            
#             print(f"✅ Successfully deleted all data for {email}")
            
#         except Exception as e:
#             print(f"❌ Error deleting {email}: {str(e)}")
#             continue
    
#     # Print summary
#     print("\n" + "="*70)
#     print("DELETION SUMMARY")
#     print("="*70)
#     print(f"\n✓ Users deleted:              {total_deleted['users']}")
#     print(f"✓ Client profiles deleted:    {total_deleted['clients']}")
#     print(f"✓ Coach profiles deleted:     {total_deleted['coaches']}")
#     print(f"✓ Sessions deleted:           {total_deleted['sessions']}")
#     print(f"✓ Emotion records deleted:    {total_deleted['emotions']}")
#     print(f"✓ AI guidance deleted:        {total_deleted['ai_guidance']}")
#     print(f"✓ Chat messages deleted:      {total_deleted['chat_messages']}")
#     print(f"✓ Message emotions deleted:   {total_deleted['message_emotions']}")
#     print(f"✓ Coach assignments deleted:  {total_deleted['coach_assignments']}")
    
#     print("\n" + "✅ " * 35)
#     print("ALL TEST USER DATA DELETED SUCCESSFULLY")
#     print("✅ " * 35 + "\n")


# if __name__ == '__main__':
#     confirm = input("\n⚠️  WARNING: This will delete all test users and their data!\n   Are you sure? (yes/no): ")
    
#     if confirm.lower() in ['yes', 'y']:
#         delete_test_users()
#     else:
#         print("\n❌ Deletion cancelled.")
