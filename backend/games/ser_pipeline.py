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
                try:
                    with open(self.model_path, 'rb') as file:
                        self.model = pickle.load(file)
                    print(f"SER Model loaded successfully from {self.model_path}")
                except Exception as pickle_error:
                    print(f"Failed to unpickle model (numpy version mismatch?): {pickle_error}")
                    print("Using fallback rule-based emotion detection")
                    self.model = None
                    self.use_fallback = True
            else:
                print("SER Model not found. Using fallback mode.")
                self.use_fallback = True
        except Exception as e:
            print(f"Failed to load SER model: {e}")
            self.use_fallback = True

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
        # Check for fallback mode
        if hasattr(self, 'use_fallback') and self.use_fallback:
            return self._fallback_predict(audio_bytes)
        
        if not self.model:
            return self._fallback_predict(audio_bytes)
        
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
    
    def _fallback_predict(self, audio_bytes):
        """
        Fallback emotion detection using simple audio features.
        Uses energy (RMS) and pitch variance for basic classification.
        """
        try:
            # Load audio
            audio_data, sample_rate = sf.read(io.BytesIO(audio_bytes))
            if len(audio_data.shape) > 1:
                audio_data = audio_data.mean(axis=1)
            
            # Calculate simple features
            rms_energy = np.sqrt(np.mean(audio_data**2))
            zero_crossings = np.sum(np.abs(np.diff(np.sign(audio_data)))) / len(audio_data)
            
            # Simple rule-based classification
            # High energy + high ZCR = excited (happy/angry)
            # Low energy + low ZCR = calm/sad
            # Medium = neutral
            
            energy_threshold_high = 0.1
            energy_threshold_low = 0.02
            zcr_threshold = 0.15
            
            if rms_energy > energy_threshold_high:
                if zero_crossings > zcr_threshold:
                    emotion = "happy"
                    confidence = 0.65
                else:
                    emotion = "angry"
                    confidence = 0.55
            elif rms_energy < energy_threshold_low:
                emotion = "sad"
                confidence = 0.50
            else:
                if zero_crossings > zcr_threshold:
                    emotion = "fearful"
                    confidence = 0.45
                else:
                    emotion = "calm"
                    confidence = 0.60
            
            return {
                "emotion": emotion,
                "confidence": confidence,
                "probabilities": {emotion: confidence},
                "status": "success",
                "mode": "fallback"
            }
        except Exception as e:
            print(f"Fallback prediction error: {e}")
            return {
                "emotion": "neutral",
                "confidence": 0.5,
                "status": "success",
                "mode": "fallback"
            }

# Global instance
ser_engine = SpeechEmotionRecognizer()
