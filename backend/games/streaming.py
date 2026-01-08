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

# ============== STREAMING CONFIG ==============
# Uses MediaPipe (Solutions) for all tracking
# - Hands: GestureStream
# - Pose: PoseStream (Holistic)
# - Emotion: ExpressionLab (FaceMesh)


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


# ============== POSE STREAM (HOLISTIC - BODY + HANDS) ==============
class PoseStream:
    def __init__(self):
        try:
            self.mp_holistic = mp.solutions.holistic
            self.mp_draw = mp.solutions.drawing_utils
            self.mp_styles = mp.solutions.drawing_styles
        except AttributeError:
            import mediapipe.python.solutions as solutions
            mp.solutions = solutions
            self.mp_holistic = mp.solutions.holistic
            self.mp_draw = mp.solutions.drawing_utils
            self.mp_styles = mp.solutions.drawing_styles

        # Use Holistic model for Body + Hands + Face
        self.holistic = self.mp_holistic.Holistic(
            min_detection_confidence=0.5,
            min_tracking_confidence=0.5,
            model_complexity=1,
            smooth_landmarks=True
        )
        
        # Custom drawing specs for high visibility
        self.pose_landmark_spec = self.mp_draw.DrawingSpec(color=(0, 255, 0), thickness=2, circle_radius=2)
        self.pose_connection_spec = self.mp_draw.DrawingSpec(color=(0, 255, 0), thickness=2, circle_radius=2)
        self.hand_landmark_spec = self.mp_draw.DrawingSpec(color=(255, 0, 255), thickness=2, circle_radius=2)
        self.hand_connection_spec = self.mp_draw.DrawingSpec(color=(255, 0, 255), thickness=2, circle_radius=2)

    def process_frame(self, frame):
        h, w, c = frame.shape
        img_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = self.holistic.process(img_rgb)
        
        pose_status = "None"
        message = "Step back so I can see you"
        
        if results.pose_landmarks:
            # Draw Pose (Body)
            self.mp_draw.draw_landmarks(
                frame,
                results.pose_landmarks,
                self.mp_holistic.POSE_CONNECTIONS,
                landmark_drawing_spec=self.pose_landmark_spec,
                connection_drawing_spec=self.pose_connection_spec
            )
            
            # Draw Left Hand
            self.mp_draw.draw_landmarks(
                frame,
                results.left_hand_landmarks,
                self.mp_holistic.HAND_CONNECTIONS,
                landmark_drawing_spec=self.hand_landmark_spec,
                connection_drawing_spec=self.hand_connection_spec
            )

            # Draw Right Hand
            self.mp_draw.draw_landmarks(
                frame,
                results.right_hand_landmarks,
                self.mp_holistic.HAND_CONNECTIONS,
                landmark_drawing_spec=self.hand_landmark_spec,
                connection_drawing_spec=self.hand_connection_spec
            )

            # Draw Face Mesh (Lightweight)
            self.mp_draw.draw_landmarks(
                frame,
                results.face_landmarks,
                self.mp_holistic.FACEMESH_TESSELATION,
                landmark_drawing_spec=None,
                connection_drawing_spec=self.mp_styles.get_default_face_mesh_tesselation_style()
            )
            
            # Logic for pose detection (same as before)
            landmarks = results.pose_landmarks.landmark
            nose = landmarks[self.mp_holistic.PoseLandmark.NOSE]
            left_wrist = landmarks[self.mp_holistic.PoseLandmark.LEFT_WRIST]
            right_wrist = landmarks[self.mp_holistic.PoseLandmark.RIGHT_WRIST]
            left_shoulder = landmarks[self.mp_holistic.PoseLandmark.LEFT_SHOULDER]
            right_shoulder = landmarks[self.mp_holistic.PoseLandmark.RIGHT_SHOULDER]
            
            if left_wrist.y < nose.y and right_wrist.y < nose.y:
                pose_status = "Hands Up"
                message = "🙌 Both hands raised!"
            elif (abs(left_wrist.y - left_shoulder.y) < 0.15 and 
                  abs(right_wrist.y - right_shoulder.y) < 0.15):
                pose_status = "T-Pose"
                message = "✈️ T-Pose detected!"
            elif left_wrist.y < left_shoulder.y and right_wrist.y > right_shoulder.y:
                pose_status = "Left Raised"
                message = "👈 Left arm raised"
            elif right_wrist.y < right_shoulder.y and left_wrist.y > left_shoulder.y:
                pose_status = "Right Raised"
                message = "👉 Right arm raised"
            else:
                pose_status = "Standing"
                message = "🧍 Standing position"
        
        # Update global state
        with state_lock:
            stream_states["pose"] = {
                "status": "active" if pose_status != "None" else "waiting",
                "pose": pose_status,
                "message": message
            }
        
        return frame


# ============== EXPRESSION LAB (Advanced MediaPipe Logic) ==============
class EmotionStream:
    def __init__(self):
        try:
            # Import MediaPipe solutions
            self.mp_face_mesh = mp.solutions.face_mesh
            self.face_mesh = self.mp_face_mesh.FaceMesh(
                max_num_faces=1,
                refine_landmarks=True, # Critical for accurate eyes/lips
                min_detection_confidence=0.5,
                min_tracking_confidence=0.5
            )
        except Exception as e:
            print(f"MediaPipe FaceMesh init failed: {e}")
            self.face_mesh = None

        self.emotion = "neutral"
        # Scores initialized to 0
        self.scores = {
            "happy": 0.0,
            "sad": 0.0,
            "surprise": 0.0,
            "angry": 0.0,
            "fear": 0.0,
            "natural": 0.0
        }
        # Smoothing factor (0.0 - 1.0). Lower = smoother but slower.
        self.alpha = 0.2

    def get_pt(self, landmarks, idx):
        # Return 3D point (x, y, z)
        return np.array([landmarks[idx].x, landmarks[idx].y, landmarks[idx].z])

    def dist(self, p1, p2):
        return np.linalg.norm(p1 - p2)

    def process_frame(self, frame):
        if not self.face_mesh:
            return frame

        h, w, c = frame.shape
        img_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = self.face_mesh.process(img_rgb)
        
        current_scores = {k: 0.0 for k in self.scores}
        
        if results.multi_face_landmarks:
            lm = results.multi_face_landmarks[0].landmark
            
            # Helper to get numpy point
            p = lambda i: np.array([lm[i].x, lm[i].y, lm[i].z]) # 3D
            # Distance helper (3D)
            d = lambda i, j: np.linalg.norm(p(i) - p(j))

            # --- DIMENSIONS (Normalization) ---
            face_width = d(454, 234) # Ear to ear
            face_height = d(10, 152) # Top to chin
            
            # Normalize all ratios by face_width to be scale-invariant
            norm = face_width
            
            # --- FEATURE 1: MOUTH ---
            mouth_w = d(61, 291)
            mouth_h = d(13, 14) 
            mouth_open_ratio = mouth_h / mouth_w if mouth_w > 0 else 0
            
            # Smile Curve (2D projection is safer for up/down curve, but we check Width)
            # Use raw Y for curve because Z affects depth, but Y is "up/down" on screen
            corners_y = (lm[61].y + lm[291].y) / 2.0
            center_y = (lm[0].y + lm[17].y) / 2.0
            smile_curve = (center_y - corners_y) * 100 
            
            # Smile Width Ratio (Mouth width / Face width)
            mouth_width_ratio = mouth_w / norm

            # --- FEATURE 2: BROWS ---
            # Brow Height (avg distance from eye top to brow)
            brow_L_h = d(159, 66)
            brow_R_h = d(386, 296)
            avg_brow_h = (brow_L_h + brow_R_h) / 2.0
            brow_lift_ratio = avg_brow_h / norm
            
            # Brow Furrow (Distance between inner brows)
            brow_inner_dist = d(66, 296)
            brow_furrow_ratio = brow_inner_dist / norm

            # --- FEATURE 3: EYES ---
            eye_L_h = d(159, 145)
            eye_R_h = d(386, 374)
            avg_eye_h = (eye_L_h + eye_R_h) / 2.0
            eye_open_ratio = avg_eye_h / norm

            # --- LOGIC & SCORING ---
            
            # HAPPY
            # Needs UP curve AND WIDE mouth (prevents head tilt false positives)
            # Natural mouth width ratio is usually ~0.35. Smile is > 0.40
            happy_score = 0
            if smile_curve > 0.5:
                # Only trust curve if mouth is actually wide
                if mouth_width_ratio > 0.42: 
                    happy_score = smile_curve * 50
                elif mouth_width_ratio > 0.38:
                    happy_score = smile_curve * 30
            current_scores["happy"] = min(100, max(0, happy_score)) 
            
            # ANGRY
            # Brows LOW (small lift) OR Brows FURROWED (small inner dist)
            angry_score = 0
            # Brow Furrow is very strong indicator for anger
            if brow_furrow_ratio < 0.16: # Brows touching
                angry_score += 60
            elif brow_furrow_ratio < 0.18:
                angry_score += 30
                
            # Squinting eyes + low brows
            if eye_open_ratio < 0.04 and brow_lift_ratio < 0.15:
                angry_score += 40
            
            current_scores["angry"] = min(100, angry_score)

            # SURPRISE
            # High brows + Open mouth + Open eyes
            surprise_score = 0
            if mouth_open_ratio > 0.3 and eye_open_ratio > 0.06:
                surprise_score += 50
            if brow_lift_ratio > 0.25: # High brows
                surprise_score += 40
            current_scores["surprise"] = min(100, surprise_score)

            # SAD
            # Down curve + Brows strictly NOT furrowed (to distinguish from angry)
            sad_score = 0
            if smile_curve < -1.0 and brow_furrow_ratio > 0.20:
                sad_score = abs(smile_curve) * 40
            current_scores["sad"] = min(100, sad_score)
            
            # FEAR
            # Often confused with surprise: Wide eyes + Open mouth + Brows specific
            # Fear has brows raised but flatter? Hard to distinguish simply.
            fear_score = 0
            if eye_open_ratio > 0.08 and mouth_open_ratio > 0.2:
                 # Slightly different tuning than surprise
                 if brow_lift_ratio < 0.25: # Brows NOT super high
                     fear_score = 40
            current_scores["fear"] = fear_score

            # NATURAL
            # High score if everything else is low
            max_other = max(current_scores.values())
            # Boost natural if neutral face features are met
            if mouth_width_ratio < 0.40 and abs(smile_curve) < 1.0 and eye_open_ratio > 0.04:
                current_scores["natural"] = 100 - (max_other * 0.8)
            else:
                current_scores["natural"] = max(0, 100 - max_other)

            # --- TEMPORAL SMOOTHING ---
            for k in self.scores:
                # EMA
                self.scores[k] = (self.alpha * current_scores.get(k, 0)) + ((1 - self.alpha) * self.scores[k])

            # Find dominant
            self.emotion = max(self.scores, key=self.scores.get)
            
        else:
            # Decay all scores if face lost
            for k in self.scores:
                self.scores[k] *= 0.9
            if max(self.scores.values()) < 10:
                self.emotion = "neutral"

        # Mapping to friendly UI messages
        emotion_messages = {
            "happy": "😊 You look radiant!",
            "sad": "😢 It's okay to be sad.",
            "surprise": "😲 Did something shock you?",
            "angry": "😠 Easy there, tiger.",
            "fear": "😨 You're safe here.",
            "natural": "✨ Natural & Relaxed",
            "neutral": "✨ Natural & Relaxed" 
        }
        
        message = emotion_messages.get(self.emotion, "Analyzing...")
        
        # Prepare scores for UI (convert to int)
        ui_scores = {k: float(v) for k, v in self.scores.items() if v > 1.0}

        # Update global state
        with state_lock:
            stream_states["emotion"] = {
                "status": "active",
                "emotion": self.emotion,
                "scores": ui_scores,
                "message": message
            }
        
        return frame

    def _analysis_complete(self, future):
        # Deprecated in this version
        pass


# ============== STREAM GENERATOR (MAXIMUM QUALITY) ==============
def generate_stream(stream_type: str):
    """
    Generator function that yields MJPEG frames.
    MAXIMUM QUALITY - Uses native camera resolution and MJPEG codec.
    """
    cap = cv2.VideoCapture(0)
    
    # CRITICAL: Set MJPEG codec FIRST before resolution (best practice)
    # This enables hardware-accelerated MJPEG which gives better quality and FPS
    cap.set(cv2.CAP_PROP_FOURCC, cv2.VideoWriter_fourcc(*'MJPG'))
    
    # Request highest possible resolution (camera will use max it supports)
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1920)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 1080)
    cap.set(cv2.CAP_PROP_FPS, 30)
    
    # Disable auto-focus hunting if supported (reduces blur)
    cap.set(cv2.CAP_PROP_AUTOFOCUS, 1)
    
    # Get actual resolution (camera may not support requested)
    actual_w = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    actual_h = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    print(f"Camera streaming at {actual_w}x{actual_h}")
    
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
            
            # MAXIMUM QUALITY JPEG (100% = no compression)
            ret, buffer = cv2.imencode('.jpg', frame, [cv2.IMWRITE_JPEG_QUALITY, 100])
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
