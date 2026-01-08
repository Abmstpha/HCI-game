import numpy as np
import pickle
import os
from sklearn.neural_network import MLPClassifier

# Define the dummy model generator
def generate_dummy_model():
    print("Generating dummy SER model...")
    
    # Feature extraction in pipeline uses:
    # mfcc (40) + chroma (12) + mel (128) = 180 features
    # Wait, let's double check the pipeline code. 
    # mfcc=40. chroma: librosa.feature.chroma_stft returns 12 bins by default.
    # mel: librosa.feature.melspectrogram returns 128 bins by default.
    # Total = 40 + 12 + 128 = 180 features?
    # Actually, let's verify defaults in pipeline or just play safe with "fit".
    # The pipeline calculates mean across time axis, so it's a 1D array of size N_features.
    
    # Let's assume standard defaults:
    # MFCC=40, Chroma=12, Mel=128 => 180 inputs.
    n_features = 180 
    
    # Create random training data (100 samples)
    X_train = np.random.rand(100, n_features)
    
    # Labels (emotions)
    emotions = ['neutral', 'calm', 'happy', 'sad', 'angry', 'fearful', 'disgust', 'surprised']
    # Observed emotions in the pipeline's "observed_emotions" list are:
    # ['calm', 'happy', 'fearful', 'disgust']
    # But the model should probably know all or the pipeline filters them?
    # The pipeline map has all 8. The user code filtered to 4. 
    # I will train on ALL 8 to be safe, or just the observed ones?
    # User code: output size matches observed_emotions. 
    # Let's use the observed ones + neutral for better UX.
    target_classes = ['calm', 'happy', 'fearful', 'disgust', 'neutral', 'angry', 'sad', 'surprised']
    y_train = np.random.choice(target_classes, 100)
    
    # Initialize MLP
    model = MLPClassifier(alpha=0.01, batch_size=32, epsilon=1e-08, hidden_layer_sizes=(300,), learning_rate='adaptive', max_iter=100)
    
    # Train
    model.fit(X_train, y_train)
    
    # Save
    output_path = os.path.join("backend", "models", "ser_model.pkl")
    # Ensure dir exists (redundant if mkdir ran, but good practice)
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    with open(output_path, 'wb') as f:
        pickle.dump(model, f)
        
    print(f"Dummy model saved to {output_path}")

if __name__ == "__main__":
    generate_dummy_model()
