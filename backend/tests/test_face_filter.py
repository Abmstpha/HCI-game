"""
Unit tests for Face Filter module.
Tests face detection and filter overlay functionality.
"""
import pytest
import numpy as np
import cv2
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from games.face_filter import FaceFilterProcessor, face_filter_processor


class TestFaceFilterProcessor:
    """Test suite for FaceFilterProcessor class."""
    
    @pytest.fixture
    def processor(self):
        """Create a fresh processor instance for each test."""
        return FaceFilterProcessor()
    
    @pytest.fixture
    def sample_frame(self):
        """Create a sample frame for testing."""
        # Create a 640x480 black frame
        return np.zeros((480, 640, 3), dtype=np.uint8)
    
    @pytest.fixture
    def face_image(self):
        """Load or create a simple face-like image for testing."""
        # Create a simple image with face-like features (circle for head)
        frame = np.ones((480, 640, 3), dtype=np.uint8) * 200  # Light gray background
        
        # Draw a simple face (for basic detection testing)
        center = (320, 240)
        cv2.circle(frame, center, 100, (180, 150, 130), -1)  # Face
        cv2.circle(frame, (290, 210), 15, (0, 0, 0), -1)  # Left eye
        cv2.circle(frame, (350, 210), 15, (0, 0, 0), -1)  # Right eye
        cv2.ellipse(frame, (320, 280), (30, 15), 0, 0, 180, (150, 100, 100), -1)  # Mouth
        
        return frame
    
    def test_processor_initialization(self, processor):
        """Test that processor initializes correctly."""
        assert processor is not None
        assert processor.face_mesh is not None
        assert processor.mp_face_mesh is not None
    
    def test_global_instance_exists(self):
        """Test that global instance is available."""
        assert face_filter_processor is not None
        assert isinstance(face_filter_processor, FaceFilterProcessor)
    
    def test_process_frame_returns_tuple(self, processor, sample_frame):
        """Test that process_frame returns correct tuple format."""
        result = processor.process_frame(sample_frame, 'sunglasses')
        
        assert isinstance(result, tuple)
        assert len(result) == 2
        
        frame, face_detected = result
        assert isinstance(frame, np.ndarray)
        assert isinstance(face_detected, bool)
    
    def test_process_frame_no_face(self, processor, sample_frame):
        """Test processing a frame with no face."""
        frame, face_detected = processor.process_frame(sample_frame, 'sunglasses')
        
        # Black frame should not detect a face
        assert face_detected == False
        assert frame.shape == sample_frame.shape
    
    def test_all_filter_types(self, processor, sample_frame):
        """Test all filter types don't crash."""
        filter_types = ['none', 'sunglasses', 'hat', 'cigar', 'beard', 
                        'mustache', 'bald', 'clown', 'dog']
        
        for filter_type in filter_types:
            try:
                frame, face_detected = processor.process_frame(sample_frame, filter_type)
                assert frame is not None
                assert frame.shape == sample_frame.shape
            except Exception as e:
                pytest.fail(f"Filter '{filter_type}' raised exception: {e}")
    
    def test_invalid_filter_type(self, processor, sample_frame):
        """Test that invalid filter type doesn't crash."""
        frame, face_detected = processor.process_frame(sample_frame, 'invalid_filter')
        
        # Should still return a valid frame
        assert frame is not None
        assert frame.shape == sample_frame.shape
    
    def test_frame_dimensions_preserved(self, processor):
        """Test that various frame dimensions are handled correctly."""
        dimensions = [(480, 640, 3), (720, 1280, 3), (1080, 1920, 3)]
        
        for height, width, channels in dimensions:
            frame = np.zeros((height, width, channels), dtype=np.uint8)
            result_frame, _ = processor.process_frame(frame, 'sunglasses')
            
            assert result_frame.shape == (height, width, channels)
    
    def test_filter_modifies_frame_with_landmarks(self, processor):
        """Test that filters modify the frame when landmarks are present."""
        # This is a simplified test - in reality we'd need an actual face image
        # For now, we just verify the function runs without error
        frame = np.ones((480, 640, 3), dtype=np.uint8) * 255
        
        result_frame, _ = processor.process_frame(frame, 'sunglasses')
        assert result_frame is not None


class TestDrawMethods:
    """Test individual drawing methods."""
    
    @pytest.fixture
    def processor(self):
        return FaceFilterProcessor()
    
    @pytest.fixture
    def mock_landmarks(self):
        """Create mock landmarks for testing draw methods."""
        class MockLandmark:
            def __init__(self, x, y, z=0):
                self.x = x
                self.y = y
                self.z = z
        
        # Create minimal set of landmarks needed for filters
        landmarks = [MockLandmark(0.5, 0.5)] * 500  # Default all to center
        
        # Set specific landmarks used by filters
        landmarks[33] = MockLandmark(0.35, 0.4)   # Left eye outer
        landmarks[263] = MockLandmark(0.65, 0.4)  # Right eye outer
        landmarks[168] = MockLandmark(0.5, 0.4)   # Nose bridge
        landmarks[10] = MockLandmark(0.5, 0.3)    # Forehead center
        landmarks[21] = MockLandmark(0.35, 0.35)  # Left temple
        landmarks[251] = MockLandmark(0.65, 0.35) # Right temple
        landmarks[61] = MockLandmark(0.4, 0.6)    # Mouth left
        landmarks[291] = MockLandmark(0.6, 0.6)   # Mouth right
        landmarks[0] = MockLandmark(0.5, 0.65)    # Lower lip center
        landmarks[152] = MockLandmark(0.5, 0.8)   # Chin
        landmarks[234] = MockLandmark(0.3, 0.7)   # Left jaw
        landmarks[454] = MockLandmark(0.7, 0.7)   # Right jaw
        landmarks[17] = MockLandmark(0.5, 0.62)   # Mouth bottom
        landmarks[2] = MockLandmark(0.5, 0.5)     # Nose bottom
        landmarks[4] = MockLandmark(0.5, 0.55)    # Nose tip
        
        return landmarks
    
    @pytest.fixture
    def test_frame(self):
        return np.ones((480, 640, 3), dtype=np.uint8) * 200
    
    def test_draw_sunglasses(self, processor, test_frame, mock_landmarks):
        """Test sunglasses drawing."""
        result = processor._draw_sunglasses(test_frame.copy(), mock_landmarks, 640, 480)
        assert result is not None
        assert result.shape == test_frame.shape
    
    def test_draw_hat(self, processor, test_frame, mock_landmarks):
        """Test hat drawing."""
        result = processor._draw_hat(test_frame.copy(), mock_landmarks, 640, 480)
        assert result is not None
    
    def test_draw_cigar(self, processor, test_frame, mock_landmarks):
        """Test cigar drawing."""
        result = processor._draw_cigar(test_frame.copy(), mock_landmarks, 640, 480)
        assert result is not None
    
    def test_draw_beard(self, processor, test_frame, mock_landmarks):
        """Test beard drawing."""
        result = processor._draw_beard(test_frame.copy(), mock_landmarks, 640, 480)
        assert result is not None
    
    def test_draw_mustache(self, processor, test_frame, mock_landmarks):
        """Test mustache drawing."""
        result = processor._draw_mustache(test_frame.copy(), mock_landmarks, 640, 480)
        assert result is not None
    
    def test_draw_bald(self, processor, test_frame, mock_landmarks):
        """Test bald effect drawing."""
        result = processor._draw_bald(test_frame.copy(), mock_landmarks, 640, 480)
        assert result is not None
    
    def test_draw_clown_nose(self, processor, test_frame, mock_landmarks):
        """Test clown nose drawing."""
        result = processor._draw_clown_nose(test_frame.copy(), mock_landmarks, 640, 480)
        assert result is not None
    
    def test_draw_dog_ears(self, processor, test_frame, mock_landmarks):
        """Test dog ears drawing."""
        result = processor._draw_dog_ears(test_frame.copy(), mock_landmarks, 640, 480)
        assert result is not None


class TestPerformance:
    """Performance and stress tests."""
    
    @pytest.fixture
    def processor(self):
        return FaceFilterProcessor()
    
    def test_multiple_frames_processing(self, processor):
        """Test processing multiple frames in sequence."""
        frame = np.ones((480, 640, 3), dtype=np.uint8) * 128
        
        for i in range(10):
            result_frame, _ = processor.process_frame(frame, 'sunglasses')
            assert result_frame is not None
    
    def test_filter_switching(self, processor):
        """Test rapid filter switching."""
        frame = np.ones((480, 640, 3), dtype=np.uint8) * 128
        filters = ['sunglasses', 'hat', 'beard', 'mustache', 'clown']
        
        for _ in range(5):
            for filter_type in filters:
                result_frame, _ = processor.process_frame(frame, filter_type)
                assert result_frame is not None


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
