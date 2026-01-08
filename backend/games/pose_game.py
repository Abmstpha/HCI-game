import cv2
import mediapipe as mp
import time

import math
import sys
import os

# Robust import for utils
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.append(current_dir)
try:
    from utils import OneEuroFilter
except ImportError:
    # If run directly not as module
    from backend.games.utils import OneEuroFilter

try:
    mp_pose = mp.solutions.pose
    mp_drawing = mp.solutions.drawing_utils
    mp_drawing_styles = mp.solutions.drawing_styles
except AttributeError:
    import mediapipe.python.solutions as solutions
    mp.solutions = solutions
    mp_pose = mp.solutions.pose
    mp_drawing = mp.solutions.drawing_utils
    mp_drawing_styles = mp.solutions.drawing_styles

def main():
    cap = cv2.VideoCapture(0)
    with mp_pose.Pose(
        min_detection_confidence=0.5,
        min_tracking_confidence=0.5,
        model_complexity=1,
        smooth_landmarks=True) as pose:
        
        # Smoothing filters for key landmarks (optional if built-in smooth is enough, but we add for custom metrics)
        pass # Using MediaPipe's built-in smooth_landmarks=True is often efficient enough for pose

        
        while cap.isOpened():
            success, image = cap.read()
            if not success:
                print("Ignoring empty camera frame.")
                continue

            # To improve performance, optionally mark the image as not writeable to
            # pass by reference.
            image.flags.writeable = False
            image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            results = pose.process(image)

            # Draw the pose annotation on the image.
            image.flags.writeable = True
            image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)
            
            mp_drawing.draw_landmarks(
                image,
                results.pose_landmarks,
                mp_pose.POSE_CONNECTIONS,
                landmark_drawing_spec=mp_drawing_styles.get_default_pose_landmarks_style())
            
            # --- ROBUSTNESS: Pose Classification Logic ---
            status_text = "Status: Idle"
            color = (0, 255, 0)
            
            if results.pose_landmarks:
                landmarks = results.pose_landmarks.landmark
                
                # Get Y coordinates (0 is top, 1 is bottom)
                nose_y = landmarks[mp_pose.PoseLandmark.NOSE].y
                wrist_l_y = landmarks[mp_pose.PoseLandmark.LEFT_WRIST].y
                wrist_r_y = landmarks[mp_pose.PoseLandmark.RIGHT_WRIST].y
                
                # Check for "Hands Up" (Wrists above Nose)
                if wrist_l_y < nose_y and wrist_r_y < nose_y:
                    status_text = "Status: HANDS UP! \o/"
                    color = (0, 255, 255) # Yellow
                
                # Check for "T-Pose" (Rough approximation)
                # ... (omitted for brevity, keeping it simple robust example)
                
            # Draw Status
            cv2.putText(image, status_text, (50, 50), cv2.FONT_HERSHEY_SIMPLEX, 1.5, color, 3)
            
            # Flip the image horizontally for a selfie-view display.
            cv2.imshow('MediaPipe Pose', cv2.flip(image, 1))
            
            # Exit on 'q' or 'ESC'
            key = cv2.waitKey(5) & 0xFF
            if key == ord('q') or key == 27:
                break
                
    cap.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    main()
