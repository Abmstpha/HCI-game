import os
import numpy as np
import pickle
import librosa
import soundfile as sf
import io
import warnings

# Suppress warnings
warnings.filterwarnings("ignore")

class SpeechEmotionRecognizer:
    def __init__(self, model_path="model/ser_model.pkl"):
        self.model = None
        current_dir = os.path.dirname(os.path.abspath(__file__))
        # Go up one level to backend root, then to model folder? 
        # Or keep model in games/models? Let's use backend/models
        self.model_path = os.path.join(current_dir, "..", "models", "ser_model.pkl")
        self.emotions = {
            '01': 'neutral',
            '02': 'calm',
            '03': 'happy',
            '04': 'sad',
            '05': 'angry',
            '06': 'fearful',
            '07': 'disgust',
            '08': 'surprised'
        }
        # Emotions observed during training (must match model training!)
        self.observed_emotions = ['calm', 'happy', 'fearful', 'disgust']
        
        # Load model immediately if exists
        self.load_model()
        
    def load_model(self):
        try:
            print(f"DEBUG: Looking for model at: {self.model_path}")
            # Check if directory exists
            model_dir = os.path.dirname(self.model_path)
            if os.path.exists(model_dir):
                print(f"DEBUG: Directory {model_dir} contents: {os.listdir(model_dir)}")
            else:
                print(f"DEBUG: Directory {model_dir} DOES NOT EXIST")

            if os.path.exists(self.model_path):
                with open(self.model_path, 'rb') as file:
                    self.model = pickle.load(file)
                print(f"SER Model loaded successfully from {self.model_path}")
            else:
                print("SER Model not found. Training required or upload model.")
        except Exception as e:
            print(f"Failed to load SER model: {e}")

    def extract_feature(self, audio_data, mfcc=True, chroma=True, mel=True):
        """
        Extract features from audio buffer (BytesIO or bytes).
        """
        try:
            # Load audio using soundfile (librosa load can be slow or problematic with streams)
            # soundfile expects file path or file-like object
            if isinstance(audio_data, bytes):
                audio_io = io.BytesIO(audio_data)
            else:
                audio_io = audio_data

            with sf.SoundFile(audio_io) as sound_file:
                X = sound_file.read(dtype="float32")
                sample_rate = sound_file.samplerate
                
                # If chroma is true, compute STFT
                if chroma:
                    stft = np.abs(librosa.stft(X))
                    
                result = np.array([])
                
                if mfcc:
                    mfccs = np.mean(librosa.feature.mfcc(y=X, sr=sample_rate, n_mfcc=40).T, axis=0)
                    result = np.hstack((result, mfccs))
                    
                if chroma:
                    chroma = np.mean(librosa.feature.chroma_stft(S=stft, sr=sample_rate).T, axis=0)
                    result = np.hstack((result, chroma))
                    
                if mel:
                    mel = np.mean(librosa.feature.melspectrogram(y=X, sr=sample_rate).T, axis=0)
                    result = np.hstack((result, mel))
                    
            return result
        except Exception as e:
            print(f"Error extracting features: {e}")
            return None

    def predict(self, audio_bytes):
        """
        Predict emotion from audio bytes.
        """
        if not self.model:
            # Dummy response if no model (for testing flow)
            return {"emotion": "neutral", "confidence": 0.0, "status": "no_model"}
        
        # Extract features
        features = self.extract_feature(audio_bytes, mfcc=True, chroma=True, mel=True)
        
        if features is None:
            return {"emotion": "error", "message": "Extraction failed"}
            
        # Reshape for sklearn scalar/model (1, -1)
        features = features.reshape(1, -1)
        
        # Predict
        prediction = self.model.predict(features)
        
        # Get probabilities if supported
        try:
            probs = self.model.predict_proba(features)[0]
            confidence = max(probs)
            # Map classes to reliability?
            all_probs = {self.model.classes_[i]: float(probs[i]) for i in range(len(probs))}
        except:
            confidence = 1.0
            all_probs = {}

        return {
            "emotion": prediction[0],
            "confidence": float(confidence),
            "probabilities": all_probs,
            "status": "success"
        }

# Global instance
ser_engine = SpeechEmotionRecognizer()
