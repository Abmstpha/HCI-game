import difflib
import unicodedata
import string

def calculate_accuracy(original: str, result: str) -> float:
    """Current implementation in backend/main.py"""
    original = original.lower().strip()
    result = result.lower().strip()
    return difflib.SequenceMatcher(None, original, result).ratio() * 100

def improved_accuracy(original: str, result: str) -> float:
    """Proposed improvement"""
    # Normalize unicode (NFC)
    original = unicodedata.normalize('NFC', original)
    result = unicodedata.normalize('NFC', result)
    
    # Remove punctuation
    # Hindi punctuation includes | (danda) and standard english ones
    punct = string.punctuation + "।" 
    original = "".join([c for c in original if c not in punct])
    result = "".join([c for c in result if c not in punct])
    
    # Remove whitespace
    original = " ".join(original.split()).lower()
    result = " ".join(result.split()).lower()
    
    print(f"Cleaned Original: '{original}'")
    print(f"Cleaned Result:   '{result}'")
    
    return difflib.SequenceMatcher(None, original, result).ratio() * 100

# Test Case 1: Example from Frontend
target = "नमस्ते, आज आप कैसे हैं?"
# Simulated Google STT output (usually no punctuation)
transcription_no_punct = "नमस्ते आज आप कैसे हैं"

print(f"--- Test Case 1: Exact words, missing punctuation ---")
print(f"Target: '{target}'")
print(f"Transcribed: '{transcription_no_punct}'")
print(f"Current Score: {calculate_accuracy(target, transcription_no_punct):.2f}%")
print(f"Improved Score: {improved_accuracy(target, transcription_no_punct):.2f}%")

# Test Case 2: Totally different?
transcription_bad = "कुछ और ही लिखा है"
print(f"\n--- Test Case 2: Different text ---")
print(f"Current Score: {calculate_accuracy(target, transcription_bad):.2f}%")
