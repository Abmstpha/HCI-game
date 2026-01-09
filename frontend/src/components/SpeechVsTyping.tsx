import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mic, Keyboard, Play } from 'lucide-react'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'
const TARGET_SENTENCE = "The quick brown fox jumps over the lazy dog"

interface TestResult {
  time: number
  accuracy: number
  text: string
}

export default function SpeechVsTyping() {
  const [step, setStep] = useState<'idle' | 'typing' | 'speech' | 'results'>('idle')
  const [typingInput, setTypingInput] = useState('')
  const [typingStartTime, setTypingStartTime] = useState(0)
  const [typingResult, setTypingResult] = useState<TestResult | null>(null)
  const [speechResult, setSpeechResult] = useState<TestResult | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)

  const startTypingTest = () => {
    setStep('typing')
    setTypingInput('')
    setTypingStartTime(Date.now())
  }

  const submitTyping = async () => {
    // eslint-disable-next-line react-hooks/purity
    const currentTime = Date.now()
    const typingTime = (currentTime - typingStartTime) / 1000

    try {
      const response = await axios.post(`${API_URL}/accuracy`, {
        original: TARGET_SENTENCE,
        result: typingInput
      })

      setTypingResult({
        time: typingTime,
        accuracy: response.data.accuracy,
        text: typingInput
      })

      setStep('idle')
      setTimeout(() => startSpeechTest(), 1000)
    } catch (error) {
      console.error('Error calculating accuracy:', error)
    }
  }

  const startSpeechTest = () => {
    setStep('speech')
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      const chunks: Blob[] = []

      recorder.ondataavailable = (e) => chunks.push(e.data)

      recorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'audio/wav' })
        await transcribeAudio(blob)
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
    const startTime = Date.now()

    try {
      const formData = new FormData()
      formData.append('audio', audioBlob, 'recording.wav')
      formData.append('language', 'en-US')
      formData.append('target_sentence', TARGET_SENTENCE)

      const response = await axios.post(`${API_URL}/transcribe`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      const speechTime = (Date.now() - startTime) / 1000

      setSpeechResult({
        time: speechTime,
        accuracy: response.data.accuracy,
        text: response.data.transcription
      })

      setStep('results')
    } catch (error) {
      console.error('Error transcribing audio:', error)
      alert('Error processing speech. Please try again!')
      setStep('idle')
    }
  }

  const reset = () => {
    setStep('idle')
    setTypingInput('')
    setTypingResult(null)
    setSpeechResult(null)
  }

  return (
    <div className="experiment-container">
      <motion.div
        className="experiment-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2>⚡ Speech vs Typing</h2>
        <p>Compare the speed and accuracy of speech vs typing</p>
      </motion.div>

      <div className="target-sentence">
        <div style={{ fontSize: '0.875rem', opacity: 0.8, marginBottom: '0.5rem' }}>
          Target Sentence:
        </div>
        "{TARGET_SENTENCE}"
      </div>

      {step === 'idle' && !typingResult && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="test-section"
        >
          <button className="btn btn-primary" onClick={startTypingTest} style={{ width: '100%' }}>
            <Keyboard className="w-5 h-5" />
            Start Typing Test
          </button>
        </motion.div>
      )}

      {step === 'typing' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="test-section"
        >
          <h3>⌨️ Type the sentence above:</h3>
          <input
            type="text"
            className="input-field"
            placeholder="Start typing..."
            value={typingInput}
            onChange={(e) => setTypingInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && submitTyping()}
            autoFocus
          />
          <button
            className="btn btn-primary"
            onClick={submitTyping}
            style={{ width: '100%' }}
          >
            Submit
          </button>
        </motion.div>
      )}

      {step === 'speech' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="test-section"
        >
          <h3>🎤 Speak the sentence clearly:</h3>

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
          >
            <Mic className="w-5 h-5" />
            {isRecording ? 'Stop Recording' : 'Start Recording'}
          </button>

          {isRecording && (
            <p style={{ textAlign: 'center', color: '#ff00ff', marginTop: '1rem', fontWeight: 600 }}>
              🔴 Recording... Click to stop
            </p>
          )}
        </motion.div>
      )}

      {step === 'results' && typingResult && speechResult && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="results"
        >
          <h3 style={{ fontSize: '1.75rem', marginBottom: '2rem', textAlign: 'center', color: 'white' }}>
            📊 Results Comparison
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
            <div>
              <h4 style={{ color: '#00ffff', marginBottom: '1rem', fontSize: '1.25rem' }}>⌨️ Typing</h4>
              <div className="result-item">
                <span className="result-label">Time:</span>
                <span className="result-value">{typingResult.time.toFixed(2)}s</span>
              </div>
              <div className="result-item">
                <span className="result-label">Accuracy:</span>
                <span className="result-value">{typingResult.accuracy.toFixed(1)}%</span>
              </div>
              <div className="accuracy-bar">
                <motion.div
                  className="accuracy-fill"
                  initial={{ width: 0 }}
                  animate={{ width: `${typingResult.accuracy}%` }}
                  transition={{ duration: 1, delay: 0.3 }}
                />
              </div>
            </div>

            <div>
              <h4 style={{ color: '#ff00ff', marginBottom: '1rem', fontSize: '1.25rem' }}>🎤 Speech</h4>
              <div className="result-item">
                <span className="result-label">Time:</span>
                <span className="result-value">{speechResult.time.toFixed(2)}s</span>
              </div>
              <div className="result-item">
                <span className="result-label">Accuracy:</span>
                <span className="result-value">{speechResult.accuracy.toFixed(1)}%</span>
              </div>
              <div className="accuracy-bar">
                <motion.div
                  className="accuracy-fill"
                  initial={{ width: 0 }}
                  animate={{ width: `${speechResult.accuracy}%` }}
                  transition={{ duration: 1, delay: 0.3 }}
                />
              </div>
            </div>
          </div>

          <div style={{ marginTop: '2rem', display: 'grid', gap: '1rem' }}>
            <div style={{ padding: '1.5rem', background: 'rgba(0,0,0,0.3)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.875rem', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Target Sentence
              </p>
              <p style={{ color: '#ffffff', fontSize: '1.1rem', fontWeight: 500 }}>
                "{TARGET_SENTENCE}"
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ padding: '1.5rem', background: 'rgba(0,255,255,0.1)', borderRadius: '12px', border: '1px solid rgba(0,255,255,0.2)' }}>
                <p style={{ color: '#00ffff', fontSize: '0.875rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Keyboard size={16} /> You Typed:
                </p>
                <p style={{ color: 'white', fontSize: '1rem' }}>
                  "{typingResult.text}"
                </p>
              </div>

              <div style={{ padding: '1.5rem', background: 'rgba(255,0,255,0.1)', borderRadius: '12px', border: '1px solid rgba(255,0,255,0.2)' }}>
                <p style={{ color: '#ff00ff', fontSize: '0.875rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Mic size={16} /> You Said:
                </p>
                <p style={{ color: 'white', fontSize: '1rem' }}>
                  "{speechResult.text}"
                </p>
              </div>
            </div>
          </div>

          <button className="btn btn-primary" onClick={reset} style={{ width: '100%', marginTop: '2rem' }}>
            <Play className="w-5 h-5" />
            Try Again
          </button>
        </motion.div>
      )}
    </div>
  )
}

