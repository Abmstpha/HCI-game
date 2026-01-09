import { useState, useRef, useEffect } from 'react'
import { Loader2, Camera, CameraOff, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// Available filter types
const FILTERS = [
    { id: 'none', name: 'No Filter', emoji: '🚫' },
    { id: 'sunglasses', name: 'Sunglasses', emoji: '🕶️' },
    { id: 'hat', name: 'Party Hat', emoji: '🎩' },
    { id: 'cigar', name: 'Cigar', emoji: '🚬' },
    { id: 'beard', name: 'Beard', emoji: '🧔' },
    { id: 'mustache', name: 'Mustache', emoji: '👨' },
    { id: 'bald', name: 'Bald Head', emoji: '👨‍🦲' },
    { id: 'clown', name: 'Clown Nose', emoji: '🤡' },
    { id: 'dog', name: 'Dog Ears', emoji: '🐕' },
]

interface FaceFilterProps {
    title?: string
    description?: string
    color?: string
}

export default function FaceFilter({
    title = 'Snapchat Filters',
    description = 'Apply fun filters to your face in real-time!',
    color = '#8b5cf6'
}: FaceFilterProps) {
    const [isStreaming, setIsStreaming] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [selectedFilter, setSelectedFilter] = useState('sunglasses')
    const [processedImage, setProcessedImage] = useState<string | null>(null)
    const [faceDetected, setFaceDetected] = useState(false)

    const videoRef = useRef<HTMLVideoElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const streamRef = useRef<MediaStream | null>(null)
    const processingRef = useRef<ReturnType<typeof setInterval> | null>(null)

    const startCamera = async () => {
        setLoading(true)
        setError('')
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' }
            })
            streamRef.current = stream
            if (videoRef.current) {
                videoRef.current.srcObject = stream
                videoRef.current.onloadedmetadata = () => {
                    videoRef.current?.play()
                    setLoading(false)
                    setIsStreaming(true)
                    startFrameProcessing()
                }
            }
        } catch (err) {
            console.error('Camera error:', err)
            setError('Could not access camera. Please allow camera permissions.')
            setLoading(false)
        }
    }

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop())
            streamRef.current = null
        }
        if (processingRef.current) {
            clearInterval(processingRef.current)
            processingRef.current = null
        }
        setIsStreaming(false)
        setProcessedImage(null)
        setFaceDetected(false)
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
                    formData.append('image', blob, 'frame.jpg')
                    formData.append('filter', selectedFilter)

                    const response = await axios.post(`${API_URL}/apply-filter`, formData, {
                        timeout: 2000
                    })

                    if (response.data && response.data.status === 'success') {
                        setProcessedImage(response.data.image)
                        setFaceDetected(response.data.face_detected || false)
                    }
                } catch (err) {
                    // Silently handle processing errors
                    console.error('Frame processing error:', err)
                }
            }, 'image/jpeg', 0.8)
        }, 100) // Process at ~10 FPS
    }

    // Update filter on the fly
    useEffect(() => {
        // Filter change is handled in the next frame automatically
    }, [selectedFilter])

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stopCamera()
        }
    }, [])

    return (
        <div className="face-filter-container">
            <motion.div
                className="vision-header"
                style={{ background: color }}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="vision-header-content">
                    <Sparkles size={28} color="white" />
                    <div>
                        <h2>{title}</h2>
                        <p>{description}</p>
                    </div>
                </div>
            </motion.div>

            <div className="vision-content">
                {!isStreaming ? (
                    <div className="vision-intro">
                        {/* Filter Selection */}
                        <div className="filter-selection">
                            <h3>Select a Filter:</h3>
                            <div className="filter-grid">
                                {FILTERS.map(filter => (
                                    <button
                                        key={filter.id}
                                        className={`filter-btn ${selectedFilter === filter.id ? 'active' : ''}`}
                                        onClick={() => setSelectedFilter(filter.id)}
                                    >
                                        <span className="filter-emoji">{filter.emoji}</span>
                                        <span className="filter-name">{filter.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            className="btn-vision-start"
                            onClick={startCamera}
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="animate-spin" size={20} />
                                    Starting Camera...
                                </>
                            ) : (
                                <>
                                    <Camera size={20} />
                                    Start Camera
                                </>
                            )}
                        </button>

                        {error && (
                            <div className="vision-error">
                                <span>⚠️ {error}</span>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="vision-stream">
                        {/* Filter Selection - Compact */}
                        <div className="filter-bar">
                            {FILTERS.map(filter => (
                                <button
                                    key={filter.id}
                                    className={`filter-pill ${selectedFilter === filter.id ? 'active' : ''}`}
                                    onClick={() => setSelectedFilter(filter.id)}
                                    title={filter.name}
                                >
                                    {filter.emoji}
                                </button>
                            ))}
                        </div>

                        <div className="vision-video-container">
                            {/* Hidden video for capture */}
                            <video
                                ref={videoRef}
                                style={{ display: 'none' }}
                                playsInline
                                muted
                            />
                            {/* Hidden canvas for frame extraction */}
                            <canvas ref={canvasRef} style={{ display: 'none' }} />

                            {/* Processed image display */}
                            {processedImage ? (
                                <img
                                    src={processedImage}
                                    alt="Filtered"
                                    className="vision-video"
                                    style={{ transform: 'scaleX(-1)' }}
                                />
                            ) : (
                                <div className="loading-placeholder">
                                    <Loader2 className="animate-spin" size={40} />
                                    <p>Processing...</p>
                                </div>
                            )}

                            {/* Live Badge */}
                            <div className="vision-live-badge">
                                <div className="live-dot" />
                                LIVE
                            </div>

                            {/* Face Detection Status */}
                            {faceDetected && (
                                <div className="face-detected-badge">
                                    ✅ Face Detected
                                </div>
                            )}
                        </div>

                        <button className="btn-vision-stop" onClick={stopCamera}>
                            <CameraOff size={18} />
                            Stop Camera
                        </button>
                    </div>
                )}
            </div>

            <style>{`
                .face-filter-container {
                    width: 100%;
                    max-width: 900px;
                    margin: 0 auto;
                }

                .filter-selection {
                    margin-bottom: 2rem;
                    width: 100%;
                }

                .filter-selection h3 {
                    margin-bottom: 1rem;
                    color: var(--text-primary);
                }

                .filter-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
                    gap: 0.75rem;
                }

                .filter-btn {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 1rem;
                    background: var(--bg-main);
                    border: 2px solid var(--border);
                    border-radius: 12px;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .filter-btn:hover {
                    border-color: ${color};
                    transform: translateY(-2px);
                }

                .filter-btn.active {
                    border-color: ${color};
                    background: ${color}20;
                }

                .filter-emoji {
                    font-size: 2rem;
                }

                .filter-name {
                    font-size: 0.75rem;
                    color: var(--text-secondary);
                    text-align: center;
                }

                .filter-bar {
                    display: flex;
                    justify-content: center;
                    gap: 0.5rem;
                    margin-bottom: 1rem;
                    flex-wrap: wrap;
                }

                .filter-pill {
                    width: 48px;
                    height: 48px;
                    border-radius: 50%;
                    border: 2px solid var(--border);
                    background: var(--bg-card);
                    font-size: 1.5rem;
                    cursor: pointer;
                    transition: all 0.2s;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .filter-pill:hover {
                    transform: scale(1.1);
                    border-color: ${color};
                }

                .filter-pill.active {
                    border-color: ${color};
                    background: ${color};
                    box-shadow: 0 0 20px ${color}80;
                }

                .loading-placeholder {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    min-height: 400px;
                    color: var(--text-secondary);
                }

                .face-detected-badge {
                    position: absolute;
                    bottom: 10px;
                    left: 10px;
                    padding: 4px 10px;
                    background: rgba(16, 185, 129, 0.9);
                    border-radius: 4px;
                    color: white;
                    font-size: 0.7rem;
                    font-weight: 700;
                }

                .btn-vision-stop {
                    margin-top: 1rem;
                    padding: 0.75rem 1.5rem;
                    background: #fef2f2;
                    border: 1px solid #fecaca;
                    border-radius: 8px;
                    color: #dc2626;
                    font-weight: 600;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    transition: all 0.2s;
                }

                .btn-vision-stop:hover {
                    background: #fee2e2;
                }
            `}</style>
        </div>
    )
}
