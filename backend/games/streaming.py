"""
Streaming module for video feeds with MediaPipe/DeepFace processing.
CLEAN VIDEO - No text overlays on video. Status sent separately.
"""
import cv2
import mediapipe as mp
import math
import time
import numpy as np
from collections import deque, Counter
import threading
import json

# Global state for each stream type
stream_states = {
    "gesture": {"status": "waiting", "gesture": "None", "message": "Show your hand"},
    "pose": {"status": "waiting", "pose": "None", "message": "Step into frame"},
    "emotion": {"status": "waiting", "emotion": "neutral", "message": "Analyzing..."}
}
state_lock = threading.Lock()

# Try importing DeepFace
try:
    from deepface import DeepFace
    DEEPFACE_AVAILABLE = True
except ImportError:
    DEEPFACE_AVAILABLE = False
    print("DeepFace not available. Emotion detection will be disabled.")


# ============== HAND GESTURE STREAM (CLEAN) ==============
class HandGestureStream:
    def __init__(self):
        try:
            self.mp_hands = mp.solutions.hands
            self.mp_draw = mp.solutions.drawing_utils
            self.mp_styles = mp.solutions.drawing_styles
        except AttributeError:
            import mediapipe.python.solutions as solutions
            mp.solutions = solutions
            self.mp_hands = mp.solutions.hands
            self.mp_draw = mp.solutions.drawing_utils
            self.mp_styles = mp.solutions.drawing_styles

        self.hands = self.mp_hands.Hands(
            max_num_hands=1,
            min_detection_confidence=0.7,
            min_tracking_confidence=0.5,
            model_complexity=1
        )

    def process_frame(self, frame):
        h, w, c = frame.shape
        img_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = self.hands.process(img_rgb)
        
        gesture = "None"
        message = "Show your hand to the camera"
        
        if results.multi_hand_landmarks:
            for hand_lms in results.multi_hand_landmarks:
                # Draw hand landmarks with nice styling (no text!)
                self.mp_draw.draw_landmarks(
                    frame, 
                    hand_lms, 
                    self.mp_hands.HAND_CONNECTIONS,
                    self.mp_styles.get_default_hand_landmarks_style(),
                    self.mp_styles.get_default_hand_connections_style()
                )
                
                # Detect gesture
                idx_x = int(hand_lms.landmark[8].x * w)
                idx_y = int(hand_lms.landmark[8].y * h)
                thumb_x = int(hand_lms.landmark[4].x * w)
                thumb_y = int(hand_lms.landmark[4].y * h)
                dist = math.hypot(idx_x - thumb_x, idx_y - thumb_y)
                
                # Draw cursor circle
                if dist < 40:
                    cv2.circle(frame, (idx_x, idx_y), 20, (0, 255, 0), cv2.FILLED)
                    cv2.circle(frame, (idx_x, idx_y), 25, (255, 255, 255), 3)
                    gesture = "Pinch Click"
                    message = "✅ Click detected!"
                else:
                    cv2.circle(frame, (idx_x, idx_y), 15, (255, 0, 255), cv2.FILLED)
                    cv2.circle(frame, (idx_x, idx_y), 18, (255, 255, 255), 2)
                    
                    # Count fingers
                    fingers_up = 0
                    tip_ids = [4, 8, 12, 16, 20]
                    pip_ids = [2, 6, 10, 14, 18]
                    for tip, pip in zip(tip_ids, pip_ids):
                        if hand_lms.landmark[tip].y < hand_lms.landmark[pip].y:
                            fingers_up += 1
                    
                    if fingers_up >= 4:
                        gesture = "Open Hand"
                        message = "👋 Wave gesture detected"
                    elif fingers_up == 0:
                        gesture = "Fist"
                        message = "✊ Fist gesture detected"
                    elif fingers_up == 1:
                        gesture = "Pointing"
                        message = "👆 Pointing gesture"
                    elif fingers_up == 2:
                        gesture = "Peace"
                        message = "✌️ Peace sign detected"
                    else:
                        gesture = f"{fingers_up} Fingers"
                        message = f"Showing {fingers_up} fingers"
        
        # Update global state
        with state_lock:
            stream_states["gesture"] = {
                "status": "active" if gesture != "None" else "waiting",
                "gesture": gesture,
                "message": message
            }
        
        return frame


# ============== POSE STREAM (CLEAN) ==============
class PoseStream:
    def __init__(self):
        try:
            self.mp_pose = mp.solutions.pose
            self.mp_draw = mp.solutions.drawing_utils
            self.mp_styles = mp.solutions.drawing_styles
        except AttributeError:
            import mediapipe.python.solutions as solutions
            mp.solutions = solutions
            self.mp_pose = mp.solutions.pose
            self.mp_draw = mp.solutions.drawing_utils
            self.mp_styles = mp.solutions.drawing_styles

        self.pose = self.mp_pose.Pose(
            min_detection_confidence=0.5,
            min_tracking_confidence=0.5,
            model_complexity=1,
            smooth_landmarks=True
        )

    def process_frame(self, frame):
        h, w, c = frame.shape
        img_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = self.pose.process(img_rgb)
        
        pose = "None"
        message = "Step back so I can see you"
        
        if results.pose_landmarks:
            # Draw skeleton only (no text!)
            self.mp_draw.draw_landmarks(
                frame, 
                results.pose_landmarks,
                self.mp_pose.POSE_CONNECTIONS,
                landmark_drawing_spec=self.mp_styles.get_default_pose_landmarks_style()
            )
            
            landmarks = results.pose_landmarks.landmark
            
            # Get key points
            nose = landmarks[self.mp_pose.PoseLandmark.NOSE]
            left_wrist = landmarks[self.mp_pose.PoseLandmark.LEFT_WRIST]
            right_wrist = landmarks[self.mp_pose.PoseLandmark.RIGHT_WRIST]
            left_shoulder = landmarks[self.mp_pose.PoseLandmark.LEFT_SHOULDER]
            right_shoulder = landmarks[self.mp_pose.PoseLandmark.RIGHT_SHOULDER]
            
            # Detect poses
            if left_wrist.y < nose.y and right_wrist.y < nose.y:
                pose = "Hands Up"
                message = "🙌 Both hands raised!"
            elif (abs(left_wrist.y - left_shoulder.y) < 0.15 and 
                  abs(right_wrist.y - right_shoulder.y) < 0.15):
                pose = "T-Pose"
                message = "✈️ T-Pose detected!"
            elif left_wrist.y < left_shoulder.y and right_wrist.y > right_shoulder.y:
                pose = "Left Raised"
                message = "👈 Left arm raised"
            elif right_wrist.y < right_shoulder.y and left_wrist.y > left_shoulder.y:
                pose = "Right Raised"
                message = "👉 Right arm raised"
            else:
                pose = "Standing"
                message = "🧍 Standing position"
        
        # Update global state
        with state_lock:
            stream_states["pose"] = {
                "status": "active" if pose != "None" else "waiting",
                "pose": pose,
                "message": message
            }
        
        return frame


# ============== EMOTION STREAM (CLEAN) ==============
class EmotionStream:
    def __init__(self):
        self.emotion = "neutral"
        self.emotion_history = deque(maxlen=5)
        self.last_analysis = 0
        self.analysis_interval = 0.5

    def process_frame(self, frame):
        current_time = time.time()
        
        emotion = "neutral"
        message = "😐 Analyzing your expression..."
        
        # Only analyze periodically
        if DEEPFACE_AVAILABLE and (current_time - self.last_analysis > self.analysis_interval):
            try:
                results = DeepFace.analyze(
                    img_path=frame,
                    actions=['emotion'],
                    enforce_detection=False,
                    detector_backend='opencv',
                    silent=True
                )
                if results:
                    detected = results[0]['dominant_emotion']
                    self.emotion_history.append(detected)
                    emotion = Counter(self.emotion_history).most_common(1)[0][0]
                self.last_analysis = current_time
            except Exception:
                pass
        else:
            emotion = self.emotion
        
        self.emotion = emotion
        
        # Generate message based on emotion
        emotion_messages = {
            "happy": "😊 You look happy!",
            "sad": "😢 Feeling down?",
            "angry": "😠 Take a deep breath",
            "surprise": "😲 What surprised you?",
            "neutral": "😐 Looking calm",
            "fear": "😨 It's okay, relax",
            "disgust": "🤢 Something unpleasant?"
        }
        message = emotion_messages.get(emotion, "😐 Analyzing...")
        
        # Update global state
        with state_lock:
            stream_states["emotion"] = {
                "status": "active",
                "emotion": emotion,
                "message": message
            }
        
        # NO text on video - just return clean frame
        return frame


# ============== STREAM GENERATOR (HIGH QUALITY) ==============
def generate_stream(stream_type: str):
    """
    Generator function that yields MJPEG frames.
    HIGH QUALITY, NO TEXT OVERLAYS.
    """
    cap = cv2.VideoCapture(0)
    # HIGH RESOLUTION
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)
    cap.set(cv2.CAP_PROP_FPS, 30)
    
    # Initialize the appropriate processor
    if stream_type == "gesture":
        processor = HandGestureStream()
    elif stream_type == "pose":
        processor = PoseStream()
    elif stream_type == "emotion":
        processor = EmotionStream()
    else:
        processor = None
    
    try:
        while True:
            success, frame = cap.read()
            if not success:
                break
            
            frame = cv2.flip(frame, 1)  # Mirror
            
            if processor:
                frame = processor.process_frame(frame)
            
            # HIGH QUALITY JPEG (95%)
            ret, buffer = cv2.imencode('.jpg', frame, [cv2.IMWRITE_JPEG_QUALITY, 95])
            if not ret:
                continue
            
            yield (
                b'--frame\r\n'
                b'Content-Type: image/jpeg\r\n\r\n' + buffer.tobytes() + b'\r\n'
            )
    finally:
        cap.release()


def get_stream_status(stream_type: str) -> dict:
    """Get the current status for a stream type."""
    with state_lock:
        return stream_states.get(stream_type, {"status": "unknown"})
