FROM python:3.9-slim

WORKDIR /app

# Install system dependencies (ffmpeg, portaudio for pyaudio, build tools)
RUN apt-get update && apt-get install -y \
    ffmpeg \
    portaudio19-dev \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt pydub python-multipart

# Copy application code
COPY . .

# Run uvicorn
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]
