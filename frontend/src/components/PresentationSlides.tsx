import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight, Monitor, Server, Brain, Shield, AlertTriangle } from 'lucide-react'
import './PresentationSlides.css'

interface Slide {
    id: number
    title: string
    subtitle?: string
    content: React.ReactNode
}

const slides: Slide[] = [
    {
        id: 1,
        title: "HCI Games Lab",
        subtitle: "An Interactive Educational Platform for Human-Computer Interaction",
        content: (
            <div className="slide-content-inner">
                <div className="slide-grid-2">
                    <div className="feature-box">
                        <h3 className="slide-subtitle" style={{ marginBottom: '1rem', color: '#22d3ee', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Brain size={24} /> Key Features</h3>
                        <ul className="feature-list">
                            <li>9 AI-powered experiments</li>
                            <li>Voice + Vision interaction modalities</li>
                            <li>Learn by experiencing real AI systems</li>
                        </ul>
                    </div>
                    <div className="feature-box" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        <h3 className="slide-subtitle" style={{ marginBottom: '1rem', fontSize: '1.2rem' }}>Live Demo</h3>
                        <code style={{ background: 'rgba(0,0,0,0.3)', padding: '0.5rem 1rem', borderRadius: '4px', color: '#22d3ee', fontFamily: 'monospace' }}>hci-games-lab-142479529330.us-central1.run.app</code>
                    </div>
                </div>
            </div>
        )
    },
    {
        id: 2,
        title: "The Problem & Solution",
        content: (
            <div className="slide-grid-2" style={{ height: '100%' }}>
                <div className="feature-box" style={{ borderColor: 'rgba(239, 68, 68, 0.3)', background: 'rgba(239, 68, 68, 0.05)' }}>
                    <h3 style={{ color: '#f87171', fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>Gap in Education</h3>
                    <ul className="feature-list">
                        <li>❌ Traditional courses = theory only</li>
                        <li>❌ No hands-on AI experience</li>
                        <li>❌ Students miss real limitations of speech/gesture AI</li>
                    </ul>
                </div>
                <div className="feature-box" style={{ borderColor: 'rgba(34, 197, 94, 0.3)', background: 'rgba(34, 197, 94, 0.05)' }}>
                    <h3 style={{ color: '#4ade80', fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>Our Solution: Interactive Lab</h3>
                    <ul className="feature-list">
                        <li>✅ Web-based platform (no installation)</li>
                        <li>✅ 9 experiments comparing inputs</li>
                        <li>✅ Real-time metrics: accuracy, latency</li>
                        <li>✅ Experience bias firsthand</li>
                    </ul>
                </div>
            </div>
        )
    },
    {
        id: 3,
        title: "Platform Features (9 Experiments)",
        content: (
            <div className="table-container">
                <table className="slide-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Experiment</th>
                            <th>Technology</th>
                            <th>Learning Goal</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr><td>1</td><td><strong>Speech vs Typing</strong></td><td>Google Speech API</td><td>Speed vs accuracy trade-offs</td></tr>
                        <tr><td>2</td><td><strong>Accent Effect</strong></td><td>Speech Recognition</td><td>Bias toward American English</td></tr>
                        <tr><td>3</td><td><strong>Background Noise</strong></td><td>Audio Processing</td><td>SNR impact on AI</td></tr>
                        <tr><td>4</td><td><strong>Multilingual</strong></td><td>Multi-language API</td><td>120+ language support</td></tr>
                        <tr><td>5</td><td><strong>Gesture Control</strong></td><td>MediaPipe Hands</td><td>Touchless interaction</td></tr>
                        <tr><td>6</td><td><strong>Pose Tracking</strong></td><td>MediaPipe Pose</td><td>Full body 33-landmark detection</td></tr>
                        <tr><td>7</td><td><strong>Facial Emotion</strong></td><td>Face Mesh + TF</td><td>Expression → mood mapping</td></tr>
                        <tr><td>8</td><td><strong>Voice Emotion</strong></td><td>Librosa + Scikit</td><td>Tone → emotion classification</td></tr>
                        <tr><td>9</td><td><strong>Gaze Tracking</strong></td><td>Dlib + OpenCV</td><td>Eye direction detection</td></tr>
                        <tr><td>10</td><td><strong>Face Filters</strong></td><td>TensorFlow + Canvas</td><td>Augmented Reality overlay</td></tr>
                    </tbody>
                </table>
            </div>
        )
    },
    {
        id: 4,
        title: "System Architecture",
        content: (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem' }}>
                <div className="arch-flow">
                    <div className="arch-box" style={{ borderColor: '#3b82f6' }}>
                        <Monitor size={48} color="#60a5fa" style={{ marginBottom: '0.5rem' }} />
                        <span style={{ fontWeight: 'bold' }}>Browser</span>
                        <span style={{ color: '#9ca3af', fontSize: '0.9rem' }}>React 18 + TS</span>
                    </div>
                    <div style={{ fontSize: '2rem', color: '#6b7280' }}>→</div>
                    <div className="arch-box" style={{ borderColor: '#22c55e' }}>
                        <Server size={48} color="#4ade80" style={{ marginBottom: '0.5rem' }} />
                        <span style={{ fontWeight: 'bold' }}>FastAPI</span>
                        <span style={{ color: '#9ca3af', fontSize: '0.9rem' }}>Python 3.9</span>
                    </div>
                    <div style={{ fontSize: '2rem', color: '#6b7280' }}>→</div>
                    <div className="arch-box" style={{ borderColor: '#a855f7' }}>
                        <Brain size={48} color="#c084fc" style={{ marginBottom: '0.5rem' }} />
                        <span style={{ fontWeight: 'bold' }}>AI Services</span>
                        <span style={{ color: '#9ca3af', fontSize: '0.9rem' }}>Google Cloud + Models</span>
                    </div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem 2rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', textAlign: 'center' }}>
                    <h4 style={{ marginTop: 0, marginBottom: '0.5rem', color: '#e5e7eb' }}>Hosted on Google Cloud Run</h4>
                    <p style={{ margin: 0, color: '#9ca3af' }}>Serverless Containers • Auto-scaling</p>
                </div>
            </div>
        )
    },
    {
        id: 5,
        title: "AI Workflow: Speech Pipeline",
        content: (
            <div>
                <div className="step-list">
                    <div className="step-item">
                        <div className="step-number">1</div>
                        <h4 style={{ marginTop: 0, color: '#22d3ee' }}>Capture</h4>
                        <p style={{ color: '#d1d5db' }}>Browser records audio (WebM format via MediaRecorder)</p>
                    </div>
                    <div className="step-item">
                        <div className="step-number">2</div>
                        <h4 style={{ marginTop: 0, color: '#22d3ee' }}>Convert</h4>
                        <p style={{ color: '#d1d5db' }}>FFmpeg transforms WebM → 16-bit PCM WAV on backend coverage</p>
                    </div>
                    <div className="step-item">
                        <div className="step-number">3</div>
                        <h4 style={{ marginTop: 0, color: '#22d3ee' }}>Transcribe</h4>
                        <p style={{ color: '#d1d5db' }}>Google Cloud Speech-to-Text API processes audio</p>
                    </div>
                    <div className="step-item">
                        <div className="step-number">4</div>
                        <h4 style={{ marginTop: 0, color: '#22d3ee' }}>Analyze</h4>
                        <p style={{ color: '#d1d5db' }}>BLEU Score calculates token overlap vs target sentence</p>
                    </div>
                </div>
                <div style={{ background: 'rgba(6, 182, 212, 0.1)', padding: '1rem', borderRadius: '0.5rem', border: '1px solid rgba(6, 182, 212, 0.3)', marginTop: '1rem' }}>
                    <p style={{ margin: 0 }}>Students see the hidden complexity behind "simple" voice interfaces.</p>
                </div>
            </div>
        )
    },
    {
        id: 6,
        title: "AI Workflow: Vision Pipeline",
        content: (
            <div className="slide-grid-2">
                <div className="feature-box">
                    <h4 style={{ color: '#f472b6', marginBottom: '1rem', marginTop: 0 }}>Process Flow</h4>
                    <ol style={{ paddingLeft: '1.2rem', color: '#d1d5db', lineHeight: '1.6' }}>
                        <li>Capture Webcam frame (getUserMedia)</li>
                        <li>Send Base64 image every 100ms</li>
                        <li>MediaPipe/Dlib detects landmarks</li>
                        <li>Custom logic maps landmarks → gestures</li>
                        <li>Draw skeleton overlay (OpenCV)</li>
                    </ol>
                </div>
                <div className="feature-box">
                    <h4 style={{ color: '#f472b6', marginBottom: '1rem', marginTop: 0 }}>Models Used</h4>
                    <ul className="feature-list">
                        <li>MediaPipe Hands (21 points)</li>
                        <li>MediaPipe Pose (33 points)</li>
                        <li>MediaPipe Face Mesh (468 points)</li>
                        <li>Dlib (68 points for Gaze)</li>
                        <li>Librosa + MLP (Voice Emotion)</li>
                        <li>TensorFlow Face Landmark (Filters)</li>
                    </ul>
                </div>
            </div>
        )
    },
    {
        id: 7,
        title: "Results & Metrics",
        content: (
            <div className="slide-grid-2">
                <div>
                    <h3 style={{ color: '#facc15', marginBottom: '1rem' }}>Speech Accuracy</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}>
                            <span>American English</span>
                            <span style={{ fontWeight: 'bold', color: '#4ade80' }}>94%</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}>
                            <span>British English</span>
                            <span style={{ fontWeight: 'bold', color: '#4ade80' }}>92%</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}>
                            <span>Indian English</span>
                            <span style={{ fontWeight: 'bold', color: '#facc15' }}>78%</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}>
                            <span>Noisy Environment</span>
                            <span style={{ fontWeight: 'bold', color: '#f87171' }}>40-65%</span>
                        </div>
                    </div>
                </div>

                <div>
                    <h3 style={{ color: '#facc15', marginBottom: '1rem' }}>Vision Performance</h3>
                    <div className="feature-box">
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', paddingBottom: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                            <span style={{ color: '#9ca3af' }}>Feature</span>
                            <span style={{ color: '#9ca3af' }}>Latency</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <span>Gesture</span>
                            <span style={{ fontFamily: 'monospace', color: '#22d3ee' }}>~50ms</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <span>Pose</span>
                            <span style={{ fontFamily: 'monospace', color: '#22d3ee' }}>~80ms</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Gaze</span>
                            <span style={{ fontFamily: 'monospace', color: '#22d3ee' }}>~100ms</span>
                        </div>
                    </div>
                    <p style={{ fontStyle: 'italic', color: '#9ca3af', borderLeft: '2px solid #facc15', paddingLeft: '0.75rem', marginTop: '1rem' }}>
                        "AI performs well in ideal conditions but degrades significantly with noise & poor lighting."
                    </p>
                </div>
            </div>
        )
    },
    {
        id: 8,
        title: "Risks: Privacy & Data",
        content: (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div className="feature-box" style={{ borderColor: 'rgba(239, 68, 68, 0.3)', background: 'rgba(239, 68, 68, 0.05)', display: 'flex', gap: '1rem' }}>
                    <Shield color="#f87171" size={24} style={{ marginTop: '4px' }} />
                    <div>
                        <h3 style={{ fontWeight: 'bold', color: '#f87171', fontSize: '1.2rem', marginTop: 0 }}>Privacy Concerns</h3>
                        <ul className="feature-list" style={{ marginTop: '0.5rem' }}>
                            <li>Voice = biometric identifier</li>
                            <li>Facial video = identity capture</li>
                            <li>Gaze patterns = attention surveillance</li>
                        </ul>
                    </div>
                </div>

                <div className="feature-box" style={{ borderColor: 'rgba(34, 197, 94, 0.3)', background: 'rgba(34, 197, 94, 0.05)', display: 'flex', gap: '1rem' }}>
                    <Shield color="#4ade80" size={24} style={{ marginTop: '4px' }} />
                    <div>
                        <h3 style={{ fontWeight: 'bold', color: '#4ade80', fontSize: '1.2rem', marginTop: 0 }}>Our Mitigations</h3>
                        <ul className="feature-list" style={{ marginTop: '0.5rem' }}>
                            <li>✅ No audio/video stored (in-memory only)</li>
                            <li>✅ No persistent user accounts</li>
                            <li>✅ HTTPS encryption everywhere</li>
                            <li>✅ Open source code</li>
                        </ul>
                    </div>
                </div>
            </div>
        )
    },
    {
        id: 9,
        title: "Risks: Bias & Exclusion",
        subtitle: "AI is not neutral",
        content: (
            <div>
                <div className="feature-box" style={{ marginBottom: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <AlertTriangle color="#fb923c" /> Documented Biases
                    </h3>
                    <ul className="feature-list">
                        <li><span style={{ color: '#f87171' }}>•</span> Speech models favor American English (94%) vs Accents (78%)</li>
                        <li><span style={{ color: '#f87171' }}>•</span> Facial emotion AI struggles with darker skin tones</li>
                        <li><span style={{ color: '#f87171' }}>•</span> Gesture recognition assumes 2 visible hands</li>
                    </ul>
                </div>

                <div style={{ background: 'rgba(30, 58, 138, 0.2)', padding: '1rem 1.5rem', borderRadius: '0.5rem', borderLeft: '4px solid #3b82f6' }}>
                    <h4 style={{ fontWeight: 'bold', color: '#93c5fd', margin: 0, marginBottom: '0.25rem' }}>HCI Design Principle</h4>
                    <p style={{ fontSize: '1.1rem', color: 'white', margin: 0 }}>"No single modality is universally accessible → Always offer MULTIPLE input methods."</p>
                </div>
            </div>
        )
    },
    {
        id: 10,
        title: "Conclusion & Takeaways",
        content: (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
                <div className="slide-grid-2">
                    <div>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#c084fc', marginBottom: '1rem' }}>What We Learned</h3>
                        <ol style={{ paddingLeft: '1.2rem', lineHeight: '1.8', color: '#d1d5db' }}>
                            <li>Modern AI is powerful but <span style={{ color: '#f87171', fontWeight: 'bold' }}>imperfect</span></li>
                            <li>Bias exists - measure and disclose it</li>
                            <li>Privacy requires consent by design</li>
                            <li>Accessibility requires variety</li>
                        </ol>
                    </div>
                    <div>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#4ade80', marginBottom: '1rem' }}>Recommendations</h3>
                        <ul className="feature-list">
                            <li>✅ Test with diverse users</li>
                            <li>✅ Show "Processing" states</li>
                            <li>✅ Provide fallbacks (typing)</li>
                            <li>✅ Explicit consent for biometrics</li>
                        </ul>
                    </div>
                </div>

                <div style={{ textAlign: 'center', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                    <p style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>Try It Now</p>
                    <a href="#" style={{ color: '#22d3ee', fontSize: '1.2rem', textDecoration: 'none' }}>hci-games-lab-142479529330.us-central1.run.app</a>
                </div>
            </div>
        )
    }
]

interface PresentationSlidesProps {
    onClose: () => void
}

export default function PresentationSlides({ onClose }: PresentationSlidesProps) {
    const [currentSlide, setCurrentSlide] = useState(0)

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowRight' || e.key === 'Space') {
                setCurrentSlide(prev => Math.min(prev + 1, slides.length - 1))
            } else if (e.key === 'ArrowLeft') {
                setCurrentSlide(prev => Math.max(prev - 1, 0))
            } else if (e.key === 'Escape') {
                onClose()
            }
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [onClose])

    const slide = slides[currentSlide]

    return (
        <div className="presentation-overlay">

            {/* Header controls */}
            <div className="presentation-controls">
                <span className="keyboard-hint">Use ← → arrow keys</span>
                <button
                    onClick={onClose}
                    className="close-button"
                    title="Close Presentation"
                >
                    <X size={24} />
                </button>
            </div>

            {/* Slide Container */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentSlide}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="slide-container"
                >
                    <div className="slide-content-wrapper">
                        {/* Slide Header */}
                        <div className="slide-header">
                            <div className="slide-counter">
                                Slide {currentSlide + 1} / {slides.length}
                            </div>
                            <h2 className="slide-title">{slide.title}</h2>
                            {slide.subtitle && (
                                <p className="slide-subtitle">{slide.subtitle}</p>
                            )}
                        </div>

                        {/* Slide Content */}
                        <div className="slide-body">
                            {slide.content}
                        </div>
                    </div>

                    {/* Navigation Bar */}
                    <div className="presentation-nav">
                        <button
                            onClick={() => setCurrentSlide(prev => Math.max(prev - 1, 0))}
                            disabled={currentSlide === 0}
                            className="nav-button prev"
                        >
                            <ChevronLeft size={20} /> Previous
                        </button>

                        {/* Progress Dots */}
                        <div className="progress-dots">
                            {slides.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setCurrentSlide(idx)}
                                    className={`dot ${idx === currentSlide ? 'active' : ''}`}
                                    title={`Go to slide ${idx + 1}`}
                                />
                            ))}
                        </div>

                        <button
                            onClick={() => setCurrentSlide(prev => Math.min(prev + 1, slides.length - 1))}
                            disabled={currentSlide === slides.length - 1}
                            className="nav-button next"
                        >
                            Next <ChevronRight size={20} />
                        </button>
                    </div>

                </motion.div>
            </AnimatePresence>
        </div>
    )
}
