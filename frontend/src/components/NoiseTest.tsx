import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mic, Play, Volume2 } from 'lucide-react'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'
const TARGET_SENTENCE = "The quick brown fox jumps over the lazy dog"

interface NoiseTestResult {
  transcription: string
  accuracy: number
  noise: string
}

export default function NoiseTest() {
  const [noiseType, setNoiseType] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
  const [result, setResult] = useState<NoiseTestResult | null>(null)

  const noiseTypes = [
    'Quiet Room (Baseline)',
    'Loud Music',
    'Street Noise',
    'Cafe/Restaurant',
    'Construction Noise',
    'Wind Noise',
    'TV/Radio Background',
    'Multiple Conversations'
  ]

  const startRecording = async () => {
    if (!noiseType) {
      alert('Please select a noise type first!')
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
        const blob = new Blob(chunks, { type: recorder.mimeType })
        await transcribeAudio(blob, 'noise')
        stream.getTracks().forEach(track => track.stop())
      }

      recorder.start()
      setMediaRecorder(recorder)
      setIsRecording(true)
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
        noise: noiseType
      })
    } catch (error) {
      console.error('Error transcribing audio:', error)
      alert('Error processing speech. Please try again!')
    }
  }

  const reset = () => {
    setResult(null)
    setNoiseType('')
  }

  return (
    <div className="experiment-container">
      <motion.div
        className="experiment-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2>🔊 Background Noise Test</h2>
        <p>Test the impact of background noise on recognition accuracy</p>
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
          <h3>Select Background Noise Level:</h3>
          <select
            className="select-field"
            value={noiseType}
            onChange={(e) => setNoiseType(e.target.value)}
          >
            <option value="">Choose noise type...</option>
            {noiseTypes.map(noise => (
              <option key={noise} value={noise}>{noise}</option>
            ))}
            <option value="Other">Other (Custom)</option>
          </select>

          {noiseType === 'Other' && (
            <input
              type="text"
              className="input-field"
              placeholder="Describe the noise..."
              onChange={(e) => setNoiseType(e.target.value)}
            />
          )}

          <div style={{
            background: 'rgba(255, 165, 0, 0.1)',
            border: '2px solid #ff8800',
            borderRadius: '12px',
            padding: '1rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <Volume2 className="w-6 h-6 text-orange-400" />
            <p style={{ color: '#ff8800', fontSize: '0.875rem', fontWeight: 600 }}>
              Make sure your background noise is playing before recording!
            </p>
          </div>

          {isRecording && (
            <div className="audio-visualizer">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="visualizer-bar" />
              ))}
            </div>
          )}

          <button
            className={`btn btn-record ${isRecording ? 'recording' : ''}`}
            onClick={isRecording ? stopRecording : startRecording}
            style={{ width: '100%' }}
            disabled={!noiseType}
          >
            <Mic className="w-5 h-5" />
            {isRecording ? 'Stop Recording' : 'Start Recording'}
          </button>

          {isRecording && (
            <p style={{ textAlign: 'center', color: '#ff00ff', marginTop: '1rem', fontWeight: 600 }}>
              🔴 Recording... Speak clearly over the noise
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
            📊 Noise Test Results
          </h3>

          <div className="result-item">
            <span className="result-label">Noise Type:</span>
            <span className="result-value" style={{ fontSize: '1.25rem' }}>{result.noise}</span>
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

          <div style={{
            marginTop: '1.5rem',
            padding: '1rem',
            background: result.accuracy > 80 ? 'rgba(0, 255, 0, 0.1)' : 'rgba(255, 0, 0, 0.1)',
            borderRadius: '12px',
            textAlign: 'center'
          }}>
            <p style={{ color: result.accuracy > 80 ? '#00ff00' : '#ff4444', fontWeight: 600 }}>
              {result.accuracy > 80
                ? '✅ Good recognition even with noise!'
                : '⚠️ Noise significantly affected accuracy'}
            </p>
          </div>

          <button className="btn btn-primary" onClick={reset} style={{ width: '100%', marginTop: '2rem' }}>
            <Play className="w-5 h-5" />
            Test Another Noise Level
          </button>
        </motion.div>
      )}
    </div>
  )
}

