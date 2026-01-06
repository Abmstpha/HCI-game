from fastapi import FastAPI, UploadFile, File, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import speech_recognition as sr
import difflib
import time
import io
import wave
from pydub import AudioSegment

app = FastAPI(title="Speech Recognition HCI Lab API")

# CORS middleware for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize recognizer
recognizer = sr.Recognizer()

# Models
class TranscriptionRequest(BaseModel):
    language: str = "en-US"
    target_sentence: str = ""

class TranscriptionResponse(BaseModel):
    transcription: str
    accuracy: float
    latency: float
    success: bool
    error: str = None

class AccuracyRequest(BaseModel):
    original: str
    result: str

class AccuracyResponse(BaseModel):
    accuracy: float

# Helper Functions
import unicodedata
import string

# Helper Functions
def calculate_accuracy(original: str, result: str) -> float:
    """
    Calculate similarity ratio between two strings using robust normalization.
    1. Normalize Unicode (NFC)
    2. Remove punctuation (including common non-English ones)
    3. Normalize whitespace
    4. Case fold
    """
    def clean_text(text: str) -> str:
        # Normalize unicode
        text = unicodedata.normalize('NFC', text)
        # Remove punctuation (add Hindi danda '।', and others if needed)
        punctuation = string.punctuation + "।" + "،" + "؟"
        translator = str.maketrans('', '', punctuation)
        text = text.translate(translator)
        # Normalize whitespace and case
        return " ".join(text.split()).lower()

    original_clean = clean_text(original)
    result_clean = clean_text(result)
    
    # If both are empty after cleaning, return 100% (or 0% if they were supposed to be non-empty?)
    # Assuming valid attempts:
    if not original_clean and not result_clean:
        return 100.0
    if not original_clean: 
        return 0.0

    return difflib.SequenceMatcher(None, original_clean, result_clean).ratio() * 100

# Routes
@app.get("/")
def read_root():
    return {
        "message": "🎤 Speech Recognition HCI Lab API",
        "version": "1.0.0",
        "endpoints": [
            "/transcribe - POST audio file for transcription",
            "/accuracy - POST to calculate accuracy",
            "/health - GET health check"
        ]
    }

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "speech-recognition-api"}
# ... imports ...

@app.post("/transcribe", response_model=TranscriptionResponse)
async def transcribe_audio(
    audio: UploadFile = File(...),
    language: str = Form("en-US"),
    target_sentence: str = Form("")
):
    """
    Transcribe audio file to text using Google Speech Recognition
    """
    start_time = time.time()
    
    try:
        # Read audio file
        audio_data = await audio.read()
        
        # Convert audio to WAV using pydub
        try:
            # Try to load the audio using pydub (handles webm, m4a, etc.)
            audio_segment = AudioSegment.from_file(io.BytesIO(audio_data))
            
            # Export to wav for speech_recognition
            wav_buffer = io.BytesIO()
            audio_segment.export(wav_buffer, format="wav")
            wav_buffer.seek(0)
            
            source_file = wav_buffer
        except Exception as conversion_error:
            print(f"Conversion Error: {str(conversion_error)}")
            # Fallback to original data if conversion fails (might be already wav)
            source_file = io.BytesIO(audio_data)
        
        # Convert to AudioData format
        with sr.AudioFile(source_file) as source:
            audio_input = recognizer.record(source)
        
        # Transcribe
        transcription = recognizer.recognize_google(audio_input, language=language)
        end_time = time.time()
        
        latency = end_time - start_time
        
        # Calculate accuracy if target sentence provided
        accuracy = 0.0
        if target_sentence:
            accuracy = calculate_accuracy(target_sentence, transcription)
        
        return TranscriptionResponse(
            transcription=transcription,
            accuracy=accuracy,
            latency=latency,
            success=True
        )
        
    except sr.UnknownValueError:
        return TranscriptionResponse(
            transcription="",
            accuracy=0.0,
            latency=time.time() - start_time,
            success=False,
            error="Could not understand audio"
        )
    except sr.RequestError as e:
        raise HTTPException(status_code=500, detail=f"API Error: {str(e)}")
    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"ERROR: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@app.post("/accuracy", response_model=AccuracyResponse)
def calculate_text_accuracy(request: AccuracyRequest):
    """
    Calculate accuracy between original and transcribed text
    """
    accuracy = calculate_accuracy(request.original, request.result)
    return AccuracyResponse(accuracy=accuracy)

@app.get("/experiments")
def get_experiments():
    """
    Get list of available experiments
    """
    return {
        "experiments": [
            {
                "id": 1,
                "name": "Speech vs Typing",
                "description": "Compare speed and accuracy of speech vs typing",
                "icon": "⚡",
                "color": "#00ffff"
            },
            {
                "id": 2,
                "name": "Effect of Accent",
                "description": "Test how different accents affect recognition",
                "icon": "🌍",
                "color": "#ff00ff"
            },
            {
                "id": 3,
                "name": "Background Noise",
                "description": "Impact of noise on recognition accuracy",
                "icon": "🔊",
                "color": "#00ff00"
            },
            {
                "id": 4,
                "name": "Multilingual",
                "description": "Test recognition in different languages",
                "icon": "🌐",
                "color": "#ff6600"
            }
        ]
    }

@app.get("/languages")
def get_supported_languages():
    """
    Get list of supported language codes
    """
    return {
        "languages": [
            {"code": "en-US", "name": "English (US)", "flag": "🇺🇸"},
            {"code": "en-GB", "name": "English (UK)", "flag": "🇬🇧"},
            {"code": "es-ES", "name": "Spanish (Spain)", "flag": "🇪🇸"},
            {"code": "fr-FR", "name": "French", "flag": "🇫🇷"},
            {"code": "de-DE", "name": "German", "flag": "🇩🇪"},
            {"code": "it-IT", "name": "Italian", "flag": "🇮🇹"},
            {"code": "pt-BR", "name": "Portuguese (Brazil)", "flag": "🇧🇷"},
            {"code": "ru-RU", "name": "Russian", "flag": "🇷🇺"},
            {"code": "ja-JP", "name": "Japanese", "flag": "🇯🇵"},
            {"code": "ko-KR", "name": "Korean", "flag": "🇰🇷"},
            {"code": "zh-CN", "name": "Chinese (Simplified)", "flag": "🇨🇳"},
            {"code": "ar-SA", "name": "Arabic", "flag": "🇸🇦"},
            {"code": "hi-IN", "name": "Hindi", "flag": "🇮🇳"}
        ]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

