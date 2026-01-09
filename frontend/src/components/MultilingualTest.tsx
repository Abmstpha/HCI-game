import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Mic, Play } from 'lucide-react'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

interface Language {
  code: string
  name: string
  flag: string
}

interface TranscriptionResult {
  transcription: string
  accuracy: number
  language: string
  flag: string
}

export default function MultilingualTest() {
  const [languages, setLanguages] = useState<Language[]>([])
  const [selectedLang, setSelectedLang] = useState('')
  const [targetPhrase, setTargetPhrase] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
  const [result, setResult] = useState<TranscriptionResult | null>(null)

  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const response = await axios.get(`${API_URL}/languages`)
        setLanguages(response.data.languages)
      } catch (error) {
        console.error('Error fetching languages:', error)
      }
    }
    fetchLanguages()
  }, [])

  const startRecording = async () => {
    if (!selectedLang || !targetPhrase) {
      alert('Please select a language and enter a target phrase first!')
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      const chunks: Blob[] = []

      recorder.ondataavailable = (e) => {
        console.log('Chunk received, size:', e.data.size)
        chunks.push(e.data)
      }

      recorder.onstop = async () => {
        const blob = new Blob(chunks, { type: recorder.mimeType || 'audio/webm' })
        console.log('Final audio blob size:', blob.size, 'bytes')
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
    try {
      const formData = new FormData()
      formData.append('audio', audioBlob, 'recording.wav')
      formData.append('language', selectedLang)
      formData.append('target_sentence', targetPhrase)

      const response = await axios.post(`${API_URL}/transcribe`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      const langInfo = languages.find(l => l.code === selectedLang)

      setResult({
        transcription: response.data.transcription,
        accuracy: response.data.accuracy,
        language: langInfo?.name || selectedLang,
        flag: langInfo?.flag || '🌐'
      })
    } catch (error) {
      console.error('Error transcribing audio:', error)
      alert('Error processing speech. Please try again!')
    }
  }

  const reset = () => {
    setResult(null)
    setSelectedLang('')
    setTargetPhrase('')
  }

  const examplePhrases: { [key: string]: string } = {
    'en-US': 'Hello, how are you today?',
    'es-ES': 'Hola, ¿cómo estás hoy?',
    'fr-FR': 'Bonjour, comment allez-vous?',
    'de-DE': 'Hallo, wie geht es dir?',
    'it-IT': 'Ciao, come stai oggi?',
    'pt-BR': 'Olá, como você está hoje?',
    'ja-JP': 'こんにちは、お元気ですか？',
    'zh-CN': '你好，你今天好吗？',
    'ko-KR': '안녕하세요, 오늘 어떻게 지내세요?',
    'ar-SA': 'مرحبا، كيف حالك اليوم؟',
    'hi-IN': 'नमस्ते, आज आप कैसे हैं?',
    'ru-RU': 'Привет, как дела сегодня?'
  }

  return (
    <div className="experiment-container">
      <motion.div
        className="experiment-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2>🌐 Multilingual Test</h2>
        <p>Test speech recognition in different languages</p>
      </motion.div>

      {!result && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="test-section"
        >
          <h3>Select Language:</h3>
          <select
            className="select-field"
            value={selectedLang}
            onChange={(e) => {
              setSelectedLang(e.target.value)
              if (examplePhrases[e.target.value]) {
                setTargetPhrase(examplePhrases[e.target.value])
              }
            }}
          >
            <option value="">Choose a language...</option>
            {languages.map(lang => (
              <option key={lang.code} value={lang.code}>
                {lang.flag} {lang.name}
              </option>
            ))}
          </select>

          {selectedLang && (
            <>
              <h3>Enter Target Phrase:</h3>
              <input
                type="text"
                className="input-field"
                placeholder="Enter phrase in selected language..."
                value={targetPhrase}
                onChange={(e) => setTargetPhrase(e.target.value)}
              />

              {targetPhrase && (
                <div className="target-sentence">
                  <div style={{ fontSize: '0.875rem', opacity: 0.8, marginBottom: '0.5rem' }}>
                    Target Phrase:
                  </div>
                  "{targetPhrase}"
                </div>
              )}

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
                disabled={!targetPhrase}
              >
                <Mic className="w-5 h-5" />
                {isRecording ? 'Stop Recording' : 'Start Recording'}
              </button>

              {isRecording && (
                <p style={{ textAlign: 'center', color: '#ff00ff', marginTop: '1rem', fontWeight: 600 }}>
                  🔴 Recording... Speak in {languages.find(l => l.code === selectedLang)?.name}
                </p>
              )}
            </>
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
            📊 Multilingual Test Results
          </h3>

          <div className="result-item">
            <span className="result-label">Language:</span>
            <span className="result-value" style={{ fontSize: '1.25rem' }}>
              {result.flag} {result.language}
            </span>
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
            Test Another Language
          </button>
        </motion.div>
      )}
    </div>
  )
}

