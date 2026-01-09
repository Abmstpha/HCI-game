"""
Face Filter Module for Snapchat-style filters.
Uses MediaPipe Face Mesh for face detection and OpenCV for overlay rendering.
"""
import cv2
import numpy as np
import mediapipe as mp
import os

class FaceFilterProcessor:
    def __init__(self):
        # Initialize MediaPipe Face Mesh
        self.mp_face_mesh = mp.solutions.face_mesh
        self.face_mesh = self.mp_face_mesh.FaceMesh(
            static_image_mode=False,
            max_num_faces=1,
            refine_landmarks=True,
            min_detection_confidence=0.5,
            min_tracking_confidence=0.5
        )
        
        # Load filter assets
        self.filters_dir = os.path.join(os.path.dirname(__file__), 'filters')
        self.filter_assets = {}
        self._load_filter_assets()
    
    def _load_filter_assets(self):
        """Load PNG filter overlays with transparency."""
        # We'll generate simple geometric filters if assets don't exist
        # In production, load actual PNG files
        pass
    
    def _draw_sunglasses(self, frame, landmarks, w, h):
        """Draw cool sunglasses overlay."""
        # Key landmarks for eyes
        left_eye = landmarks[33]  # Left eye outer corner
        right_eye = landmarks[263]  # Right eye outer corner
        nose_bridge = landmarks[168]  # Nose bridge
        
        # Calculate positions
        left_x = int(left_eye.x * w)
        left_y = int(left_eye.y * h)
        right_x = int(right_eye.x * w)
        right_y = int(right_eye.y * h)
        bridge_y = int(nose_bridge.y * h)
        
        # Eye dimensions
        eye_width = int(abs(right_x - left_x) * 0.45)
        eye_height = int(eye_width * 0.5)
        
        # Draw frames
        # Left lens
        cv2.ellipse(frame, (left_x + 30, bridge_y), (eye_width, eye_height), 0, 0, 360, (20, 20, 20), -1)
        cv2.ellipse(frame, (left_x + 30, bridge_y), (eye_width, eye_height), 0, 0, 360, (0, 0, 0), 3)
        
        # Right lens
        cv2.ellipse(frame, (right_x - 30, bridge_y), (eye_width, eye_height), 0, 0, 360, (20, 20, 20), -1)
        cv2.ellipse(frame, (right_x - 30, bridge_y), (eye_width, eye_height), 0, 0, 360, (0, 0, 0), 3)
        
        # Bridge
        cv2.line(frame, (left_x + 30 + eye_width, bridge_y), (right_x - 30 - eye_width, bridge_y), (0, 0, 0), 4)
        
        return frame
    
    def _draw_hat(self, frame, landmarks, w, h):
        """Draw a party/top hat overlay."""
        # Forehead landmarks
        forehead_center = landmarks[10]  # Top of forehead
        left_temple = landmarks[21]
        right_temple = landmarks[251]
        
        center_x = int(forehead_center.x * w)
        top_y = int(forehead_center.y * h)
        left_x = int(left_temple.x * w)
        right_x = int(right_temple.x * w)
        
        hat_width = int(abs(right_x - left_x) * 1.3)
        hat_height = int(hat_width * 0.8)
        
        # Hat body (top hat shape)
        pts = np.array([
            [center_x - hat_width//2, top_y - 20],
            [center_x - hat_width//3, top_y - hat_height],
            [center_x + hat_width//3, top_y - hat_height],
            [center_x + hat_width//2, top_y - 20],
        ], np.int32)
        cv2.fillPoly(frame, [pts], (30, 30, 30))
        cv2.polylines(frame, [pts], True, (0, 0, 0), 3)
        
        # Hat brim
        cv2.ellipse(frame, (center_x, top_y - 15), (hat_width//2 + 30, 15), 0, 0, 360, (30, 30, 30), -1)
        cv2.ellipse(frame, (center_x, top_y - 15), (hat_width//2 + 30, 15), 0, 0, 360, (0, 0, 0), 3)
        
        # Hat band
        cv2.rectangle(frame, (center_x - hat_width//3, top_y - 50), (center_x + hat_width//3, top_y - 35), (200, 50, 50), -1)
        
        return frame
    
    def _draw_cigar(self, frame, landmarks, w, h):
        """Draw a cigar at the mouth."""
        # Mouth landmarks
        mouth_left = landmarks[61]
        mouth_right = landmarks[291]
        mouth_center = landmarks[0]  # Lower lip center
        
        left_x = int(mouth_left.x * w)
        right_x = int(mouth_right.x * w)
        center_y = int(mouth_center.y * h)
        
        # Cigar body
        cigar_length = 80
        cigar_height = 12
        start_x = right_x + 5
        
        # Brown cigar
        cv2.rectangle(frame, (start_x, center_y - cigar_height//2), 
                     (start_x + cigar_length, center_y + cigar_height//2), 
                     (50, 100, 140), -1)
        cv2.rectangle(frame, (start_x, center_y - cigar_height//2), 
                     (start_x + cigar_length, center_y + cigar_height//2), 
                     (30, 60, 100), 2)
        
        # Ash tip
        cv2.rectangle(frame, (start_x + cigar_length, center_y - cigar_height//2),
                     (start_x + cigar_length + 10, center_y + cigar_height//2),
                     (150, 150, 150), -1)
        
        # Smoke effect (simple circles)
        for i in range(3):
            offset = i * 15
            radius = 8 + i * 4
            alpha = 0.5 - i * 0.15
            overlay = frame.copy()
            cv2.circle(overlay, (start_x + cigar_length + 15 + offset, center_y - 15 - offset), radius, (200, 200, 200), -1)
            cv2.addWeighted(overlay, alpha, frame, 1 - alpha, 0, frame)
        
        return frame
    
    def _draw_beard(self, frame, landmarks, w, h):
        """Draw a full beard."""
        # Chin and jaw landmarks
        chin = landmarks[152]
        left_jaw = landmarks[234]
        right_jaw = landmarks[454]
        mouth_bottom = landmarks[17]
        
        chin_x = int(chin.x * w)
        chin_y = int(chin.y * h)
        left_x = int(left_jaw.x * w)
        right_x = int(right_jaw.x * w)
        mouth_y = int(mouth_bottom.y * h)
        
        # Beard shape
        pts = np.array([
            [left_x, mouth_y - 10],
            [left_x - 20, chin_y - 30],
            [chin_x, chin_y + 40],
            [right_x + 20, chin_y - 30],
            [right_x, mouth_y - 10],
        ], np.int32)
        
        # Draw slightly transparent beard
        overlay = frame.copy()
        cv2.fillPoly(overlay, [pts], (40, 40, 40))
        cv2.addWeighted(overlay, 0.7, frame, 0.3, 0, frame)
        
        # Add texture lines
        for i in range(-3, 4):
            offset = i * 15
            cv2.line(frame, (chin_x + offset, mouth_y + 5), (chin_x + offset, chin_y + 30), (30, 30, 30), 1)
        
        return frame
    
    def _draw_mustache(self, frame, landmarks, w, h):
        """Draw a handlebar mustache."""
        # Nose and mouth landmarks
        nose_bottom = landmarks[2]
        mouth_top = landmarks[0]
        mouth_left = landmarks[61]
        mouth_right = landmarks[291]
        
        nose_x = int(nose_bottom.x * w)
        nose_y = int(nose_bottom.y * h)
        mouth_y = int(mouth_top.y * h)
        left_x = int(mouth_left.x * w) - 30
        right_x = int(mouth_right.x * w) + 30
        center_y = (nose_y + mouth_y) // 2 - 5
        
        # Mustache curves
        # Left side
        pts_left = np.array([
            [nose_x, center_y - 5],
            [nose_x - 30, center_y - 10],
            [left_x, center_y - 20],
            [left_x - 10, center_y],
            [nose_x - 30, center_y + 5],
            [nose_x, center_y + 5],
        ], np.int32)
        
        # Right side
        pts_right = np.array([
            [nose_x, center_y - 5],
            [nose_x + 30, center_y - 10],
            [right_x, center_y - 20],
            [right_x + 10, center_y],
            [nose_x + 30, center_y + 5],
            [nose_x, center_y + 5],
        ], np.int32)
        
        cv2.fillPoly(frame, [pts_left], (20, 20, 20))
        cv2.fillPoly(frame, [pts_right], (20, 20, 20))
        
        return frame
    
    def _draw_bald(self, frame, landmarks, w, h):
        """Draw a bald head effect (shine on forehead)."""
        # Forehead landmarks
        forehead = landmarks[10]
        left_temple = landmarks[21]
        right_temple = landmarks[251]
        
        center_x = int(forehead.x * w)
        top_y = int(forehead.y * h)
        left_x = int(left_temple.x * w)
        right_x = int(right_temple.x * w)
        
        head_width = int(abs(right_x - left_x) * 0.8)
        
        # Skin color overlay for top of head
        overlay = frame.copy()
        cv2.ellipse(overlay, (center_x, top_y - 30), (head_width, 60), 0, 0, 360, (180, 200, 220), -1)
        cv2.addWeighted(overlay, 0.3, frame, 0.7, 0, frame)
        
        # Shine effect
        cv2.ellipse(frame, (center_x - 20, top_y - 50), (30, 15), -30, 0, 360, (255, 255, 255), 2)
        
        return frame
    
    def _draw_clown_nose(self, frame, landmarks, w, h):
        """Draw a red clown nose."""
        nose_tip = landmarks[4]
        
        nose_x = int(nose_tip.x * w)
        nose_y = int(nose_tip.y * h)
        
        # Big red nose
        cv2.circle(frame, (nose_x, nose_y), 25, (0, 0, 255), -1)
        cv2.circle(frame, (nose_x - 8, nose_y - 8), 8, (100, 100, 255), -1)  # Shine
        
        return frame
    
    def _draw_dog_ears(self, frame, landmarks, w, h):
        """Draw dog ears on top of head."""
        forehead = landmarks[10]
        left_temple = landmarks[21]
        right_temple = landmarks[251]
        
        center_x = int(forehead.x * w)
        top_y = int(forehead.y * h)
        left_x = int(left_temple.x * w)
        right_x = int(right_temple.x * w)
        
        ear_width = 40
        ear_height = 80
        
        # Left ear
        pts_left = np.array([
            [left_x - 20, top_y - 20],
            [left_x - 60, top_y - ear_height],
            [left_x + 20, top_y - 30],
        ], np.int32)
        cv2.fillPoly(frame, [pts_left], (100, 80, 60))
        cv2.polylines(frame, [pts_left], True, (50, 40, 30), 3)
        
        # Right ear
        pts_right = np.array([
            [right_x + 20, top_y - 20],
            [right_x + 60, top_y - ear_height],
            [right_x - 20, top_y - 30],
        ], np.int32)
        cv2.fillPoly(frame, [pts_right], (100, 80, 60))
        cv2.polylines(frame, [pts_right], True, (50, 40, 30), 3)
        
        return frame
    
    def process_frame(self, frame, filter_type='sunglasses'):
        """Process a frame and apply the selected filter."""
        h, w, _ = frame.shape
        
        # Convert to RGB for MediaPipe
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = self.face_mesh.process(rgb_frame)
        
        face_detected = False
        
        if results.multi_face_landmarks:
            face_detected = True
            for face_landmarks in results.multi_face_landmarks:
                landmarks = face_landmarks.landmark
                
                # Apply selected filter
                if filter_type == 'sunglasses':
                    frame = self._draw_sunglasses(frame, landmarks, w, h)
                elif filter_type == 'hat':
                    frame = self._draw_hat(frame, landmarks, w, h)
                elif filter_type == 'cigar':
                    frame = self._draw_cigar(frame, landmarks, w, h)
                elif filter_type == 'beard':
                    frame = self._draw_beard(frame, landmarks, w, h)
                elif filter_type == 'mustache':
                    frame = self._draw_mustache(frame, landmarks, w, h)
                elif filter_type == 'bald':
                    frame = self._draw_bald(frame, landmarks, w, h)
                elif filter_type == 'clown':
                    frame = self._draw_clown_nose(frame, landmarks, w, h)
                elif filter_type == 'dog':
                    frame = self._draw_dog_ears(frame, landmarks, w, h)
                # 'none' = no filter applied
        
        return frame, face_detected


# Global instance
face_filter_processor = FaceFilterProcessor()
