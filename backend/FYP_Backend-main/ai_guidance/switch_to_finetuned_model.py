# """
# Quick script to switch from pre-trained to fine-tuned model
# Run this after training completes
# """
# import os
# import sys

# def update_classifier():
#     """Update transformers_classifier.py to use fine-tuned model"""
    
#     classifier_path = "transformers_classifier.py"
    
#     # Read current file
#     with open(classifier_path, 'r', encoding='utf-8') as f:
#         content = f.read()
    
#     # Check if already using fine-tuned model
#     if 'models/finetuned_mental_health_model' in content:
#         print("[Already Updated] Using fine-tuned model")
#         return True
    
#     # Replace model name
#     old_line = 'def __init__(self, model_name="SamLowe/roberta-base-go_emotions"):'
#     new_line = 'def __init__(self, model_name="models/finetuned_mental_health_model"):'
    
#     if old_line in content:
#         content = content.replace(old_line, new_line)
        
#         # Write back
#         with open(classifier_path, 'w', encoding='utf-8') as f:
#             f.write(content)
        
#         print("[OK] Updated to use fine-tuned model")
#         print("\nNext steps:")
#         print("1. Restart Django server: python manage.py runserver")
#         print("2. Test accuracy: python tests/test_mental_health_terms.py")
#         return True
#     else:
#         print("[ERROR] Could not find line to replace")
#         print("Please manually update line 17 in transformers_classifier.py")
#         return False

# def check_model_exists():
#     """Check if fine-tuned model exists"""
#     model_path = "models/finetuned_mental_health_model"
    
#     if os.path.exists(model_path):
#         print(f"[OK] Fine-tuned model found at: {model_path}")
#         return True
#     else:
#         print(f"[WARNING] Fine-tuned model not found at: {model_path}")
#         print("Training may still be in progress. Wait for training to complete.")
#         return False

# if __name__ == "__main__":
#     print("=== Switch to Fine-Tuned Model ===\n")
    
#     # Check if model exists
#     model_exists = check_model_exists()
    
#     if not model_exists:
#         print("\nWaiting for training to complete...")
#         sys.exit(1)
    
#     print()
    
#     # Update classifier
#     success = update_classifier()
    
#     if success:
#         print("\n=== Update Complete ===")
#         print("Your app will now use the fine-tuned model with better accuracy!")
#     else:
#         print("\n=== Update Failed ===")
#         print("Please check the error messages above")
#         sys.exit(1)
