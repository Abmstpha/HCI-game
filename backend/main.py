from fastapi import FastAPI, UploadFile, File, HTTPException, Form
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import speech_recognition as sr
import difflib
import time
import io
import wave
from pydub import AudioSegment
import subprocess
import os
import sys
import threading
import numpy as np
import cv2
import base64

# Import streaming module
import sys
current_dir = os.path.dirname(os.path.abspath(__file__))
games_dir = os.path.join(current_dir, 'games')
if games_dir not in sys.path:
    sys.path.append(games_dir)

try:
    from games.streaming import generate_stream
    STREAMING_AVAILABLE = True
except ImportError as e:
    print(f"Streaming module not available: {e}")
    STREAMING_AVAILABLE = False

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
    # Enhanced fields
    word_count: int = 0
    words_per_minute: float = 0.0
    word_accuracy: dict = {}  # {word: matched}
    feedback: str = ""

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

def calculate_word_accuracy(original: str, result: str) -> dict:
    """
    Calculate word-level accuracy breakdown.
    Returns dict with each original word and whether it was matched.
    """
    def clean_text(text: str) -> list:
        text = unicodedata.normalize('NFC', text)
        punctuation = string.punctuation + "।" + "،" + "؟"
        translator = str.maketrans('', '', punctuation)
        text = text.translate(translator)
        return text.lower().split()
    
    original_words = clean_text(original)
    result_words = clean_text(result)
    
    word_results = {}
    for word in original_words:
        # Check if word exists in result (fuzzy match with 80% threshold)
        matched = False
        for r_word in result_words:
            ratio = difflib.SequenceMatcher(None, word, r_word).ratio()
            if ratio >= 0.8:
                matched = True
                break
        word_results[word] = matched
    
    return word_results

def generate_feedback(accuracy: float, word_accuracy: dict) -> str:
    """
    Generate human-readable feedback based on accuracy.
    """
    if accuracy >= 95:
        return "🎉 Excellent! Near-perfect transcription!"
    elif accuracy >= 85:
        missed = [w for w, matched in word_accuracy.items() if not matched]
        if missed:
            return f"👍 Great job! Minor issues with: '{', '.join(missed[:3])}'"
        return "👍 Great job! Very accurate."
    elif accuracy >= 70:
        missed = [w for w, matched in word_accuracy.items() if not matched]
        return f"⚠️ Good effort. Missed words: '{', '.join(missed[:5])}'"
    elif accuracy >= 50:
        return "🔄 Try speaking more clearly or reducing background noise."
    else:
        return "❌ Low accuracy. Check microphone or speak slower."

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
        
        # Calculate metrics
        accuracy = 0.0
        word_accuracy = {}
        feedback = ""
        word_count = len(transcription.split())
        words_per_minute = (word_count / latency) * 60 if latency > 0 else 0
        
        if target_sentence:
            accuracy = calculate_accuracy(target_sentence, transcription)
            word_accuracy = calculate_word_accuracy(target_sentence, transcription)
            feedback = generate_feedback(accuracy, word_accuracy)
        
        return TranscriptionResponse(
            transcription=transcription,
            accuracy=accuracy,
            latency=latency,
            success=True,
            word_count=word_count,
            words_per_minute=round(words_per_minute, 1),
            word_accuracy=word_accuracy,
            feedback=feedback
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
            },
            {
                "id": 5,
                "name": "Voice Emotion AI",
                "description": "Detect emotions from your speech tone",
                "icon": "🎙️",
                "color": "#f43f5e"
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

@app.post("/games/gesture")
def launch_gesture_game():
    """
    Launch the Gesture Controlled Menu Game in a separate process.
    """
    try:
        # Get absolute path to the game script
        current_dir = os.path.dirname(os.path.abspath(__file__))
        script_path = os.path.join(current_dir, "games", "gesture_game.py")
        
        # Run in a separate thread/process so it doesn't block the API
        def run_script():
            subprocess.run([sys.executable, script_path])
            
        thread = threading.Thread(target=run_script)
        thread.start()
        
        return {"status": "success", "message": "Gesture Game launched!"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/games/pose")
def launch_pose_game():
    """
    Launch the Pose Estimation Game in a separate process.
    """
    try:
        # Get absolute path to the game script
        current_dir = os.path.dirname(os.path.abspath(__file__))
        script_path = os.path.join(current_dir, "games", "pose_game.py")
        
        # Run in a separate thread/process so it doesn't block the API
        def run_script():
            subprocess.run([sys.executable, script_path])
            
        thread = threading.Thread(target=run_script)
        thread.start()
        
        return {"status": "success", "message": "Pose Estimation launched!"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/games/emotion")
def launch_emotion_game():
    """
    Launch the Emotion Responsive AI Game in a separate process.
    """
    try:
        # Get absolute path to the game script
        current_dir = os.path.dirname(os.path.abspath(__file__))
        script_path = os.path.join(current_dir, "games", "emotion_game.py")
        
        # Run in a separate thread/process so it doesn't block the API
        def run_script():
            subprocess.run([sys.executable, script_path])
            
        thread = threading.Thread(target=run_script)
        thread.start()
        
        return {"status": "success", "message": "Emotion Game launched!"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============== STREAMING ENDPOINTS (In-Browser Camera) ==============

@app.get("/stream/gesture")
def stream_gesture():
    """
    Stream hand gesture recognition video feed.
    Use this in an <img> tag: <img src="http://localhost:8000/stream/gesture" />
    """
    if not STREAMING_AVAILABLE:
        raise HTTPException(status_code=503, detail="Streaming not available")
    return StreamingResponse(
        generate_stream("gesture"),
        media_type="multipart/x-mixed-replace; boundary=frame"
    )

@app.get("/stream/pose")
def stream_pose():
    """
    Stream pose estimation video feed.
    """
    if not STREAMING_AVAILABLE:
        raise HTTPException(status_code=503, detail="Streaming not available")
    return StreamingResponse(
        generate_stream("pose"),
        media_type="multipart/x-mixed-replace; boundary=frame"
    )

@app.get("/stream/emotion")
def stream_emotion():
    """
    Stream emotion detection video feed.
    """
    if not STREAMING_AVAILABLE:
        raise HTTPException(status_code=503, detail="Streaming not available")
    return StreamingResponse(
        generate_stream("emotion"),
        media_type="multipart/x-mixed-replace; boundary=frame"
    )

@app.get("/stream/{stream_type}/status")
def get_status(stream_type: str):
    """
    Get the current detection status for a stream.
    Frontend polls this to get gesture/pose/emotion info.
    """
    if not STREAMING_AVAILABLE:
        raise HTTPException(status_code=503, detail="Streaming not available")
    
    try:
        from games.streaming import get_stream_status
        return get_stream_status(stream_type)
    except ImportError:
        return {"status": "error", "message": "Streaming module not loaded"}

# ============== SER ENDPOINTS (Speech Emotion Recognition) ==============
@app.post("/predict-emotion")
async def predict_speech_emotion(
    audio: UploadFile = File(...),
    gender: str = Form("all") # For future use
):
    """
    Predict emotion from speech audio file.
    """
    try:
        from games.ser_pipeline import ser_engine
        
        # Read audio file
        audio_data = await audio.read()
        
        # Predict
        result = ser_engine.predict(audio_data)
        
        return result
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

# ============== GAZE TRACKING ENDPOINT ==============
@app.post("/process-gaze")
async def process_gaze_frame(image: UploadFile = File(...)):
    """
    Process image for Gaze Tracking.
    Returns: JSON with "status", "direction", and "image" (base64 annotated).
    """
    try:
        from games.gaze_tracker import gaze_tracker
        
        contents = await image.read()
        nparr = np.frombuffer(contents, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if img is None:
            return {"status": "error", "message": "Invalid image"}

        # Process
        annotated_frame, direction = gaze_tracker.process_frame(img)
        
        # Encode result
        _, buffer = cv2.imencode('.jpg', annotated_frame)
        base64_image = base64.b64encode(buffer).decode('utf-8')
        
        return {
            "status": "success",
            "direction": direction,
            "image": f"data:image/jpeg;base64,{base64_image}"
        }
    except Exception as e:
        import traceback
        traceback.print_exc()
        return {"status": "error", "message": str(e)}

# Frame processors for native camera approach
frame_processors = {}

@app.post("/process-frame")
async def process_frame(
    frame: UploadFile = File(...),
    type: str = Form("gesture")
):
    """
    Process a single frame from the browser's native camera.
    Returns the detection results without streaming video.
    """
    if not STREAMING_AVAILABLE:
        raise HTTPException(status_code=503, detail="Processing not available")
    
    try:
        import cv2
        import numpy as np
        from games.streaming import HandGestureStream, PoseStream, EmotionStream, get_stream_status
        
        # Read the frame
        frame_data = await frame.read()
        nparr = np.frombuffer(frame_data, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if img is None:
            return {"status": "error", "message": "Invalid frame"}
        
        # Get or create processor
        global frame_processors
        if type not in frame_processors:
            if type == "gesture":
                frame_processors[type] = HandGestureStream()
            elif type == "pose":
                frame_processors[type] = PoseStream()
            elif type == "emotion":
                frame_processors[type] = EmotionStream()
        
    
        processed_frame = None
        processor = frame_processors.get(type)
        if processor:
            # Process frame (updates global state) AND returns annotated frame
            processed_frame = processor.process_frame(img)
        
        # Get status
        response_data = get_stream_status(type)
        
        # Encode processed frame to base64 if available
        if processed_frame is not None:
            import base64
            # Encode to jpg
            ret, buffer = cv2.imencode('.jpg', processed_frame)
            if ret:
                jpg_as_text = base64.b64encode(buffer).decode('utf-8')
                response_data["image"] = f"data:image/jpeg;base64,{jpg_as_text}"
        
        return response_data
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"FRAME PROCESS ERROR: {str(e)}")
        return {"status": "error", "message": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

