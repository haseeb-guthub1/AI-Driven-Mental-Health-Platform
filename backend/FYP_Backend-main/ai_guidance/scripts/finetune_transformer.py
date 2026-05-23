"""
Fine-tune RoBERTa Transformer on Mental Health Emotion Dataset
Automatically learns from your data without hardcoded keywords
"""
import os
import pandas as pd
import numpy as np
import torch
from torch.utils.data import Dataset, DataLoader
from transformers import (
    RobertaTokenizer, 
    RobertaForSequenceClassification,
    get_linear_schedule_with_warmup
)
from torch.optim import AdamW
from sklearn.metrics import accuracy_score, f1_score, classification_report
from tqdm import tqdm
import json

class EmotionDataset(Dataset):
    """Dataset for emotion text classification"""
    def __init__(self, texts, labels, tokenizer, max_length=128):
        self.texts = texts
        self.labels = labels
        self.tokenizer = tokenizer
        self.max_length = max_length
    
    def __len__(self):
        return len(self.texts)
    
    def __getitem__(self, idx):
        text = str(self.texts[idx])
        label = self.labels[idx]
        
        encoding = self.tokenizer.encode_plus(
            text,
            add_special_tokens=True,
            max_length=self.max_length,
            padding='max_length',
            truncation=True,
            return_attention_mask=True,
            return_tensors='pt'
        )
        
        return {
            'input_ids': encoding['input_ids'].flatten(),
            'attention_mask': encoding['attention_mask'].flatten(),
            'labels': torch.tensor(label, dtype=torch.long)
        }

class TransformerFineTuner:
    """Fine-tune transformer on emotion dataset"""
    
    def __init__(self, model_name='SamLowe/roberta-base-go_emotions'):
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        print(f"Using device: {self.device}")
        
        self.model_name = model_name
        
        # Load emotions list
        script_dir = os.path.dirname(os.path.abspath(__file__))
        ai_guidance_dir = os.path.dirname(script_dir)
        datasets_dir = os.path.join(ai_guidance_dir, 'datasets')
        
        emotions_file = os.path.join(datasets_dir, 'emotions.txt')
        with open(emotions_file, 'r') as f:
            self.emotions = [line.strip() for line in f.readlines()]
        
        self.num_labels = len(self.emotions)
        print(f"Loading {len(self.emotions)} emotion classes")
        
        # Initialize tokenizer and model
        print(f"Loading tokenizer and model: {model_name}")
        self.tokenizer = RobertaTokenizer.from_pretrained(model_name)
        self.model = RobertaForSequenceClassification.from_pretrained(
            model_name,
            num_labels=self.num_labels,
            problem_type="single_label_classification"
        )
        self.model.to(self.device)
        
    def load_data(self, train_file, test_file=None, dev_file=None):
        """Load training and test data from TSV files"""
        print(f"\n{'='*70}")
        print("LOADING DATASET")
        print(f"{'='*70}")
        
        # Load training data
        print(f"Loading training data: {train_file}")
        train_df = pd.read_csv(train_file, sep='\t', header=None, names=['text', 'emotions', 'id'])
        
        # Convert emotion labels to single dominant emotion
        def get_dominant_emotion(emotion_str):
            if pd.isna(emotion_str):
                return 27  # neutral
            emotions = [int(e) for e in str(emotion_str).split(',')]
            return emotions[0] if emotions else 27
        
        train_df['label'] = train_df['emotions'].apply(get_dominant_emotion)
        
        X_train = train_df['text'].tolist()
        y_train = train_df['label'].tolist()
        
        print(f"[OK] Loaded {len(X_train)} training samples")
        
        # Load test data if provided
        X_test, y_test = None, None
        if test_file and os.path.exists(test_file):
            print(f"Loading test data: {test_file}")
            test_df = pd.read_csv(test_file, sep='\t', header=None, names=['text', 'emotions', 'id'])
            test_df['label'] = test_df['emotions'].apply(get_dominant_emotion)
            X_test = test_df['text'].tolist()
            y_test = test_df['label'].tolist()
            print(f"[OK] Loaded {len(X_test)} test samples")
        
        # Load dev data if provided
        X_dev, y_dev = None, None
        if dev_file and os.path.exists(dev_file):
            print(f"Loading dev data: {dev_file}")
            dev_df = pd.read_csv(dev_file, sep='\t', header=None, names=['text', 'emotions', 'id'])
            dev_df['label'] = dev_df['emotions'].apply(get_dominant_emotion)
            X_dev = dev_df['text'].tolist()
            y_dev = dev_df['label'].tolist()
            print(f"[OK] Loaded {len(X_dev)} dev samples")
        
        return X_train, y_train, X_test, y_test, X_dev, y_dev
    
    def create_dataloaders(self, X_train, y_train, X_val=None, y_val=None, batch_size=16):
        """Create PyTorch DataLoaders"""
        train_dataset = EmotionDataset(X_train, y_train, self.tokenizer)
        train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True)
        
        val_loader = None
        if X_val is not None and y_val is not None:
            val_dataset = EmotionDataset(X_val, y_val, self.tokenizer)
            val_loader = DataLoader(val_dataset, batch_size=batch_size)
        
        return train_loader, val_loader
    
    def train(self, train_loader, val_loader=None, epochs=3, learning_rate=2e-5):
        """Train the model"""
        print(f"\n{'='*70}")
        print("TRAINING CONFIGURATION")
        print(f"{'='*70}")
        print(f"Epochs: {epochs}")
        print(f"Learning rate: {learning_rate}")
        print(f"Batch size: {train_loader.batch_size}")
        print(f"Training batches: {len(train_loader)}")
        
        # Optimizer and scheduler
        optimizer = AdamW(self.model.parameters(), lr=learning_rate)
        total_steps = len(train_loader) * epochs
        scheduler = get_linear_schedule_with_warmup(
            optimizer,
            num_warmup_steps=0,
            num_training_steps=total_steps
        )
        
        best_val_acc = 0
        training_history = []
        
        for epoch in range(epochs):
            print(f"\n{'='*70}")
            print(f"EPOCH {epoch + 1}/{epochs}")
            print(f"{'='*70}")
            
            # Training phase
            self.model.train()
            train_loss = 0
            train_preds = []
            train_labels = []
            
            progress_bar = tqdm(train_loader, desc=f"Training Epoch {epoch+1}")
            for batch in progress_bar:
                optimizer.zero_grad()
                
                input_ids = batch['input_ids'].to(self.device)
                attention_mask = batch['attention_mask'].to(self.device)
                labels = batch['labels'].to(self.device)
                
                outputs = self.model(
                    input_ids=input_ids,
                    attention_mask=attention_mask,
                    labels=labels
                )
                
                loss = outputs.loss
                train_loss += loss.item()
                
                loss.backward()
                torch.nn.utils.clip_grad_norm_(self.model.parameters(), 1.0)
                optimizer.step()
                scheduler.step()
                
                # Get predictions
                preds = torch.argmax(outputs.logits, dim=1)
                train_preds.extend(preds.cpu().numpy())
                train_labels.extend(labels.cpu().numpy())
                
                progress_bar.set_postfix({'loss': f'{loss.item():.4f}'})
            
            avg_train_loss = train_loss / len(train_loader)
            train_acc = accuracy_score(train_labels, train_preds)
            
            print(f"\nTraining Loss: {avg_train_loss:.4f}")
            print(f"Training Accuracy: {train_acc*100:.2f}%")
            
            # Validation phase
            val_acc = 0
            if val_loader:
                val_acc, val_loss = self.evaluate(val_loader)
                print(f"Validation Loss: {val_loss:.4f}")
                print(f"Validation Accuracy: {val_acc*100:.2f}%")
                
                if val_acc > best_val_acc:
                    best_val_acc = val_acc
                    print(f"[OK] New best validation accuracy! Saving model...")
                    self.save_model('best_finetuned_model')
            
            training_history.append({
                'epoch': epoch + 1,
                'train_loss': avg_train_loss,
                'train_acc': train_acc,
                'val_loss': val_loss if val_loader else None,
                'val_acc': val_acc if val_loader else None
            })
        
        print(f"\n{'='*70}")
        print("TRAINING COMPLETE")
        print(f"{'='*70}")
        print(f"Best Validation Accuracy: {best_val_acc*100:.2f}%")
        
        return training_history
    
    def evaluate(self, test_loader):
        """Evaluate model on test set"""
        self.model.eval()
        
        test_loss = 0
        all_preds = []
        all_labels = []
        
        with torch.no_grad():
            for batch in tqdm(test_loader, desc="Evaluating"):
                input_ids = batch['input_ids'].to(self.device)
                attention_mask = batch['attention_mask'].to(self.device)
                labels = batch['labels'].to(self.device)
                
                outputs = self.model(
                    input_ids=input_ids,
                    attention_mask=attention_mask,
                    labels=labels
                )
                
                test_loss += outputs.loss.item()
                
                preds = torch.argmax(outputs.logits, dim=1)
                all_preds.extend(preds.cpu().numpy())
                all_labels.extend(labels.cpu().numpy())
        
        avg_test_loss = test_loss / len(test_loader)
        accuracy = accuracy_score(all_labels, all_preds)
        
        return accuracy, avg_test_loss
    
    def save_model(self, save_dir):
        """Save fine-tuned model"""
        script_dir = os.path.dirname(os.path.abspath(__file__))
        ai_guidance_dir = os.path.dirname(script_dir)
        full_save_path = os.path.join(ai_guidance_dir, 'models', save_dir)
        
        os.makedirs(full_save_path, exist_ok=True)
        
        self.model.save_pretrained(full_save_path)
        self.tokenizer.save_pretrained(full_save_path)
        
        # Save emotion labels
        with open(os.path.join(full_save_path, 'emotions.json'), 'w') as f:
            json.dump(self.emotions, f)
        
        print(f"[OK] Model saved to {full_save_path}")
    
    def predict(self, text):
        """Predict emotion for a single text"""
        self.model.eval()
        
        encoding = self.tokenizer.encode_plus(
            text,
            add_special_tokens=True,
            max_length=128,
            padding='max_length',
            truncation=True,
            return_attention_mask=True,
            return_tensors='pt'
        )
        
        input_ids = encoding['input_ids'].to(self.device)
        attention_mask = encoding['attention_mask'].to(self.device)
        
        with torch.no_grad():
            outputs = self.model(input_ids=input_ids, attention_mask=attention_mask)
            logits = outputs.logits
            probs = torch.softmax(logits, dim=1)
            pred = torch.argmax(probs, dim=1)
        
        emotion_idx = pred.item()
        confidence = probs[0][emotion_idx].item()
        
        return self.emotions[emotion_idx], confidence


def main():
    """Main fine-tuning script"""
    print(f"\n{'='*70}")
    print("MENTAL HEALTH EMOTION CLASSIFIER - FINE-TUNING")
    print(f"{'='*70}\n")
    
    # Paths
    script_dir = os.path.dirname(os.path.abspath(__file__))
    ai_guidance_dir = os.path.dirname(script_dir)
    data_dir = os.path.join(ai_guidance_dir, 'datasets')
    
    # Use mega dataset if available (ALL 6 datasets combined), otherwise fallback to others
    if os.path.exists(os.path.join(data_dir, 'train_mega.tsv')):
        train_file = os.path.join(data_dir, 'train_mega.tsv')
        print("[OK] Using MEGA dataset (train_mega.tsv) - ALL 6 DATASETS COMBINED!")
    elif os.path.exists(os.path.join(data_dir, 'train_ultra.tsv')):
        train_file = os.path.join(data_dir, 'train_ultra.tsv')
        print("[OK] Using ULTRA dataset (train_ultra.tsv)")
    elif os.path.exists(os.path.join(data_dir, 'train_massive.tsv')):
        train_file = os.path.join(data_dir, 'train_massive.tsv')
        print("[OK] Using MASSIVE dataset (train_massive.tsv)")
    elif os.path.exists(os.path.join(data_dir, 'train_augmented.tsv')):
        train_file = os.path.join(data_dir, 'train_augmented.tsv')
        print("[OK] Using AUGMENTED dataset (train_augmented.tsv)")
    elif os.path.exists(os.path.join(data_dir, 'train_expanded.tsv')):
        train_file = os.path.join(data_dir, 'train_expanded.tsv')
        print("[OK] Using EXPANDED dataset (train_expanded.tsv)")
    else:
        train_file = os.path.join(data_dir, 'train.tsv')
        print("[OK] Using ORIGINAL dataset (train.tsv)")
    
    test_file = os.path.join(data_dir, 'test.tsv')
    dev_file = os.path.join(data_dir, 'dev.tsv')
    
    # Initialize fine-tuner
    finetuner = TransformerFineTuner(model_name='SamLowe/roberta-base-go_emotions')
    
    # Load data
    X_train, y_train, X_test, y_test, X_dev, y_dev = finetuner.load_data(
        train_file=train_file,
        test_file=test_file,
        dev_file=dev_file
    )
    
    # Create dataloaders
    train_loader, val_loader = finetuner.create_dataloaders(
        X_train, y_train,
        X_dev, y_dev,
        batch_size=16
    )
    
    # Train model (1 epoch for faster training)
    history = finetuner.train(
        train_loader=train_loader,
        val_loader=val_loader,
        epochs=1,
        learning_rate=2e-5
    )
    
    # Final evaluation on test set
    if X_test and y_test:
        print(f"\n{'='*70}")
        print("FINAL TEST EVALUATION")
        print(f"{'='*70}")
        
        test_loader = DataLoader(
            EmotionDataset(X_test, y_test, finetuner.tokenizer),
            batch_size=16
        )
        
        test_acc, test_loss = finetuner.evaluate(test_loader)
        print(f"Test Accuracy: {test_acc*100:.2f}%")
        print(f"Test Loss: {test_loss:.4f}")
    
    # Save final model
    finetuner.save_model('finetuned_mental_health_model')
    
    # Test predictions
    print(f"\n{'='*70}")
    print("TESTING PREDICTIONS")
    print(f"{'='*70}")
    
    test_texts = [
        "I am tired",
        "Feeling numb",
        "I'm floating",
        "Fine",
        "Everyone else seems to have their life figured out except for me",
        "I feel heartbroken",
        "I'm so anxious about everything"
    ]
    
    for text in test_texts:
        emotion, confidence = finetuner.predict(text)
        print(f"\nText: {text}")
        print(f"Emotion: {emotion} ({confidence*100:.1f}%)")
    
    print(f"\n{'='*70}")
    print("[OK] FINE-TUNING COMPLETE!")
    print(f"{'='*70}")
    print(f"\nYour model is saved in: ai_guidance/finetuned_mental_health_model/")
    print(f"Use this model in your app by updating transformers_classifier.py")


if __name__ == "__main__":
    main()
