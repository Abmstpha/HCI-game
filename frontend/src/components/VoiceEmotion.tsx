import { useState, useRef } from 'react'
import { Mic, Square, Loader2, AlertCircle, History, Trash2 } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

interface VoiceEmotionProps {
    title: string
    description: string
    color: string
    icon: LucideIcon
}

interface EmotionConfig {
    emoji: string
    color: string
    label: string
}

interface EmotionResult {
    emotion: string
    confidence: number
    status?: string
}

interface HistoryItem {
    emotion: string
    timestamp: string
    confidence: number
}

// Visualizer Bars Component
const AudioVisualizer = () => {
    return (
        <div className="audio-visualizer">
            {[...Array(12)].map((_, i) => (
                <div key={i} className="bar" style={{ animationDelay: `${i * 0.1}s` }} />
            ))}
        </div>
    )
}

const VoiceEmotion = ({ title, description, color, icon: Icon }: VoiceEmotionProps) => {
    const [isRecording, setIsRecording] = useState(false)
    const [isProcessing, setIsProcessing] = useState(false)
    const [result, setResult] = useState<EmotionResult | null>(null)
    const [error, setError] = useState('')
    const [gender, setGender] = useState('all')
    const [history, setHistory] = useState<HistoryItem[]>([])

    const mediaRecorderRef = useRef<MediaRecorder | null>(null)
    const audioChunksRef = useRef<Blob[]>([])

    // Emotion Emojis Map
    const emotionConfig: Record<string, EmotionConfig> = {
        happy: { emoji: '😄', color: '#10b981', label: 'Happy' },
        sad: { emoji: '😢', color: '#3b82f6', label: 'Sad' },
        angry: { emoji: '😡', color: '#ef4444', label: 'Angry' },
        fearful: { emoji: '😱', color: '#f59e0b', label: 'Fearful' },
        disgust: { emoji: '🤢', color: '#8b5cf6', label: 'Disgusted' },
        calm: { emoji: '😌', color: '#6366f1', label: 'Calm' },
        neutral: { emoji: '😐', color: '#94a3b8', label: 'Neutral' },
        surprised: { emoji: '😲', color: '#ec4899', label: 'Surprised' }
    }

    const startRecording = async () => {
        try {
            // "Golden Standard" Pipeline from SpeechVsTyping
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

            const mediaRecorder = new MediaRecorder(stream, options)
            mediaRecorderRef.current = mediaRecorder
            audioChunksRef.current = []

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data)
                }
            }

            mediaRecorder.onstop = async () => {
                // Use the actual mimeType of the recorder
                const audioBlob = new Blob(audioChunksRef.current, { type: mediaRecorder.mimeType })
                console.log('Audio blob size:', audioBlob.size, 'bytes, type:', audioBlob.type)

                if (audioBlob.size < 3000) {
                    setError('Audio too short or silent. Check microphone.')
                }

                await analyzeAudio(audioBlob)
                stream.getTracks().forEach(track => track.stop())
            }

            mediaRecorder.start()
            setIsRecording(true)
            setResult(null)
            setError('')
        } catch (err) {
            console.error('Mic error:', err)
            setError('Could not access microphone.')
        }
    }

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop()
            setIsRecording(false)
        }
    }

    const analyzeAudio = async (blob: Blob) => {
        setIsProcessing(true)
        try {
            const formData = new FormData()
            formData.append('audio', blob, 'voice.wav')
            formData.append('gender', gender)

            const response = await axios.post(`${API_URL}/predict-emotion`, formData)
            const data = response.data

            // Handle success
            if (data.status === 'success' || data.emotion) {
                setResult(data)
                const newHistoryItem = {
                    emotion: data.emotion,
                    timestamp: new Date().toLocaleTimeString(),
                    confidence: data.confidence
                }
                setHistory(prev => [newHistoryItem, ...prev].slice(0, 5))
            } else if (data.status === 'no_model') {
                // For now, if no model, let's mock it for the demo if the user hasn't uploaded one
                // Wait, I fixed the model! So this case should be rare.
                setResult(data)
            }
        } catch (err) {
            console.error('Analysis error:', err)
            setError('Failed to analyze emotion. Backend might be busy.')
        } finally {
            setIsProcessing(false)
        }
    }

    const currentConfig = result ? emotionConfig[result.emotion] || { emoji: '🤔', color: '#94a3b8', label: result.emotion } : null

    return (
        <div className="voice-emotion-experience">
            <motion.div className="vision-header" style={{ background: color }}
                initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <div className="vision-header-content">
                    <Icon size={28} color="white" />
                    <div>
                        <h2>{title}</h2>
                        <p>{description}</p>
                    </div>
                </div>
            </motion.div>

            <div className="voice-content">
                {/* Main Interaction Area */}
                <div className="interaction-card">
                    <div className="gender-toggle">
                        <span>Analysis Mode:</span>
                        <select value={gender} onChange={(e) => setGender(e.target.value)}>
                            <option value="all">General Voice</option>
                            <option value="male">Male Voice</option>
                            <option value="female">Female Voice</option>
                        </select>
                    </div>

                    <div className="mic-container">
                        <AnimatePresence mode="wait">
                            {!isRecording ? (
                                <motion.button
                                    key="rec"
                                    className="mic-btn"
                                    onClick={startRecording}
                                    disabled={isProcessing}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <Mic size={40} />
                                    <span>Tap to Speak</span>
                                </motion.button>
                            ) : (
                                <motion.div
                                    key="stop"
                                    className="recording-active"
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0.8, opacity: 0 }}
                                >
                                    <AudioVisualizer />
                                    <button className="stop-btn" onClick={stopRecording}>
                                        <Square size={20} fill="currentColor" />
                                        Stop
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {isProcessing && (
                        <div className="processing-indicator">
                            <Loader2 className="animate-spin" size={24} />
                            Analyzing Tone...
                        </div>
                    )}

                    {error && (
                        <div className="error-msg">
                            <AlertCircle size={16} /> {error}
                        </div>
                    )}
                </div>

                {/* Result Area */}
                <AnimatePresence>
                    {result && !isProcessing && (
                        <motion.div
                            className="result-display"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            {result.status === 'no_model' ? (
                                <div className="error-state">
                                    <AlertCircle size={40} color="#f59e0b" />
                                    <h3>Model Missing</h3>
                                    <p>Please wait for next deployment.</p>
                                </div>
                            ) : (
                                <>
                                    <div className="emotion-emoji">{currentConfig?.emoji}</div>
                                    <h3 style={{ color: currentConfig?.color }}>
                                        {currentConfig?.label?.toUpperCase()}
                                    </h3>
                                    <div className="confidence-pill" style={{ background: `${currentConfig?.color}20`, color: currentConfig?.color }}>
                                        {(result.confidence * 100).toFixed(0)}% Confidence
                                    </div>
                                </>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* History List */}
                {history.length > 0 && (
                    <div className="history-section">
                        <div className="history-header">
                            <History size={16} /> Recent
                            <button onClick={() => setHistory([])} className="clear-btn"><Trash2 size={14} /></button>
                        </div>
                        <div className="history-list">
                            {history.map((item, idx) => {
                                const cfg = emotionConfig[item.emotion]
                                return (
                                    <motion.div
                                        key={idx}
                                        className="history-item"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                    >
                                        <span className="h-emoji">{cfg?.emoji}</span>
                                        <span className="h-label" style={{ color: cfg?.color }}>{cfg?.label}</span>
                                        <span className="h-time">{item.timestamp}</span>
                                    </motion.div>
                                )
                            })}
                        </div>
                    </div>
                )}
            </div>

            <style>{`
                .voice-content {
                    max-width: 500px;
                    margin: 0 auto;
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                }
                .interaction-card {
                    background: white;
                    padding: 2rem;
                    border-radius: 1.5rem;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.05);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 2rem;
                    position: relative;
                    overflow: hidden;
                }
                .gender-toggle {
                    display: flex;
                    align-items: center;
                    gap: 0.8rem;
                    font-size: 0.9rem;
                    color: #64748b;
                    background: #f1f5f9;
                    padding: 0.5rem 1rem;
                    border-radius: 2rem;
                }
                .gender-toggle select {
                    background: transparent;
                    border: none;
                    font-weight: 600;
                    color: #334155;
                    cursor: pointer;
                }
                
                .mic-container {
                    height: 120px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .mic-btn {
                    width: 100px;
                    height: 100px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #6366f1, #8b5cf6);
                    color: white;
                    border: none;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 5px;
                    font-size: 0.8rem;
                    font-weight: 600;
                    cursor: pointer;
                    box-shadow: 0 10px 20px rgba(99, 102, 241, 0.3);
                }
                
                .recording-active {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 1rem;
                }
                .stop-btn {
                    background: #fee2e2;
                    color: #ef4444;
                    border: none;
                    padding: 0.5rem 1.5rem;
                    border-radius: 2rem;
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    cursor: pointer;
                }

                .audio-visualizer {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    height: 40px;
                }
                .bar {
                    width: 6px;
                    background: #6366f1;
                    height: 10%;
                    border-radius: 3px;
                    animation: equalize 0.8s infinite ease-in-out;
                }
                @keyframes equalize {
                    0% { height: 10%; }
                    50% { height: 100%; }
                    100% { height: 10%; }
                }

                .processing-indicator {
                    color: #6366f1;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-size: 0.9rem;
                    font-weight: 500;
                }

                .result-display {
                    background: white;
                    border-radius: 1.5rem;
                    padding: 2rem;
                    text-align: center;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.05);
                }
                .emotion-emoji { font-size: 4rem; margin-bottom: 0.5rem; animation: bounce 1s; }
                .result-display h3 { font-size: 2rem; font-weight: 800; margin: 0; }
                .confidence-pill {
                    display: inline-block;
                    margin-top: 0.5rem;
                    padding: 0.25rem 1rem;
                    border-radius: 1rem;
                    font-size: 0.85rem;
                    font-weight: 600;
                }

                .history-section {
                    background: white;
                    border-radius: 1rem;
                    padding: 1rem;
                    box-shadow: 0 4px 10px rgba(0,0,0,0.03);
                }
                .history-header {
                    display: flex;
                    justify-content: space-between;
                    font-size: 0.85rem;
                    font-weight: 700;
                    color: #94a3b8;
                    margin-bottom: 0.8rem;
                    padding-bottom: 0.5rem;
                    border-bottom: 1px solid #f1f5f9;
                }
                .history-item {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 0.6rem;
                    font-size: 0.9rem;
                }
                .h-emoji { margin-right: 0.5rem; }
                .h-label { font-weight: 600; flex: 1; }
                .h-time { font-size: 0.75rem; color: #cbd5e1; }
                
                @keyframes bounce {
                    0%, 20%, 50%, 80%, 100% {transform: translateY(0);}
                    40% {transform: translateY(-10px);}
                    60% {transform: translateY(-5px);}
                }
            `}</style>
        </div>
    )
}

export default VoiceEmotion
