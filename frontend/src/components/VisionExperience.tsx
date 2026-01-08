import { useState, useEffect, useRef } from 'react'
import { Loader2, AlertCircle, Camera, CameraOff, Zap } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

interface VisionExperienceProps {
    title: string
    description: string
    streamEndpoint: string
    icon: any
    color: string
    instructions: string[]
    statusKey: 'gesture' | 'pose' | 'emotion'
}

interface StreamStatus {
    status: string
    gesture?: string
    pose?: string
    emotion?: string
    scores?: Record<string, number> // New field for emotion scores
    message: string
}

const EmotionScores = ({ scores }: { scores?: Record<string, number> }) => {
    if (!scores) return null

    // Sort by score descending
    const sortedScores = Object.entries(scores)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5) // Show top 5

    return (
        <motion.div
            className="vision-scores-card"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
        >
            <h4>Emotion Confidence</h4>
            <div className="scores-list">
                {sortedScores.map(([emotion, score]) => (
                    <div key={emotion} className="score-item">
                        <div className="score-header">
                            <span className="score-label">{emotion}</span>
                            <span className="score-value">{score.toFixed(1)}%</span>
                        </div>
                        <div className="score-bar-bg">
                            <motion.div
                                className="score-bar-fill"
                                initial={{ width: 0 }}
                                animate={{ width: `${score}%` }}
                                transition={{ type: "spring", stiffness: 50 }}
                                style={{
                                    background: score > 50 ? '#10b981' : '#3b82f6'
                                }}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </motion.div>
    )
}

const VisionExperience = ({
    title,
    description,
    streamEndpoint,
    icon: Icon,
    color,
    instructions,
    statusKey
}: VisionExperienceProps) => {
    const [isStreaming, setIsStreaming] = useState(false)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [status, setStatus] = useState<StreamStatus>({ status: 'waiting', message: 'Waiting...' })

    // Force Native Camera for ALL modes (Server cannot access camera)
    const needsMjpegStream = false

    // Native camera refs (for emotion)
    const videoRef = useRef<HTMLVideoElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const streamRef = useRef<MediaStream | null>(null)
    const processingRef = useRef<ReturnType<typeof setInterval> | null>(null)
    const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null)
    const [processedImage, setProcessedImage] = useState<string | null>(null)

    // ========== MJPEG STREAM MODE (gesture/pose) ==========
    const startMjpegStream = () => {
        setLoading(true)
        setError('')
        // The <img> tag will automatically start streaming
        setTimeout(() => {
            setLoading(false)
            startPolling()
        }, 1000)
    }

    const startPolling = () => {
        pollingRef.current = setInterval(async () => {
            try {
                const response = await axios.get(`${API_URL}/stream/${statusKey}/status`)
                if (response.data) {
                    setStatus(response.data)
                }
            } catch (err) {
                // Silently handle
            }
        }, 300)
    }

    // ========== NATIVE CAMERA MODE (emotion) ==========
    const startNativeCamera = async (videoElement: HTMLVideoElement) => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' }
            })
            streamRef.current = stream
            videoElement.srcObject = stream
            videoElement.onloadedmetadata = () => {
                videoElement.play()
                setLoading(false)
                startFrameProcessing()
            }
        } catch (err) {
            console.error('Camera error:', err)
            setError('Could not access camera.')
            setLoading(false)
            setIsStreaming(false)
        }
    }

    const startFrameProcessing = () => {
        processingRef.current = setInterval(async () => {
            if (!videoRef.current || !canvasRef.current) return
            const video = videoRef.current
            const canvas = canvasRef.current
            const ctx = canvas.getContext('2d')
            if (!ctx || video.videoWidth === 0) return

            canvas.width = video.videoWidth
            canvas.height = video.videoHeight
            ctx.drawImage(video, 0, 0)

            canvas.toBlob(async (blob) => {
                if (!blob) return
                try {
                    const formData = new FormData()
                    formData.append('frame', blob, 'frame.jpg')
                    formData.append('type', statusKey)
                    const response = await axios.post(`${API_URL}/process-frame`, formData, { timeout: 2000 })
                    if (response.data && response.data.status !== 'error') {
                        setStatus(response.data)
                        if (response.data.image) {
                            setProcessedImage(response.data.image)
                        }
                    }
                } catch (err) {
                    // Silently handle
                }
            }, 'image/jpeg', 0.7)
        }, 400)
    }

    // Callback ref for native camera
    const handleVideoRef = (element: HTMLVideoElement | null) => {
        if (element && isStreaming && !needsMjpegStream && !streamRef.current) {
            videoRef.current = element
            startNativeCamera(element)
        } else if (element) {
            videoRef.current = element
        }
    }

    // ========== START/STOP ==========
    const handleStart = () => {
        setLoading(true)
        setError('')
        setIsStreaming(true)
        if (needsMjpegStream) {
            startMjpegStream()
        }
    }

    const handleStop = () => {
        setIsStreaming(false)
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop())
            streamRef.current = null
        }
        if (processingRef.current) clearInterval(processingRef.current)
        if (pollingRef.current) clearInterval(pollingRef.current)
    }

    useEffect(() => {
        return () => handleStop()
    }, [])

    const getDetectedValue = () => {
        if (statusKey === 'gesture') return status.gesture || 'None'
        if (statusKey === 'pose') return status.pose || 'None'
        if (statusKey === 'emotion') {
            const emotion = status.emotion || 'neutral'
            // If we have scores, find the percentage for the dominant emotion
            const score = status.scores ? status.scores[emotion] : 0
            return score > 0 ? `${emotion.charAt(0).toUpperCase() + emotion.slice(1)} (${score.toFixed(0)}%)` : emotion
        }
        return 'None'
    }

    const getStatusColor = () => status.status === 'active' ? '#0891b2' : '#94a3b8'

    return (
        <div className="vision-experience">
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

            <div className="vision-content">
                <AnimatePresence mode="wait">
                    {!isStreaming ? (
                        <motion.div key="intro" className="vision-intro"
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <div className="vision-instructions">
                                <h3>How it works:</h3>
                                <ul>
                                    {instructions.map((instruction, idx) => (
                                        <motion.li key={idx}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.1 }}>
                                            {instruction}
                                        </motion.li>
                                    ))}
                                </ul>
                            </div>
                            <motion.button onClick={handleStart} disabled={loading}
                                className="btn-vision-start" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                <Camera size={20} />
                                Start Camera
                            </motion.button>
                            {error && (
                                <motion.div className="vision-error" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                    <AlertCircle size={18} /> {error}
                                </motion.div>
                            )}
                        </motion.div>
                    ) : (
                        <motion.div key="stream" className="vision-stream-layout"
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>

                            {/* Status Panel */}
                            <div className="vision-status-panel" style={{ borderColor: getStatusColor() }}>
                                <div className="status-indicator">
                                    <div className="status-dot" style={{ background: getStatusColor() }} />
                                    <span className="status-label">
                                        {status.status === 'active' ? 'DETECTED' : 'SCANNING'}
                                    </span>
                                </div>
                                <div className="status-main">
                                    <Zap size={24} style={{ color: getStatusColor() }} />
                                    <div className="status-text">
                                        <span className="detected-value" style={{ color: getStatusColor() }}>
                                            {getDetectedValue()}
                                        </span>
                                        <span className="detected-message">{status.message}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Video Container */}
                            <div className="vision-video-wrapper">
                                <div className="vision-video-container">
                                    {needsMjpegStream ? (
                                        // MJPEG stream for gesture/pose (has skeleton overlay)
                                        <img
                                            src={`${API_URL}${streamEndpoint}`}
                                            alt="Video Stream"
                                            className="vision-video"
                                            onLoad={() => setLoading(false)}
                                            onError={() => {
                                                setError('Failed to connect to camera stream.')
                                                setIsStreaming(false)
                                            }}
                                        />
                                    ) : (
                                        // Native camera logic
                                        <>
                                            <video
                                                ref={handleVideoRef}
                                                className="vision-video"
                                                autoPlay playsInline muted
                                                style={{ transform: 'scaleX(-1)' }}
                                            />
                                            {/* Annotated Overlay (Skeleton) */}
                                            {processedImage && (
                                                <img
                                                    src={processedImage}
                                                    alt="Overlay"
                                                    className="vision-video"
                                                    style={{
                                                        position: 'absolute',
                                                        top: 0,
                                                        left: 0,
                                                        width: '100%',
                                                        height: '100%',
                                                        transform: 'scaleX(-1)', // Match video mirror
                                                        pointerEvents: 'none'
                                                    }}
                                                />
                                            )}

                                            <canvas ref={canvasRef} style={{ display: 'none' }} />
                                            {/* Show Confidence Scores for Emotion AI */}
                                            {statusKey === 'emotion' && <EmotionScores scores={status.scores} />}
                                        </>
                                    )}

                                    {loading && (
                                        <div className="vision-loading-overlay">
                                            <Loader2 className="animate-spin" size={32} />
                                            <span>Starting camera...</span>
                                        </div>
                                    )}

                                    <div className="vision-live-badge">
                                        <span className="live-dot"></span>
                                        LIVE
                                    </div>
                                </div>
                            </div>

                            <div className="vision-controls">
                                <button onClick={handleStop} className="btn-vision-stop">
                                    <CameraOff size={18} />
                                    Stop Camera
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}

export default VisionExperience
