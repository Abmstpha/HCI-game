import cv2
import mediapipe as mp
import math
import time
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

class Button:
    def __init__(self, text, pos, size=(200, 60)):
        self.text = text
        self.pos = pos
        self.size = size
        self.x, self.y = pos
        self.w, self.h = size
        self.color_default = (200, 200, 200)
        self.color_hover = (255, 200, 200)
        self.color_click = (0, 255, 0)
        self.state = "default"  # default, hover, clicked

    def draw(self, img):
        color = self.color_default
        if self.state == "hover":
            color = self.color_hover
        elif self.state == "clicked":
            color = self.color_click
        
        cv2.rectangle(img, (self.x, self.y), (self.x + self.w, self.y + self.h), color, -1)
        cv2.putText(img, self.text, (self.x + 20, self.y + 40),
                    cv2.FONT_HERSHEY_PLAIN, 2, (50, 50, 50), 3)

    def is_hover(self, x, y):
        return self.x < x < self.x + self.w and self.y < y < self.y + self.h

class GestureController:
    def __init__(self):
        try:
            self.mp_hands = mp.solutions.hands
            self.mp_draw = mp.solutions.drawing_utils
        except AttributeError:
            import mediapipe.python.solutions as solutions
            mp.solutions = solutions
            self.mp_hands = mp.solutions.hands
            self.mp_draw = mp.solutions.drawing_utils

        self.hands = self.mp_hands.Hands(
            max_num_hands=1,
            min_detection_confidence=0.7,
            min_tracking_confidence=0.5,
            model_complexity=1
        )
        # Smoothing Filter for cursor (x, y)
        self.cursor_filter = OneEuroFilter(time.time(), (0, 0), min_cutoff=0.5, beta=0.1)
        
        # Click State Machine
        self.click_frames = 0
        self.required_click_frames = 3 # Must hold pinch for 3 frames
        self.is_clicking_stable = False

    def process_hand(self, img):
        img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        results = self.hands.process(img_rgb)
        
        cursor = None
        is_clicking = False
        landmarks = None
        
        if results.multi_hand_landmarks:
            for hand_lms in results.multi_hand_landmarks:
                landmarks = hand_lms
                h, w, c = img.shape
                # Index finger tip (Landmark 8) for cursor
                idx_x, idx_y = int(hand_lms.landmark[8].x * w), int(hand_lms.landmark[8].y * h)
                cursor = (idx_x, idx_y)
                
                # Check for click (Index tip 8 and Thumb tip 4 close)
                thumb_x, thumb_y = int(hand_lms.landmark[4].x * w), int(hand_lms.landmark[4].y * h)
                dist = math.hypot(idx_x - thumb_x, idx_y - thumb_y)
                
                if dist < 40:
                    self.click_frames += 1
                else:
                    self.click_frames = 0
                    self.is_clicking_stable = False
                
                # Only register click if held for enough frames
                if self.click_frames >= self.required_click_frames:
                    self.is_clicking_stable = True
                
                is_clicking = self.is_clicking_stable
                
        # Apply smoothing
        if cursor:
            cursor = self.cursor_filter.filter(time.time(), cursor)
            cursor = (int(cursor[0]), int(cursor[1]))
            
        return cursor, is_clicking, landmarks

    def draw_hand(self, img, landmarks, cursor, is_clicking):
        if landmarks:
            self.mp_draw.draw_landmarks(img, landmarks, self.mp_hands.HAND_CONNECTIONS)
            
        if cursor:
            cx, cy = cursor
            color = (0, 255, 0) if is_clicking else (255, 0, 255)
            cv2.circle(img, (cx, cy), 15, color, cv2.FILLED)

def main():
    cap = cv2.VideoCapture(0)
    width = 1280
    height = 720
    cap.set(3, width)
    cap.set(4, height)
    
    controller = GestureController()
    
    # Menu Setup
    buttons = [
        Button("Start Game", (100, 150)),
        Button("Settings", (100, 250)),
        Button("Quit", (100, 350))
    ]
    
    last_click_time = 0
    click_delay = 0.5 # Seconds between clicks
    
    while True:
        success, img = cap.read()
        if not success:
            break
            
        img = cv2.flip(img, 1) # Mirror view
        cursor, is_clicking, landmarks = controller.process_hand(img)
        
        # Menu Logic
        if cursor:
            cx, cy = cursor
            current_time = time.time()
            
            for btn in buttons:
                if btn.is_hover(cx, cy):
                    if is_clicking and (current_time - last_click_time > click_delay):
                        btn.state = "clicked"
                        last_click_time = current_time
                        print(f"Clicked: {btn.text}")
                        if btn.text == "Quit":
                            return # Exit main loop
                    elif btn.state != "clicked":
                        btn.state = "hover"
                else:
                    btn.state = "default"
        
        # Draw UI Layer FIRST
        # Semi-transparent background for menu?
        overlay = img.copy()
        cv2.rectangle(overlay, (50, 50), (400, 600), (255, 255, 255), -1)
        alpha = 0.7
        img = cv2.addWeighted(overlay, alpha, img, 1 - alpha, 0)
        
        cv2.putText(img, "Gesture Menu", (80, 100), cv2.FONT_HERSHEY_PLAIN, 3, (0, 0, 0), 3)
        
        for btn in buttons:
            btn.draw(img)
            
        # Draw Hand Layer ON TOP
        controller.draw_hand(img, landmarks, cursor, is_clicking)
            
        cv2.imshow("Gesture Menu", img)
        
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break
            
    cap.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    main()
