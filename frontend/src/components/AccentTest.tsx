import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Mic, Play } from 'lucide-react'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'
const TARGET_SENTENCE = "The quick brown fox jumps over the lazy dog"

interface AccentTestResult {
  transcription: string
  accuracy: number
  accent: string
}

export default function AccentTest() {
  const [accentType, setAccentType] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)

  // State restored
  const [result, setResult] = useState<AccentTestResult | null>(null)
  const accents = [
    'British', 'Australian', 'Indian', 'French', 'Spanish',
    'German', 'Italian', 'Southern US', 'New York', 'Boston'
  ]
  // Audio Analysis State
  const [volume, setVolume] = useState(0)
  const analysisRef = useRef<number>(0)
  const audioContextRef = useRef<AudioContext | null>(null)

  const startRecording = async () => {
    if (!accentType) {
      alert('Please select an accent first!')
      return
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          autoGainControl: false,
          noiseSuppression: false,
          channelCount: 1
        }
      })

      // Signal Analysis
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const source = audioContext.createMediaStreamSource(stream)
      const analyser = audioContext.createAnalyser()
      analyser.fftSize = 256
      source.connect(analyser)
      audioContextRef.current = audioContext

      const bufferLength = analyser.frequencyBinCount
      const dataArray = new Uint8Array(bufferLength)

      // Use specific codec for better compatibility
      let options = {}
      if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        options = { mimeType: 'audio/webm;codecs=opus' }
      } else if (MediaRecorder.isTypeSupported('audio/webm')) {
        options = { mimeType: 'audio/webm' }
      }

      const recorder = new MediaRecorder(stream, options)
      const chunks: Blob[] = []

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data)
      }

      recorder.onstop = async () => {
        cancelAnimationFrame(analysisRef.current)
        if (audioContextRef.current) {
          audioContextRef.current.close()
        }

        const blob = new Blob(chunks, { type: recorder.mimeType })
        await transcribeAudio(blob)
        stream.getTracks().forEach(track => track.stop())
      }

      recorder.start()
      setMediaRecorder(recorder)
      setIsRecording(true)

      // Restart volume loop
      analysisRef.current = requestAnimationFrame(function loop() {
        analyser.getByteFrequencyData(dataArray)
        const avg = dataArray.reduce((a, b) => a + b) / bufferLength
        setVolume(avg)
        analysisRef.current = requestAnimationFrame(loop)
      })

    } catch (error) {
      console.error('Error accessing microphone:', error)
      alert('Please allow microphone access!')
    }
  }

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop()
      setIsRecording(false)
      setMediaRecorder(null)
    }
  }

  const transcribeAudio = async (audioBlob: Blob) => {
    try {
      const formData = new FormData()
      formData.append('audio', audioBlob, 'recording.wav')
      formData.append('language', 'en-US')
      formData.append('target_sentence', TARGET_SENTENCE)

      const response = await axios.post(`${API_URL}/transcribe`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      setResult({
        transcription: response.data.transcription,
        accuracy: response.data.accuracy,
        accent: accentType
      })
    } catch (error) {
      console.error('Error transcribing audio:', error)
      alert('Error processing speech. Please try again!')
    }
  }

  const reset = () => {
    setResult(null)
    setAccentType('')
  }

  return (
    <div className="experiment-container">
      <motion.div
        className="experiment-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2>🌍 Accent Effect Test</h2>
        <p>Test how different accents affect speech recognition accuracy</p>
      </motion.div>

      <div className="target-sentence">
        <div style={{ fontSize: '0.875rem', opacity: 0.8, marginBottom: '0.5rem' }}>
          Target Sentence:
        </div>
        "{TARGET_SENTENCE}"
      </div>

      {!result && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="test-section"
        >
          <h3>Select Accent Type:</h3>
          <select
            className="select-field"
            value={accentType}
            onChange={(e) => setAccentType(e.target.value)}
          >
            <option value="">Choose an accent...</option>
            {accents.map(accent => (
              <option key={accent} value={accent}>{accent}</option>
            ))}
            <option value="Other">Other (Custom)</option>
          </select>

          {accentType === 'Other' && (
            <input
              type="text"
              className="input-field"
              placeholder="Enter accent type..."
              onChange={(e) => setAccentType(e.target.value)}
            />
          )}

          {isRecording && (
            <div style={{ textAlign: 'center', margin: '1rem 0' }}>
              <div style={{ width: '200px', height: '10px', background: '#333', margin: '0 auto', borderRadius: '5px', overflow: 'hidden' }}>
                <div style={{
                  width: `${Math.min(100, (volume / 30) * 100)}%`,
                  height: '100%',
                  background: volume > 10 ? '#4ade80' : '#ef4444',
                  transition: 'width 0.1s ease-out'
                }} />
              </div>
              <p style={{ fontSize: '0.8rem', color: volume > 5 ? '#aaa' : '#ef4444', marginTop: '0.5rem', fontWeight: 500 }}>
                {volume > 5 ? 'Microphone Active' : '⚠️ NO AUDIO DETECTED'}
              </p>
              <p style={{ fontSize: '0.7rem', color: '#666' }}>Level: {volume.toFixed(0)}</p>
            </div>
          )}

          <button
            className={`btn btn-record ${isRecording ? 'recording' : ''}`}
            onClick={isRecording ? stopRecording : startRecording}
            style={{ width: '100%' }}
            disabled={!accentType}
          >
            <Mic className="w-5 h-5" />
            {isRecording ? 'Stop Recording' : 'Start Recording'}
          </button>

          {isRecording && (
            <p style={{ textAlign: 'center', color: '#ff00ff', marginTop: '1rem', fontWeight: 600 }}>
              🔴 Recording... Speak with your selected accent
            </p>
          )}
        </motion.div>
      )}

      {result && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="results"
        >
          <h3 style={{ fontSize: '1.75rem', marginBottom: '2rem', textAlign: 'center', color: 'white' }}>
            📊 Accent Test Results
          </h3>

          <div className="result-item">
            <span className="result-label">Accent:</span>
            <span className="result-value" style={{ fontSize: '1.25rem' }}>{result.accent}</span>
          </div>

          <div className="result-item">
            <span className="result-label">Accuracy:</span>
            <span className="result-value">{result.accuracy.toFixed(1)}%</span>
          </div>

          <div className="accuracy-bar">
            <motion.div
              className="accuracy-fill"
              initial={{ width: 0 }}
              animate={{ width: `${result.accuracy}%` }}
              transition={{ duration: 1, delay: 0.3 }}
            />
          </div>

          <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'rgba(0,0,0,0.3)', borderRadius: '12px' }}>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
              Transcribed:
            </p>
            <p style={{ color: 'white', fontSize: '1rem', fontWeight: 600 }}>
              "{result.transcription}"
            </p>
          </div>

          <button className="btn btn-primary" onClick={reset} style={{ width: '100%', marginTop: '2rem' }}>
            <Play className="w-5 h-5" />
            Test Another Accent
          </button>
        </motion.div>
      )}
    </div>
  )
}

