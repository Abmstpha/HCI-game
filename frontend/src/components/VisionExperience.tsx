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
    message: string
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
    const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null)

    const startStream = () => {
        setLoading(true)
        setError('')
        setTimeout(() => {
            setIsStreaming(true)
            setLoading(false)
            // Start polling for status
            startPolling()
        }, 500)
    }

    const stopStream = () => {
        setIsStreaming(false)
        stopPolling()
    }

    const startPolling = () => {
        pollingRef.current = setInterval(async () => {
            try {
                const response = await axios.get(`${API_URL}/stream/${statusKey}/status`)
                setStatus(response.data)
            } catch (err) {
                // Silently handle polling errors
            }
        }, 300)
    }

    const stopPolling = () => {
        if (pollingRef.current) {
            clearInterval(pollingRef.current)
            pollingRef.current = null
        }
    }

    useEffect(() => {
        return () => stopPolling()
    }, [])

    const getDetectedValue = () => {
        if (statusKey === 'gesture') return status.gesture || 'None'
        if (statusKey === 'pose') return status.pose || 'None'
        if (statusKey === 'emotion') return status.emotion || 'neutral'
        return 'None'
    }

    const getStatusColor = () => {
        if (status.status === 'active') return '#22c55e'
        return '#6b7280'
    }

    return (
        <div className="vision-experience">
            {/* Header */}
            <motion.div
                className="vision-header"
                style={{ background: color }}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="vision-header-content">
                    <Icon size={32} color="white" />
                    <div>
                        <h2>{title}</h2>
                        <p>{description}</p>
                    </div>
                </div>
            </motion.div>

            {/* Main Content */}
            <div className="vision-content">
                <AnimatePresence mode="wait">
                    {!isStreaming ? (
                        <motion.div
                            key="intro"
                            className="vision-intro"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                        >
                            <div className="vision-instructions">
                                <h3>📝 How it works:</h3>
                                <ul>
                                    {instructions.map((instruction, idx) => (
                                        <motion.li
                                            key={idx}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.1 }}
                                        >
                                            {instruction}
                                        </motion.li>
                                    ))}
                                </ul>
                            </div>

                            <motion.button
                                onClick={startStream}
                                disabled={loading}
                                className="btn-vision-start"
                                style={{ background: color }}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="animate-spin" size={24} />
                                        Starting Camera...
                                    </>
                                ) : (
                                    <>
                                        <Camera size={24} />
                                        Start Experience
                                    </>
                                )}
                            </motion.button>

                            {error && (
                                <motion.div className="vision-error" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                    <AlertCircle size={20} />
                                    {error}
                                </motion.div>
                            )}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="stream"
                            className="vision-stream-layout"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            {/* Status Panel - TOP */}
                            <motion.div
                                className="vision-status-panel"
                                style={{ borderColor: getStatusColor() }}
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                <div className="status-indicator">
                                    <div
                                        className="status-dot"
                                        style={{ background: getStatusColor() }}
                                    />
                                    <span className="status-label">
                                        {status.status === 'active' ? 'DETECTED' : 'SCANNING'}
                                    </span>
                                </div>

                                <div className="status-main">
                                    <Zap size={28} style={{ color: getStatusColor() }} />
                                    <div className="status-text">
                                        <span className="detected-value" style={{ color: getStatusColor() }}>
                                            {getDetectedValue()}
                                        </span>
                                        <span className="detected-message">{status.message}</span>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Video Container */}
                            <div className="vision-video-wrapper">
                                <div className="vision-video-container">
                                    <img
                                        src={`${API_URL}${streamEndpoint}`}
                                        alt="Video Stream"
                                        className="vision-video"
                                        onError={() => {
                                            setError('Failed to connect to camera.')
                                            setIsStreaming(false)
                                        }}
                                    />

                                    <div className="vision-live-badge">
                                        <span className="live-dot"></span>
                                        LIVE
                                    </div>
                                </div>
                            </div>

                            {/* Controls - BOTTOM */}
                            <div className="vision-controls">
                                <motion.button
                                    onClick={stopStream}
                                    className="btn-vision-stop"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <CameraOff size={20} />
                                    Stop Camera
                                </motion.button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}

export default VisionExperience
