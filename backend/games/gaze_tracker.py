import cv2
import dlib
import numpy as np
import os

class GazeTracker:
    def __init__(self):
        self.detector = dlib.get_frontal_face_detector()
        
        # Path where Dockerfile puts the model
        model_path = "backend/models/shape_predictor_68_face_landmarks.dat"
        if not os.path.exists(model_path):
             # Fallback for local testing if path differs
             model_path = os.path.join(os.path.dirname(__file__), "..", "models", "shape_predictor_68_face_landmarks.dat")
        
        try:
            self.predictor = dlib.shape_predictor(model_path)
            print(f"GazeTracker: Loaded model from {model_path}")
        except Exception as e:
            print(f"GazeTracker Error: Could not load model. {e}")
            self.predictor = None

    def get_gaze_direction(self, eye_points, gray_frame):
        try:
            x, y, w, h = cv2.boundingRect(eye_points)
            eye = gray_frame[y:y+h, x:x+w]
            
            # Threshold to isolate pupil/iris (darker) vs sclera (lighter)
            # Threshold value might need tuning depending on lighting
            _, threshold = cv2.threshold(eye, 70, 255, cv2.THRESH_BINARY)
            
            # Calculate white pixels (sclera)
            h_eye, w_eye = threshold.shape
            left_side_white = cv2.countNonZero(threshold[:, :w_eye//2])
            right_side_white = cv2.countNonZero(threshold[:, w_eye//2:])
            
            # Determine direction:
            # If looking LEFT (video is mirrored?), the iris moves LEFT, so MORE WHITE on RIGHT side.
            # Wait, let's stick to the user's logic:
            if left_side_white > right_side_white:
                return "Right"
            elif right_side_white > left_side_white:
                return "Left"
            else:
                return "Center"
        except Exception:
            return "Unknown"

    def process_frame(self, frame):
        if self.predictor is None:
            return frame, "Model Error"

        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces = self.detector(gray)
        
        direction = "No Face"
        
        if len(faces) > 0:
            face = faces[0]
            landmarks = self.predictor(gray, face)

            # Left Eye: 36-41
            left_eye_pts = np.array([[landmarks.part(n).x, landmarks.part(n).y] for n in range(36, 42)])
            # Right Eye: 42-47
            right_eye_pts = np.array([[landmarks.part(n).x, landmarks.part(n).y] for n in range(42, 48)])

            # Estimate gaze
            left_gaze = self.get_gaze_direction(left_eye_pts, gray)
            right_gaze = self.get_gaze_direction(right_eye_pts, gray)
            
            # Consolidate
            if left_gaze == right_gaze:
                direction = left_gaze
            else:
                direction = f"L:{left_gaze} R:{right_gaze}"

            # Visualization
            # Draw landmarks
            for n in range(36, 48):
                x = landmarks.part(n).x
                y = landmarks.part(n).y
                cv2.circle(frame, (x, y), 2, (0, 255, 0), -1)
                
            # Draw Face Box
            x, y, w, h = face.left(), face.top(), face.width(), face.height()
            cv2.rectangle(frame, (x, y), (x + w, y + h), (255, 0, 0), 2)
            
            # Draw Direction
            cv2.putText(frame, f"Gaze: {direction}", (x, y - 10), 
                        cv2.FONT_HERSHEY_SIMPLEX, 0.9, (0, 255, 255), 2)

        return frame, direction

# Singleton
gaze_tracker = GazeTracker()
