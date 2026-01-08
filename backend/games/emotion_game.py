import cv2
from deepface import DeepFace
import threading
import time
import numpy as np
from collections import deque
from collections import Counter

class EmotionUI:
    def __init__(self):
        self.emotion = "neutral"
        self.confidence = 0.0
        self.last_analysis_time = 0
        self.analysis_interval = 0.5  # Analyze every 0.5 seconds
        self.running = True
        self.frame_to_analyze = None
        self.lock = threading.Lock()
        
        # Temporal Smoothing
        self.emotion_history = deque(maxlen=5) # History of last 5 predictions
        self.real_time_emotion = "neutral"
        
        # UI Themes
        self.themes = {
            "happy": {
                "bg_color": (0, 255, 255),  # Yellow (BGR)
                "text_color": (0, 0, 0),
                "message": "Great to see you happy!",
                "icon": "thumbs_up"
            },
            "sad": {
                "bg_color": (255, 200, 150), # Light Blue (BGR)
                "text_color": (50, 50, 50),
                "message": "Take a deep breath. It's okay.",
                "icon": "heart"
            },
            "angry": {
                "bg_color": (100, 100, 200), # Light Red (BGR)
                "text_color": (255, 255, 255),
                "message": "Focus Mode. Minimal UI.",
                "icon": "minus"
            },
            "surprise": {
                "bg_color": (200, 100, 200), # Purple (BGR)
                "text_color": (255, 255, 255),
                "message": "Need Help? Showing Tutorial...",
                "icon": "question"
            },
            "neutral": {
                "bg_color": (240, 240, 240), # Light Gray (BGR)
                "text_color": (0, 0, 0),
                "message": "System Normal.",
                "icon": "circle"
            },
            "fear": {
                "bg_color": (50, 0, 50), # Dark (BGR)
                "text_color": (255, 255, 255),
                "message": "Stay Calm.",
                "icon": "exclamation"
            }
        }

    def analyze_loop(self):
        print("Starting Analysis Loop...")
        while self.running:
            if self.frame_to_analyze is not None:
                try:
                    # DeepFace analysis
                    with self.lock:
                        frame = self.frame_to_analyze.copy()
                    
                    # Using a faster model 'ssd' or 'opencv' for detection, 'fast' logic
                    results = DeepFace.analyze(
                        img_path=frame, 
                        actions=['emotion'], 
                        enforce_detection=False,
                        detector_backend='opencv',
                        silent=True
                    )
                    
                    if results:
                        # Get dominant emotion
                        # Get dominant emotion
                        detected = results[0]['dominant_emotion']
                        self.emotion_history.append(detected)
                        
                        # Set emotion to most frequent in history (Stability)
                        most_common = Counter(self.emotion_history).most_common(1)[0][0]
                        self.emotion = most_common
                        
                        print(f"Detected: {detected} -> Smooth: {self.emotion}")
                        
                except Exception as e:
                    print(f"Analysis Error: {e}")
                
                time.sleep(self.analysis_interval)
            else:
                time.sleep(0.1)

    def draw_ui(self, img):
        h, w, c = img.shape
        
        # Determine theme
        theme_key = self.emotion
        if theme_key not in self.themes:
            theme_key = "neutral"
        
        theme = self.themes[theme_key]
        
        # Apply Base UI Tint
        overlay = img.copy()
        
        # Create a UI sidebar or header based on emotion
        if theme_key == "angry":
            # Simplified UI: Just a clean top bar
            cv2.rectangle(overlay, (0, 0), (w, 80), theme["bg_color"], -1)
        else:
            # Rounded nice UI for others
            cv2.rectangle(overlay, (20, 20), (w-20, 100), theme["bg_color"], -1)
            
        # Blend overlay
        alpha = 0.8
        img = cv2.addWeighted(overlay, alpha, img, 1 - alpha, 0)
        
        # Draw Text
        font = cv2.FONT_HERSHEY_DUPLEX
        cv2.putText(img, theme["message"], (40, 70), font, 1, theme["text_color"], 2)
        
        # Draw Icon (Simple primitives)
        icon_x = w - 80
        icon_y = 60
        
        if theme["icon"] == "thumbs_up":
            cv2.circle(img, (icon_x, icon_y), 20, theme["text_color"], 2)
            cv2.line(img, (icon_x, icon_y+10), (icon_x, icon_y-10), theme["text_color"], 2) # Thumb logic placeholder
        elif theme["icon"] == "heart":
            # Simple heart approx
            cv2.circle(img, (icon_x-10, icon_y), 10, (0, 0, 255), -1)
            cv2.circle(img, (icon_x+10, icon_y), 10, (0, 0, 255), -1)
            pts = np.array([[icon_x-20, icon_y+5], [icon_x+20, icon_y+5], [icon_x, icon_y+25]], np.int32)
            cv2.fillPoly(img, [pts], (0, 0, 255))
        elif theme["icon"] == "question":
            cv2.putText(img, "?", (icon_x-10, icon_y+10), font, 2, theme["text_color"], 3)
            
        return img

def main():
    game = EmotionUI()
    
    # Start analysis thread
    thread = threading.Thread(target=game.analyze_loop)
    thread.daemon = True
    thread.start()
    
    cap = cv2.VideoCapture(0)
    # Set slightly lower res for speed if needed
    cap.set(3, 640)
    cap.set(4, 480)
    
    print("Emotion Game Started. Press 'q' to quit.")
    
    while True:
        success, img = cap.read()
        if not success:
            break
            
        img = cv2.flip(img, 1)
        
        # Update frame for analysis thread
        with game.lock:
            game.frame_to_analyze = img.copy()
            
        # Draw UI
        img = game.draw_ui(img)
        
        cv2.imshow("Emotion Responsive AI", img)
        
        if cv2.waitKey(1) & 0xFF == ord('q'):
            game.running = False
            break
            
    cap.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    main()
