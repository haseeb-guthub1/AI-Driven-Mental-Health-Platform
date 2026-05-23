"""
Test API endpoint with actual request
"""
import requests
import json

API_URL = "http://127.0.0.1:8000/ai-guidance/"

# Test cases
test_messages = [
    "hello",
    "I am very happy today",
    "I feel so sad",
    "Great, just what I needed",
    "I want to kill myself",
]

print("="*70)
print("TESTING API RESPONSES")
print("="*70)

for msg in test_messages:
    print(f"\n>>> User: '{msg}'")
    print("-"*70)
    
    try:
        response = requests.post(
            API_URL,
            json={
                "user_message": msg,
                "client_id": 1,  # Test user
                "session_id": 1
            },
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"Emotion: {data.get('emotion', 'N/A')}")
            print(f"Intensity: {data.get('intensity', 'N/A')}/10")
            print(f"Risk: {data.get('risk_level', 'N/A')}")
            print(f"AI Response: {data.get('ai_response', 'N/A')[:200]}...")
        else:
            print(f"Error: Status {response.status_code}")
            print(response.text[:200])
            
    except requests.exceptions.ConnectionError:
        print("ERROR: Cannot connect to server. Is it running?")
        break
    except Exception as e:
        print(f"ERROR: {e}")

print("\n" + "="*70)
