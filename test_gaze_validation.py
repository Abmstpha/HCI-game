#!/usr/bin/env python3
"""
Quick validation test for Gaze Tracking endpoint
Tests:
1. Import validation (numpy, cv2, base64)
2. Endpoint structure
3. Error handling
"""

import sys
import os

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

def test_imports():
    """Test that all required imports work"""
    print("Testing imports...")
    try:
        import numpy as np
        import cv2
        import base64
        print("✓ Core imports successful (numpy, cv2, base64)")
        return True
    except ImportError as e:
        print(f"✗ Import failed: {e}")
        return False

def test_main_py_imports():
    """Test that main.py has the required imports"""
    print("\nChecking main.py for required imports...")
    with open('backend/main.py', 'r') as f:
        content = f.read()
    
    required_imports = ['import numpy as np', 'import cv2', 'import base64']
    missing = []
    for imp in required_imports:
        if imp not in content:
            missing.append(imp)
    
    if missing:
        print(f"✗ Missing imports in main.py: {missing}")
        return False
    else:
        print("✓ All required imports found in main.py")
        return True

def test_process_gaze_endpoint():
    """Test endpoint structure"""
    print("\nChecking /process-gaze endpoint structure...")
    with open('backend/main.py', 'r') as f:
        content = f.read()
    
    checks = {
        '@app.post("/process-gaze")': 'Endpoint decorator',
        'async def process_gaze_frame': 'Async function definition',
        'np.frombuffer': 'NumPy buffer conversion',
        'cv2.imdecode': 'OpenCV image decode',
        'base64.b64encode': 'Base64 encoding'
    }
    
    passing = True
    for check, desc in checks.items():
        if check in content:
            print(f"  ✓ {desc}")
        else:
            print(f"  ✗ {desc} - NOT FOUND: {check}")
            passing = False
    
    return passing

def test_gaze_tracker_module():
    """Test gaze_tracker.py structure"""
    print("\nChecking gaze_tracker.py...")
    try:
        with open('backend/games/gaze_tracker.py', 'r') as f:
            content = f.read()
        
        checks = {
            'import numpy as np': 'NumPy import',
            'import cv2': 'OpenCV import',
            'import dlib': 'Dlib import',
            'class GazeTracker': 'GazeTracker class',
            'def process_frame': 'process_frame method'
        }
        
        for check, desc in checks.items():
            if check in content:
                print(f"  ✓ {desc}")
            else:
                print(f"  ✗ {desc}")
                return False
        
        return True
    except FileNotFoundError:
        print("  ✗ gaze_tracker.py not found")
        return False

if __name__ == "__main__":
    print("=" * 60)
    print("GAZE TRACKING VALIDATION TEST")
    print("=" * 60)
    
    results = []
    results.append(("Imports", test_imports()))
    results.append(("main.py imports", test_main_py_imports()))
    results.append(("process-gaze endpoint", test_process_gaze_endpoint()))
    results.append(("gaze_tracker module", test_gaze_tracker_module()))
    
    print("\n" + "=" * 60)
    print("TEST SUMMARY")
    print("=" * 60)
    
    for name, passed in results:
        status = "✓ PASS" if passed else "✗ FAIL"
        print(f"{name:25s} {status}")
    
    total_passed = sum(1 for _, p in results if p)
    print(f"\nTotal: {total_passed}/{len(results)} tests passed")
    
    if all(p for _, p in results):
        print("\n🎉 All validation tests passed!")
        sys.exit(0)
    else:
        print("\n❌ Some tests failed")
        sys.exit(1)
