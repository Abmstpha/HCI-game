FROM python:3.9-slim

WORKDIR /app

# Install system dependencies (ffmpeg, portaudio for pyaudio, build tools)
RUN apt-get update && apt-get install -y \
    ffmpeg \
    portaudio19-dev \
    build-essential \
    libgl1 \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libsndfile1 \
    cmake \
    wget \
    bzip2 \
    && rm -rf /var/lib/apt/lists/*

# Download Dlib Face Landmark Model (during build to cache it)
RUN wget -q http://dlib.net/files/shape_predictor_68_face_landmarks.dat.bz2 \
    && bzip2 -d shape_predictor_68_face_landmarks.dat.bz2 \
    && mkdir -p backend/models \
    && mv shape_predictor_68_face_landmarks.dat backend/models/

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt pydub python-multipart

# Copy application code
COPY . .

# Run uvicorn
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]
