"""
Combine ALL training datasets into one MEGA dataset
Merges: train.tsv, train_augmented.tsv, train_expanded.tsv, 
        train_final.tsv, train_massive.tsv, train_ultra.tsv
"""
import pandas as pd
import os

def combine_all_datasets():
    """Combine all available training datasets and remove duplicates"""
    
    # Paths
    script_dir = os.path.dirname(os.path.abspath(__file__))
    ai_guidance_dir = os.path.dirname(script_dir)
    fyp_backend_dir = os.path.dirname(ai_guidance_dir)
    fyp_dir = os.path.dirname(fyp_backend_dir)
    root_dir = os.path.dirname(fyp_dir)
    
    motioncode_data = os.path.join(root_dir, 'motioncode', 'data')
    output_dir = os.path.join(ai_guidance_dir, 'datasets')
    
    # All training files
    train_files = [
        os.path.join(motioncode_data, 'train.tsv'),
        os.path.join(motioncode_data, 'train_augmented.tsv'),
        os.path.join(motioncode_data, 'train_expanded.tsv'),
        os.path.join(motioncode_data, 'train_final.tsv'),
        os.path.join(motioncode_data, 'train_massive.tsv'),
        os.path.join(motioncode_data, 'train_ultra.tsv'),
    ]
    
    print("="*70)
    print("COMBINING ALL TRAINING DATASETS")
    print("="*70)
    
    all_data = []
    total_before = 0
    
    # Load all datasets
    for file_path in train_files:
        if os.path.exists(file_path):
            file_name = os.path.basename(file_path)
            try:
                df = pd.read_csv(file_path, sep='\t', header=None, names=['text', 'emotions', 'id'])
                count = len(df)
                total_before += count
                all_data.append(df)
                print(f"✓ Loaded {file_name:25s} - {count:6,} samples")
            except Exception as e:
                print(f"✗ Failed to load {file_name}: {e}")
        else:
            print(f"✗ Not found: {os.path.basename(file_path)}")
    
    if not all_data:
        print("\n❌ No datasets found!")
        return
    
    # Combine all
    print(f"\n{'='*70}")
    print("MERGING DATASETS")
    print(f"{'='*70}")
    
    combined_df = pd.concat(all_data, ignore_index=True)
    print(f"Total samples before deduplication: {len(combined_df):,}")
    
    # Remove duplicates based on text
    combined_df = combined_df.drop_duplicates(subset=['text'], keep='first')
    unique_count = len(combined_df)
    
    print(f"Unique samples after deduplication: {unique_count:,}")
    print(f"Duplicates removed: {total_before - unique_count:,}")
    
    # Save mega dataset
    output_path = os.path.join(output_dir, 'train_mega.tsv')
    combined_df.to_csv(output_path, sep='\t', header=False, index=False)
    
    print(f"\n{'='*70}")
    print("MEGA DATASET CREATED")
    print(f"{'='*70}")
    print(f"✓ Saved to: train_mega.tsv")
    print(f"✓ Total samples: {unique_count:,}")
    print(f"✓ Size: {os.path.getsize(output_path) / (1024*1024):.2f} MB")
    
    # Show emotion distribution
    print(f"\n{'='*70}")
    print("EMOTION DISTRIBUTION")
    print(f"{'='*70}")
    
    emotion_counts = {}
    for emotions_str in combined_df['emotions']:
        if pd.notna(emotions_str):
            # Get first emotion (dominant)
            emotion = str(emotions_str).split(',')[0].strip()
            emotion_counts[emotion] = emotion_counts.get(emotion, 0) + 1
    
    # Sort by count
    sorted_emotions = sorted(emotion_counts.items(), key=lambda x: x[1], reverse=True)
    
    print("\nTop 15 emotions:")
    for i, (emotion, count) in enumerate(sorted_emotions[:15], 1):
        percentage = (count / unique_count) * 100
        print(f"{i:2d}. {emotion:20s} - {count:5,} samples ({percentage:5.2f}%)")
    
    print(f"\n✅ MEGA DATASET READY FOR TRAINING!")
    print(f"   Run: python scripts\\finetune_transformer.py")

if __name__ == "__main__":
    combine_all_datasets()
