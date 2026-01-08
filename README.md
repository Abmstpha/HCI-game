# 🎮 HCI Games Lab

An advanced Human-Computer Interaction (HCI) Laboratory featuring a suite of AI-powered games and experiments. Built with FastAPI, React, MediaPipe, and Scikit-Learn.

**🚀 Live Demo**: [https://hci-games-lab-142479529330.us-central1.run.app](https://hci-games-lab-142479529330.us-central1.run.app)

![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=FastAPI&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![MediaPipe](https://img.shields.io/badge/MediaPipe-00A99D?style=for-the-badge&logo=google&logoColor=white)
![Scikit-Learn](https://img.shields.io/badge/scikit_learn-F7931E?style=for-the-badge&logo=scikit-learn&logoColor=white)
![Google Cloud](https://img.shields.io/badge/Google_Cloud-4285F4?style=for-the-badge&logo=google-cloud&logoColor=white)

---

## 🧠 System Architecture & Technical Details

### 1. The Speech Model

The core of this system relies on the **Google Web Speech API**, accessed via the Python `SpeechRecognition` library.

* **Model Used**: Google Cloud Speech-to-Text (General Model).
* **Why this model?**
  * **Accuracy**: It provides state-of-the-art accuracy for general conversational English and supports over 120 languages.
  * **Robustness**: It handles accents and noisy environments significantly better than offline lightweight models (like standard CMU Sphinx).
  * **Zero-Setup**: It's a cloud-based API, meaning no heavy model weights (like Whisper Large) need to be downloaded or loaded into RAM on the server.

### 2. Audio Processing Pipeline (The "Format Problem")

One of the biggest technical challenges in web-based speech recognition is audio format compatibility.

* **The Problem**: Web browsers (Chrome, Firefox, Safari) record audio in compressed formats like `audio/webm` or `audio/mp4` to save bandwidth. However, most speech recognition engines (including `SpeechRecognition`) strictly require **Linear PCM WAV** files with specific headers (RIFF).
* **The Solution**: We implemented a robust server-side conversion pipeline.
    1. **Ingestion**: FastAPI receives the raw binary stream (Blob) via `multipart/form-data`.
    2. **Normalization**: We use **FFmpeg** (via the `pydub` library) to decode the incoming stream (WebM/Ogg/MP4).
    3. **Conversion**: The audio is converted in-memory to a standardized **16-bit PCM WAV** @ 16kHz or 44.1kHz.
    4. **Processing**: This standardized WAV buffer is then passed to the Google Speech API for transcription.

### 3. Accuracy Calculation Algorithm

To objectively measure performance (HCI metric), we calculate the similarity between the "Target Sentence" and the "Transcribed Text".

* **Algorithm**: `difflib.SequenceMatcher` (Gestalt Pattern Matching).
* **Logic**: It finds the longest contiguous matching subsequence and recursively matches the remaining pieces.
* **Output**: A strict percentage (0-100%) representing how close the spoken words were to the target.

---

## ✨ Features & Experiments

### 🔬 1. Speech vs Typing (Latency Comparison)

* **Objective**: Compare input modalities.
* **Metrics**:
  * **Latency**: Time taken from input completion to result availability.
  * **Error Rate**: Levenshtein distance based accuracy.

### 🌍 2. Accent Effect (Robustness Test)

* **Objective**: Test the model's bias towards standard accents (e.g., General American).
* **Implementation**: Users select an accent metadata tag, which attaches to the result. We verify if the `en-US` model degrades in performance when processing non-standard accents (e.g., Indian or Scottish English).

### 🔊 3. Background Noise Simulation

* **Objective**: signal-to-noise ratio (SNR) impact.
* **Implementation**: Controlled environment testing where external noise is introduced. This tests the Google Speech API's noise suppression capabilities.

### 🌐 4. Multilingual Support

* **Implementation**: Dynamic locale switching. The frontend maps a requested language (e.g., `Japanese`) to its specific BCP-47 language code (`ja-JP`) before sending the request. This ensures the backend invokes the correct language model.

### ✋ 5. Gesture Control (Vision AI)

* **Objective**: Touchless interaction.
* **Tech**: **MediaPipe Hands**.
* **Features**: Detects hand landmarks in real-time. Maps index finger position to a virtual cursor. Recognizes "Pinch" gestures for clicking and "Open Palm" for waving.

### 🧘 6. Pose Estimation (Full Body Tracking)

* **Objective**: Kinetic interaction and posture analysis.
* **Tech**: **MediaPipe Pose**.
* **Features**: Tracks 33 body landmarks including shoulders, elbows, hips, and knees. Visualizes a skeleton overlay on the video feed. Can detect specific poses like "Hands Up" or "T-Pose".

### 😲 7. Emotion AI (Facial Analysis)

* **Objective**: Adaptive User Interfaces based on mood.
* **Tech**: **MediaPipe Face Mesh** + **TensorFlow**.
* **Features**: Analyzes facial expressions to detect core emotions (Happy, Sad, Angry, Surprised, neutral). The UI theme colors dynamically adapt to match the user's detected mood.

### 🎙️ 8. Voice Emotion (Speech Analysis)

* **Objective**: Affective Computing via voice.
* **Tech**: **Librosa** (Feature Extraction) + **Scikit-Learn** (MLP Classifier).
* **Features**: Extracts MFCC, Chroma, and Mel-spectrogram features from audio. Classifies the speaker's tone into emotions like Calm, Fearful, or Happy, regardless of the words spoken.

### 👁️ 9. Gaze Tracking (Eye Analysis)

* **Objective**: Attention tracking and interaction.
* **Tech**: **Dlib** (68-point landmarks) + **OpenCV**.
* **Features**: Detects pupil position relative to the eye socket to determine gaze direction (Left/Center/Right). Uses robust landmarking trained on thousands of faces.

---

## 🛠️ Technology Stack

### Frontend (Client)

* **React 18 + Vite**: For high-performance rendering and incredibly fast build times.
* **MediaRecorder API**: Native browser API to capture audio streams.
* **Framer Motion**: For fluid, 60fps animations and seamless UI transitions (HCI best practice).
* **TypeScript**: To ensure type safety across API responses and component props.

### Backend (Server)

* **FastAPI**: Asynchronous Python web framework. chosen for its speed (Starlette) and automatic validation (Pydantic).
* **MediaPipe & OpenCV**: For real-time computer vision (Hand, Pose, Face).
* **Dlib**: For robust facial landmark detection and gaze estimation.
* **Scikit-Learn & Librosa**: For machine learning and audio feature extraction.
* **Pydub & FFmpeg**: The backbone of the audio processing pipeline.
* **Docker**: Multi-stage builds used to package the application, separating the build environment (compilers) from the runtime environment to keep images small (~100MB).

### Deployment

* **Google Cloud Run**: Serverless container platform.
  * **Scalability**: Automatically scales to 0 when not in use (cost-efficient) and scales up during high traffic.
  * **Architecture**: Decoupled architecture. The Frontend container serves static assets via **Nginx**, while the Backend container handles compute-intensive audio processing.

---

## 🚀 Quick Start (Local)

### Prerequisites

* **FFmpeg** (Critical for audio conversion):
  * macOS: `brew install ffmpeg`
  * Linux: `sudo apt install ffmpeg`

### One-Command Setup

```bash
./start.sh
```

### Manual Setup

**Backend**:

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python main.py
```

**Frontend**:

```bash
cd frontend
npm install
npm run dev
```

---

## 👨‍💻 Developer

Built for **HCI Research** and **Education**.
**Stack**: React, Vite, FastAPI, Google Speech Recognition.
