import speech_recognition as sr
import time
import difflib

# Initialize the recognizer
r = sr.Recognizer()

# A standard sentence for benchmarking (Panagrams are good as they use many letters)
TARGET_SENTENCE = "The quick brown fox jumps over the lazy dog"

def calculate_accuracy(original, result):
    """
    Calculates similarity ratio between two strings (0.0 to 1.0).
    """
    original = original.lower().strip()
    result = result.lower().strip()
    return difflib.SequenceMatcher(None, original, result).ratio() * 100

def get_audio_input(lang_code="en-US"):
    """
    Captures audio and measures latency of the recognition process.
    """
    with sr.Microphone() as source:
        print("\n[Adjusting for ambient noise... wait 1 sec]")
        r.adjust_for_ambient_noise(source, duration=1)
        
        # Adjust recognizer settings for better capture
        r.pause_threshold = 1.0  # Wait 1 second of silence before stopping
        r.energy_threshold = 300  # Lower = more sensitive
        
        print(f"🎤 SPEAK NOW (Language: {lang_code})... (I'm listening for up to 15 seconds!)")
        print("📢 Say the FULL sentence clearly!")
        start_time = time.time()
        
        try:
            # Listen to audio with better timeouts
            # timeout = how long to wait for speech to START (10 seconds)
            # phrase_time_limit = maximum time for the entire phrase (15 seconds)
            audio = r.listen(source, timeout=10, phrase_time_limit=15)
            print("✅ Got it! Processing your speech...")
            
            # Transcribe
            text = r.recognize_google(audio, language=lang_code)
            end_time = time.time()
            
            latency = end_time - start_time
            return text, latency
            
        except sr.WaitTimeoutError:
            return "Error: Timeout - no speech detected", 0
        except sr.UnknownValueError:
            return "Error: Could not understand audio", 0
        except sr.RequestError as e:
            return f"Error: API unavailable {e}", 0

# --- EXPERIMENT 1: SPEECH VS TYPING ---
def experiment_1():
    print("\n--- EXPERIMENT 1: SPEECH VS TYPING ---")
    print(f"Target Sentence: '{TARGET_SENTENCE}'")
    
    # Part A: Typing
    input("Press Enter to start TYPING test...")
    start_type = time.time()
    typed_text = input(f"Type the sentence above: ")
    end_type = time.time()
    
    type_latency = end_type - start_type
    type_accuracy = calculate_accuracy(TARGET_SENTENCE, typed_text)
    
    print(f"⌨️ TYPING RESULT: Time: {type_latency:.2f}s | Accuracy: {type_accuracy:.2f}%")
    
    # Part B: Speech
    input("Press Enter to start SPEECH test...")
    spoken_text, speech_latency = get_audio_input()
    
    if spoken_text and not spoken_text.startswith("Error"):
        speech_accuracy = calculate_accuracy(TARGET_SENTENCE, spoken_text)
        print(f"🗣️ SPEECH RESULT: Time: {speech_latency:.2f}s | Accuracy: {speech_accuracy:.2f}%")
        print(f"Transcribed: '{spoken_text}'")
    else:
        print(f"❌ Speech test failed: {spoken_text if spoken_text else 'No input detected'}")

# --- EXPERIMENT 2: ACCENT EFFECT ---
def experiment_2():
    print("\n--- EXPERIMENT 2: EFFECT OF ACCENT ---")
    print("Instructions: Have someone with a strong accent read the sentence,")
    print("OR try to fake a specific accent (e.g., Heavy French, Southern US).")
    print(f"Target Sentence: '{TARGET_SENTENCE}'")
    
    accent_type = input("Enter name of accent being tested (e.g., 'Australian'): ")
    input(f"Press Enter to record with {accent_type} accent...")
    
    text, _ = get_audio_input()
    
    if text:
        acc = calculate_accuracy(TARGET_SENTENCE, text)
        print(f"RESULTS ({accent_type}): Accuracy: {acc:.2f}%")
        print(f"Recognized: {text}")

# --- EXPERIMENT 3: BACKGROUND NOISE ---
def experiment_3():
    print("\n--- EXPERIMENT 3: BACKGROUND SOUNDS ---")
    print("Instructions: Play loud music or street noise on your phone while speaking.")
    print(f"Target Sentence: '{TARGET_SENTENCE}'")
    
    noise_type = input("Describe background noise (e.g., 'Loud Rock Music'): ")
    input("Start your background noise, then press Enter to record...")
    
    text, _ = get_audio_input()
    
    if text:
        acc = calculate_accuracy(TARGET_SENTENCE, text)
        print(f"RESULTS ({noise_type}): Accuracy: {acc:.2f}%")
        print(f"Recognized: {text}")

# --- EXPERIMENT 4: MULTILINGUAL ---
def experiment_4():
    print("\n--- EXPERIMENT 4: MULTILINGUAL IMPLEMENTATION ---")
    print("We will switch the recognizer language code.")
    
    lang_code = input("Enter language code (e.g., 'es-ES' for Spanish, 'fr-FR' for French, 'hi-IN' for Hindi): ")
    target_phrase = input(f"Enter a sentence in that language for me to check against: ")
    
    input(f"Press Enter to speak in {lang_code}...")
    
    text, latency = get_audio_input(lang_code)
    
    if text:
        acc = calculate_accuracy(target_phrase, text)
        print(f"🌍 MULTILINGUAL RESULT: Time: {latency:.2f}s | Accuracy: {acc:.2f}%")
        print(f"Recognized: {text}")

# --- MAIN MENU ---
def main():
    while True:
        print("\n==========================================")
        print("SPEECH RECOGNITION HCI LAB")
        print("==========================================")
        print("1. Speech vs Typing (Performance)")
        print("2. Effect of Accent")
        print("3. Effect of Background Noise")
        print("4. Multilingual Test")
        print("5. Exit")
        
        choice = input("Select an experiment (1-5): ")
        
        if choice == '1': experiment_1()
        elif choice == '2': experiment_2()
        elif choice == '3': experiment_3()
        elif choice == '4': experiment_4()
        elif choice == '5': break
        else: print("Invalid choice.")

if __name__ == "__main__":
    main()