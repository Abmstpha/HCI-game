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
    const selectedFilterRef = useRef(selectedFilter)

    // Keep ref in sync with state for use in interval
    useEffect(() => {
        selectedFilterRef.current = selectedFilter
    }, [selectedFilter])

    const startCamera = async () => {
        setLoading(true)
        setError('')

        try {
            console.log('Requesting camera access...')
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' }
            })
            console.log('Camera stream obtained:', stream)

            streamRef.current = stream

            if (videoRef.current) {
                videoRef.current.srcObject = stream

                // Wait for video to be ready
                await new Promise<void>((resolve) => {
                    if (videoRef.current) {
                        videoRef.current.onloadedmetadata = () => {
                            console.log('Video metadata loaded')
                            resolve()
                        }
                    }
                })

                await videoRef.current.play()
                console.log('Video playing, dimensions:', videoRef.current.videoWidth, 'x', videoRef.current.videoHeight)

                setLoading(false)
                setIsStreaming(true)
                startFrameProcessing()
            }
        } catch (err) {
            console.error('Camera error:', err)
            setError(`Camera error: ${err instanceof Error ? err.message : 'Unknown error'}`)
            setLoading(false)
        }
    }

    const stopCamera = () => {
        if (processingRef.current) {
            clearInterval(processingRef.current)
            processingRef.current = null
        }
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop())
            streamRef.current = null
        }
        setIsStreaming(false)
        setProcessedImage(null)
        setFaceDetected(false)
    }

    const startFrameProcessing = () => {
        console.log('Starting frame processing...')

        processingRef.current = setInterval(async () => {
            if (!videoRef.current || !canvasRef.current) {
                console.log('No video or canvas ref')
                return
            }

            const video = videoRef.current
            const canvas = canvasRef.current
            const ctx = canvas.getContext('2d')

            if (!ctx || video.videoWidth === 0) {
                console.log('No context or video not ready')
                return
            }

            canvas.width = video.videoWidth
            canvas.height = video.videoHeight
            ctx.drawImage(video, 0, 0)

            canvas.toBlob(async (blob) => {
                if (!blob) return

                try {
                    const formData = new FormData()
                    formData.append('image', blob, 'frame.jpg')
                    formData.append('filter', selectedFilterRef.current)

                    const response = await axios.post(`${API_URL}/apply-filter`, formData, {
                        timeout: 3000
                    })

                    if (response.data && response.data.status === 'success') {
                        setProcessedImage(response.data.image)
                        setFaceDetected(response.data.face_detected || false)
                    } else if (response.data && response.data.status === 'error') {
                        console.error('Server error:', response.data.message)
                    }
                } catch (err) {
                    console.error('Frame processing error:', err)
                }
            }, 'image/jpeg', 0.8)
        }, 150) // Process at ~7 FPS for smoother experience
    }

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
                {/* Hidden video element - always in DOM */}
                <video
                    ref={videoRef}
                    style={{ display: 'none' }}
                    playsInline
                    muted
                    autoPlay
                />
                <canvas ref={canvasRef} style={{ display: 'none' }} />

                {!isStreaming ? (
                    <div className="vision-intro">
                        <div className="intro-text">
                            <h3>📸 Face Filter Experience</h3>
                            <p>Click the button below to start your camera and apply fun AR filters!</p>
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
                        {/* Filter Selection Bar - Above Camera */}
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
                                    <p>Processing first frame...</p>
                                </div>
                            )}

                            {/* Live Badge */}
                            <div className="vision-live-badge">
                                <div className="live-dot" />
                                LIVE
                            </div>

                            {/* Face Detection Status */}
                            <div className={`face-status-badge ${faceDetected ? 'detected' : 'not-detected'}`}>
                                {faceDetected ? '✅ Face Detected' : '❌ No Face'}
                            </div>

                            {/* Current Filter Label */}
                            <div className="current-filter-badge">
                                {FILTERS.find(f => f.id === selectedFilter)?.emoji} {FILTERS.find(f => f.id === selectedFilter)?.name}
                            </div>
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

                .intro-text {
                    text-align: center;
                    margin-bottom: 2rem;
                }

                .intro-text h3 {
                    font-size: 1.5rem;
                    margin-bottom: 0.5rem;
                }

                .intro-text p {
                    color: var(--text-secondary);
                }

                .filter-bar {
                    display: flex;
                    justify-content: center;
                    gap: 0.5rem;
                    margin-bottom: 1rem;
                    flex-wrap: wrap;
                    padding: 0.5rem;
                    background: var(--bg-card);
                    border-radius: 12px;
                }

                .filter-pill {
                    width: 48px;
                    height: 48px;
                    border-radius: 50%;
                    border: 2px solid var(--border);
                    background: var(--bg-main);
                    font-size: 1.5rem;
                    cursor: pointer;
                    transition: all 0.2s;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .filter-pill:hover {
                    transform: scale(1.15);
                    border-color: ${color};
                }

                .filter-pill.active {
                    border-color: ${color};
                    background: ${color};
                    box-shadow: 0 0 20px ${color}80;
                    transform: scale(1.1);
                }

                .loading-placeholder {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    min-height: 400px;
                    color: var(--text-secondary);
                    background: var(--bg-card);
                    border-radius: 12px;
                }

                .face-status-badge {
                    position: absolute;
                    bottom: 10px;
                    left: 10px;
                    padding: 6px 12px;
                    border-radius: 6px;
                    color: white;
                    font-size: 0.75rem;
                    font-weight: 700;
                }

                .face-status-badge.detected {
                    background: rgba(16, 185, 129, 0.9);
                }

                .face-status-badge.not-detected {
                    background: rgba(239, 68, 68, 0.9);
                }
                
                .current-filter-badge {
                    position: absolute;
                    bottom: 10px;
                    right: 10px;
                    padding: 6px 12px;
                    background: rgba(0, 0, 0, 0.7);
                    border-radius: 6px;
                    color: white;
                    font-size: 0.75rem;
                    font-weight: 600;
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

                .vision-video-container {
                    position: relative;
                }

                .vision-video {
                    width: 100%;
                    border-radius: 12px;
                }

                .vision-live-badge {
                    position: absolute;
                    top: 10px;
                    right: 10px;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    padding: 4px 10px;
                    background: rgba(239, 68, 68, 0.9);
                    border-radius: 4px;
                    color: white;
                    font-size: 0.7rem;
                    font-weight: 700;
                }

                .live-dot {
                    width: 8px;
                    height: 8px;
                    background: white;
                    border-radius: 50%;
                    animation: pulse 1s infinite;
                }

                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }

                .btn-vision-start {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 1rem 2rem;
                    background: linear-gradient(135deg, ${color}, #ec4899);
                    border: none;
                    border-radius: 12px;
                    color: white;
                    font-size: 1.1rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s;
                }

                .btn-vision-start:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 10px 30px ${color}40;
                }

                .btn-vision-start:disabled {
                    opacity: 0.7;
                    cursor: wait;
                }

                .vision-intro {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    padding: 2rem;
                }

                .vision-stream {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }

                .vision-error {
                    margin-top: 1rem;
                    padding: 1rem;
                    background: #fef2f2;
                    border: 1px solid #fecaca;
                    border-radius: 8px;
                    color: #dc2626;
                }
            `}</style>
        </div>
    )
}
