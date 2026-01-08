import { useState, useRef, useEffect } from 'react'
import { Camera, StopCircle, AlertCircle } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { motion } from 'framer-motion'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

interface GazeTrackingProps {
    title: string
    description: string
    color: string
    icon: LucideIcon
}

const GazeTracking = ({ title, description, color, icon: Icon }: GazeTrackingProps) => {
    const [isActive, setIsActive] = useState(false)
    const [processedImage, setProcessedImage] = useState<string | null>(null)
    const [stats, setStats] = useState({ direction: 'Ready', fps: 0 })
    const [error, setError] = useState('')

    const videoRef = useRef<HTMLVideoElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const intervalRef = useRef<number | null>(null)
    const frameCountRef = useRef(0)
    const lastFpsTimeRef = useRef(0)

    useEffect(() => {
        lastFpsTimeRef.current = Date.now()
    }, [])

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { width: 640, height: 480, frameRate: 30 }
            })
            if (videoRef.current) {
                videoRef.current.srcObject = stream
                await videoRef.current.play()
                setIsActive(true)
                setError('')
                startProcessing()
            }
        } catch (err) {
            console.error("Camera error:", err)
            setError("Could not access camera. Please allow permissions.")
        }
    }

    const stopCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
            tracks.forEach(track => track.stop())
            videoRef.current.srcObject = null
        }
        if (intervalRef.current) clearInterval(intervalRef.current)
        setIsActive(false)
        setProcessedImage(null)
    }

    const startProcessing = () => {
        if (intervalRef.current) clearInterval(intervalRef.current)

        // Process frames at ~10 FPS to reduce load / lag
        intervalRef.current = window.setInterval(async () => {
            if (!videoRef.current || !canvasRef.current) return

            const ctx = canvasRef.current.getContext('2d')
            if (!ctx) return

            // Draw video to canvas
            ctx.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height)

            // Convert to Blob
            canvasRef.current.toBlob(async (blob) => {
                if (!blob) return

                try {
                    const formData = new FormData()
                    formData.append('image', blob)

                    const response = await axios.post(`${API_URL}/process-gaze`, formData)
                    const data = response.data

                    if (data.status === 'success') {
                        setProcessedImage(data.image)

                        // Calculate FPS
                        frameCountRef.current++
                        const now = Date.now()
                        if (now - lastFpsTimeRef.current >= 1000) {
                            setStats(prev => ({ ...prev, fps: frameCountRef.current }))
                            frameCountRef.current = 0
                            lastFpsTimeRef.current = now
                        }

                        setStats(prev => ({ ...prev, direction: data.direction }))
                    }
                } catch (err) {
                    console.error("Processing error", err)
                }
            }, 'image/jpeg', 0.8)

        }, 100) // 100ms = 10 FPS
    }

    // Cleanup
    useEffect(() => {
        return () => stopCamera()
    }, [])

    return (
        <div className="vision-experience">
            <motion.div
                className="vision-header"
                style={{ background: color }}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="vision-header-content">
                    <Icon size={28} color="white" />
                    <div>
                        <h2>{title}</h2>
                        <p>{description}</p>
                    </div>
                </div>
            </motion.div>

            <div className="vision-content">
                <div className="camera-container" style={{ aspectRatio: '4/3', maxWidth: 640, margin: '0 auto' }}>
                    {/* Hidden video and canvas for capturing */}
                    <video
                        ref={videoRef}
                        playsInline
                        muted
                        style={{ display: 'none' }}
                    />
                    <canvas
                        ref={canvasRef}
                        width={640}
                        height={480}
                        style={{ display: 'none' }}
                    />

                    {/* Display Area */}
                    {!isActive ? (
                        <div className="camera-placeholder">
                            <motion.button
                                className="start-btn"
                                onClick={startCamera}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Camera size={24} />
                                Start Camera
                            </motion.button>
                            {error && <div className="error-msg"><AlertCircle size={16} /> {error}</div>}
                        </div>
                    ) : (
                        <div className="live-feed">
                            {processedImage ? (
                                <img src={processedImage} alt="Gaze Tracking" className="processed-feed" />
                            ) : (
                                <div className="loading-feed">Initializing Gaze Tracker...</div>
                            )}

                            {/* Overlay Stats */}
                            <div className="stats-overlay">
                                <div className="stat-item">
                                    <span className="stat-label">Direction</span>
                                    <span className="stat-value">{stats.direction}</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-label">FPS</span>
                                    <span className="stat-value">{stats.fps}</span>
                                </div>
                            </div>

                            <motion.button
                                className="stop-fab"
                                onClick={stopCamera}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                            >
                                <StopCircle size={32} color="#ef4444" />
                            </motion.button>
                        </div>
                    )}
                </div>


            </div>

            <style>{`
                .vision-experience {
                    width: 100%;
                    max-width: 800px;
                    margin: 0 auto;
                }
                .vision-header {
                    padding: 1.5rem;
                    border-radius: 1rem;
                    color: white;
                    margin-bottom: 2rem;
                    box-shadow: 0 10px 20px rgba(0,0,0,0.1);
                }
                .vision-header-content {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }
                .vision-header h2 { margin: 0; font-size: 1.5rem; }
                .vision-header p { margin: 0.2rem 0 0; opacity: 0.9; font-size: 0.9rem; }
                
                .camera-container {
                    background: black;
                    border-radius: 1rem;
                    overflow: hidden;
                    position: relative;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.2);
                }
                .camera-placeholder {
                    width: 100%;
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    background: #1e293b;
                    color: white;
                }
                .start-btn {
                    background: white;
                    color: #1e293b;
                    border: none;
                    padding: 1rem 2rem;
                    border-radius: 2rem;
                    font-weight: 700;
                    font-size: 1.1rem;
                    display: flex;
                    align-items: center;
                    gap: 0.8rem;
                    cursor: pointer;
                    box-shadow: 0 4px 15px rgba(255,255,255,0.2);
                }
                
                .live-feed {
                    width: 100%;
                    height: 100%;
                    position: relative;
                }
                .processed-feed {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
                .loading-feed {
                    width: 100%;
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                }
                
                .stats-overlay {
                    position: absolute;
                    top: 1rem;
                    left: 1rem;
                    display: flex;
                    gap: 1rem;
                }
                .stat-item {
                    background: rgba(0,0,0,0.6);
                    backdrop-filter: blur(4px);
                    padding: 0.5rem 1rem;
                    border-radius: 0.8rem;
                    color: white;
                    display: flex;
                    flex-direction: column;
                }
                .stat-label { font-size: 0.65rem; text-transform: uppercase; opacity: 0.8; }
                .stat-value { font-size: 1.1rem; font-weight: 700; color: #4ade80; }

                .stop-fab {
                    position: absolute;
                    bottom: 2rem;
                    left: 50%;
                    transform: translateX(-50%);
                    background: white;
                    width: 60px;
                    height: 60px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: none;
                    cursor: pointer;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.3);
                }
                
                .instructions-card {
                    background: white;
                    padding: 1.5rem;
                    border-radius: 1rem;
                    margin-top: 2rem;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.05);
                }
                .tags {
                    display: flex;
                    gap: 0.5rem;
                    margin-top: 1rem;
                }
                .tag {
                    background: #f1f5f9;
                    color: #475569;
                    padding: 0.3rem 0.8rem;
                    border-radius: 1rem;
                    font-size: 0.8rem;
                    font-weight: 600;
                }
                .error-msg {
                    margin-top: 1rem;
                    color: #ef4444;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }
            `}</style>
        </div>
    )
}

export default GazeTracking
