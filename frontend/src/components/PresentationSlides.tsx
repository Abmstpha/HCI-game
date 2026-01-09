import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight, Monitor, Server, Brain, Shield, AlertTriangle, Lightbulb, Zap, Users } from 'lucide-react'
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
        subtitle: "Bridging the Gap Between Theory and Reality in AI",
        content: (
            <div className="slide-content-inner">
                <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
                    <p style={{ fontSize: '1.25rem', color: '#4b5563', maxWidth: '800px', margin: '0 auto' }}>
                        Welcome to a hands-on educational platform designed to demonstrate the <strong>capabilities</strong>, <strong>limitations</strong>, and <strong>biases</strong> of modern Human-Computer Interaction systems.
                    </p>
                </div>
                <div className="slide-grid-2">
                    <div className="feature-box">
                        <h3 className="slide-subtitle" style={{ marginBottom: '1rem', color: '#0891b2', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                            <Brain size={24} /> The Concept
                        </h3>
                        <p style={{ marginBottom: '1rem', lineHeight: '1.6' }}>
                            Students often learn AI concepts in a vacuum. This platform forces them to interact with real models (Speech, Vision, Emotion) in real-time, revealing how these systems <em>actually</em> behave in the wild.
                        </p>
                        <ul className="feature-list">
                            <li>🎯 <strong>10 Experiments</strong> covering Voice & Vision</li>
                            <li>⚡ <strong>Real-time Feedback</strong> on latency & accuracy</li>
                            <li>🔍 <strong>Transparency</strong> into the "Black Box" of AI</li>
                        </ul>
                    </div>
                    <div className="feature-box" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f0f9ff', border: '1px solid #bae6fd' }}>
                        <h3 className="slide-subtitle" style={{ marginBottom: '1rem', fontSize: '1.2rem', color: '#0369a1' }}>Live Demo Available</h3>
                        <div style={{ background: 'white', padding: '1rem', borderRadius: '8px', border: '1px solid #e0f2fe', width: '100%', textAlign: 'center' }}>
                            <a href="https://hci-games-lab-142479529330.us-central1.run.app" target="_blank" rel="noreferrer" style={{ color: '#0284c7', textDecoration: 'none', fontWeight: 'bold', fontSize: '1.1rem' }}>
                                hci-games-lab...run.app ↗
                            </a>
                        </div>
                        <p style={{ fontSize: '0.9rem', color: '#64748b', marginTop: '1rem' }}>No installation required • Works in Browser</p>
                    </div>
                </div>
            </div>
        )
    },
    {
        id: 2,
        title: "The Challenge: Why This Exists",
        content: (
            <div className="slide-grid-2" style={{ height: '100%' }}>
                <div className="feature-box" style={{ borderColor: '#fca5a5', background: '#fef2f2' }}>
                    <h3 style={{ color: '#dc2626', fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <AlertTriangle size={24} /> The Problem
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div>
                            <h4 style={{ margin: 0, color: '#991b1b', fontWeight: 600 }}>Theory vs. Practice Gap</h4>
                            <p style={{ margin: '0.5rem 0 0', color: '#7f1d1d' }}>Textbooks explain "Word Error Rate" math, but don't show what it FEELS like when an accent causes a system to fail repeatedly.</p>
                        </div>
                        <div>
                            <h4 style={{ margin: 0, color: '#991b1b', fontWeight: 600 }}>Invisible Biases</h4>
                            <p style={{ margin: '0.5rem 0 0', color: '#7f1d1d' }}>Developers often assume "it works on my machine" means "it works for everyone." Without diverse testing, exclusion is built-in.</p>
                        </div>
                    </div>
                </div>
                <div className="feature-box" style={{ borderColor: '#86efac', background: '#f0fdf4' }}>
                    <h3 style={{ color: '#16a34a', fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Lightbulb size={24} /> Our Solution
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div>
                            <h4 style={{ margin: 0, color: '#14532d', fontWeight: 600 }}>Gamified Learning</h4>
                            <p style={{ margin: '0.5rem 0 0', color: '#166534' }}>By turning tests into "games" (e.g., Speech vs Typing race), users engage deeply with the trade-offs of each modality.</p>
                        </div>
                        <div>
                            <h4 style={{ margin: 0, color: '#14532d', fontWeight: 600 }}>Instant Visualization</h4>
                            <p style={{ margin: '0.5rem 0 0', color: '#166534' }}>We don't just show a number; we visually map face landmarks and confidence scores so users <em>see</em> what the computer sees.</p>
                        </div>
                    </div>
                </div>
            </div>
        )
    },
    {
        id: 3,
        title: "Platform Overview (10 Experiments)",
        content: (
            <div className="table-container">
                <table className="slide-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Experiment</th>
                            <th>Core Technology</th>
                            <th>Educational Goal</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr><td>1</td><td><strong>Speech vs Typing</strong></td><td>Google Speech API</td><td>Understand input efficiency & trade-offs</td></tr>
                        <tr><td>2</td><td><strong>Accent Effect</strong></td><td>Speech Recognition</td><td>Whose voice is "standard"? Bias audit</td></tr>
                        <tr><td>3</td><td><strong>Background Noise</strong></td><td>Audio Processing</td><td>Impact of environmental constraints</td></tr>
                        <tr><td>4</td><td><strong>Multilingual</strong></td><td>Multi-language API</td><td>Global accessibility challenges</td></tr>
                        <tr><td>5</td><td><strong>Gesture Control</strong></td><td>MediaPipe Hands</td><td>Designing touchless interfaces</td></tr>
                        <tr><td>6</td><td><strong>Pose Tracking</strong></td><td>MediaPipe Pose</td><td>Full-body interaction limits</td></tr>
                        <tr><td>7</td><td><strong>Facial Emotion</strong></td><td>Face Mesh + TF</td><td>Affective computing & ambiguity</td></tr>
                        <tr><td>8</td><td><strong>Voice Emotion</strong></td><td>Librosa + Scikit</td><td>Tone analysis beyond words</td></tr>
                        <tr><td>9</td><td><strong>Gaze Tracking</strong></td><td>Dlib + OpenCV</td><td>Attention as an input stream</td></tr>
                        <tr><td>10</td><td><strong>Face Filters</strong></td><td>TensorFlow + Canvas</td><td>Augmented Reality fundamentals</td></tr>
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
                <p style={{ textAlign: 'center', color: '#4b5563', maxWidth: '700px' }}>
                    A hybrid architecture leveraging the best of client-side speed (React) and server-side power (Python/Cloud).
                </p>
                <div className="arch-flow">
                    <div className="arch-box" style={{ borderColor: '#3b82f6' }}>
                        <Monitor size={48} color="#3b82f6" style={{ marginBottom: '0.5rem' }} />
                        <span style={{ fontWeight: 'bold', color: '#1e3a8a' }}>Frontend (Browser)</span>
                        <span style={{ color: '#4b5563', fontSize: '0.9rem' }}>React 18 + TypeScript</span>
                        <span style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '0.25rem' }}>MediaRecorder, Canvas</span>
                    </div>
                    <div style={{ fontSize: '2rem', color: '#9ca3af' }}>→</div>
                    <div className="arch-box" style={{ borderColor: '#22c55e' }}>
                        <Server size={48} color="#22c55e" style={{ marginBottom: '0.5rem' }} />
                        <span style={{ fontWeight: 'bold', color: '#14532d' }}>Backend API</span>
                        <span style={{ color: '#4b5563', fontSize: '0.9rem' }}>FastAPI (Python)</span>
                        <span style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '0.25rem' }}>Audio Conversion, Logic</span>
                    </div>
                    <div style={{ fontSize: '2rem', color: '#9ca3af' }}>→</div>
                    <div className="arch-box" style={{ borderColor: '#a855f7' }}>
                        <Brain size={48} color="#a855f7" style={{ marginBottom: '0.5rem' }} />
                        <span style={{ fontWeight: 'bold', color: '#581c87' }}>AI Services</span>
                        <span style={{ color: '#4b5563', fontSize: '0.9rem' }}>Google Cloud + Models</span>
                        <span style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '0.25rem' }}>STT, MediaPipe, TF</span>
                    </div>
                </div>
                <div style={{ background: '#f8fafc', padding: '1rem 2rem', borderRadius: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                    <h4 style={{ marginTop: 0, marginBottom: '0.5rem', color: '#334155' }}>Infrastructure: Google Cloud Run</h4>
                    <p style={{ margin: 0, color: '#64748b' }}>Stateless Containers • Automatic Scaling • HTTPS Security</p>
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
                        <h4 style={{ marginTop: 0, color: '#0891b2' }}>Capture & Encode</h4>
                        <p style={{ color: '#374151' }}>Browser records audio chunks using <code>MediaRecorder</code> API (WebM/Opus) to ensure low bandwidth usage.</p>
                    </div>
                    <div className="step-item">
                        <div className="step-number">2</div>
                        <h4 style={{ marginTop: 0, color: '#0891b2' }}>Transcode (Server)</h4>
                        <p style={{ color: '#374151' }}>FastAPI receives the blob, uses <strong>FFmpeg</strong> to convert WebM → 16-bit PCM WAV (required by most models).</p>
                    </div>
                    <div className="step-item">
                        <div className="step-number">3</div>
                        <h4 style={{ marginTop: 0, color: '#0891b2' }}>Inference</h4>
                        <p style={{ color: '#374151' }}>Audio is sent to Google Speech-to-Text V2. Emotion analysis runs locally using Librosa features + MLP Classifier.</p>
                    </div>
                    <div className="step-item">
                        <div className="step-number">4</div>
                        <h4 style={{ marginTop: 0, color: '#0891b2' }}>Analysis</h4>
                        <p style={{ color: '#374151' }}>We calculate WER (Word Error Rate) & BLEU score to objectively measure transcription accuracy.</p>
                    </div>
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
                    <h4 style={{ color: '#db2777', marginBottom: '1rem', marginTop: 0 }}>Input Stream</h4>
                    <ol style={{ paddingLeft: '1.2rem', color: '#374151', lineHeight: '1.6' }}>
                        <li><strong>Capture</strong>: Webcam feed accessed via <code>navigator.mediaDevices</code>.</li>
                        <li><strong>Sampling</strong>: Frames extracted every 100ms (10 FPS) to balance load.</li>
                        <li><strong>Transmission</strong>: Base64 encoded frames sent to backend (or processed client-side).</li>
                    </ol>
                </div>
                <div className="feature-box">
                    <h4 style={{ color: '#db2777', marginBottom: '1rem', marginTop: 0 }}>Model Stack</h4>
                    <ul className="feature-list">
                        <li>🖐️ <strong>Hands</strong>: MediaPipe Hands (21 3D landmarks)</li>
                        <li>💃 <strong>Body</strong>: MediaPipe Pose (33 landmarks)</li>
                        <li>😐 <strong>Face</strong>: MediaPipe Face Mesh (468 landmarks)</li>
                        <li>👀 <strong>Gaze</strong>: Dlib (68 points) + OpenCV Logic</li>
                        <li>🎭 <strong>Filters</strong>: Custom Canvas rendering on landmarks</li>
                    </ul>
                </div>
            </div>
        )
    },
    {
        id: 7,
        title: "Key Findings & Results",
        content: (
            <div className="slide-grid-2">
                <div>
                    <h3 style={{ color: '#b45309', marginBottom: '1rem' }}>Speech Accuracy Realities</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: 'white', border: '1px solid #e5e7eb', borderRadius: '4px' }}>
                            <span>Standard American English</span>
                            <span style={{ fontWeight: 'bold', color: '#16a34a' }}>~95%</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: 'white', border: '1px solid #e5e7eb', borderRadius: '4px' }}>
                            <span>Non-Native Accents</span>
                            <span style={{ fontWeight: 'bold', color: '#ca8a04' }}>~75-80%</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: 'white', border: '1px solid #e5e7eb', borderRadius: '4px' }}>
                            <span>Noisy Environments (Café)</span>
                            <span style={{ fontWeight: 'bold', color: '#dc2626' }}>~45-60%</span>
                        </div>
                    </div>
                </div>

                <div>
                    <h3 style={{ color: '#b45309', marginBottom: '1rem' }}>Vision Latency</h3>
                    <div className="feature-box">
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', paddingBottom: '0.5rem', borderBottom: '1px solid #e5e7eb' }}>
                            <span style={{ color: '#6b7280' }}>Feature</span>
                            <span style={{ color: '#6b7280' }}>Responsiveness</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <span>Gesture (Hand)</span>
                            <span style={{ fontFamily: 'monospace', color: '#0891b2' }}>&lt; 50ms</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <span>Full Body Pose</span>
                            <span style={{ fontFamily: 'monospace', color: '#0891b2' }}>~80ms</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Gaze Tracking</span>
                            <span style={{ fontFamily: 'monospace', color: '#0891b2' }}>~120ms</span>
                        </div>
                    </div>
                    <p style={{ fontStyle: 'italic', color: '#6b7280', borderLeft: '3px solid #facc15', paddingLeft: '1rem', marginTop: '1rem', background: '#fffbeb', padding: '0.75rem' }}>
                        "Latency above 100ms breaks the illusion of direct manipulation."
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
                <div className="feature-box" style={{ borderColor: '#fca5a5', background: '#fef2f2', display: 'flex', gap: '1rem' }}>
                    <Shield color="#ef4444" size={24} style={{ marginTop: '4px' }} />
                    <div>
                        <h3 style={{ fontWeight: 'bold', color: '#991b1b', fontSize: '1.2rem', marginTop: 0 }}>Privacy Concerns</h3>
                        <p style={{ color: '#7f1d1d', margin: '0.5rem 0 1rem' }}>
                            Biometric data (voice prints, gait, face scan) is immutable. Once stolen, it cannot be "reset" like a password.
                        </p>
                        <ul className="feature-list" style={{ marginTop: '0.5rem' }}>
                            <li>🛑 Voice = biometric identifier</li>
                            <li>🛑 Gaze patterns = subconscious intent surveillance</li>
                        </ul>
                    </div>
                </div>

                <div className="feature-box" style={{ borderColor: '#86efac', background: '#f0fdf4', display: 'flex', gap: '1rem' }}>
                    <Shield color="#22c55e" size={24} style={{ marginTop: '4px' }} />
                    <div>
                        <h3 style={{ fontWeight: 'bold', color: '#166534', fontSize: '1.2rem', marginTop: 0 }}>Lab Mitigations</h3>
                        <ul className="feature-list" style={{ marginTop: '0.5rem' }}>
                            <li>✅ <strong>Ephemeral Processing</strong>: Audio/Video is processed in RAM and discarded immediately.</li>
                            <li>✅ <strong>No Storage</strong>: We do not save user data to any database.</li>
                            <li>✅ <strong>Client-Side First</strong>: Where possible (e.g. some vision tasks), data never leaves the browser.</li>
                        </ul>
                    </div>
                </div>
            </div>
        )
    },
    {
        id: 9,
        title: "Ethical Implications: Bias",
        subtitle: "Technology is not neutral",
        content: (
            <div>
                <div className="feature-box" style={{ marginBottom: '1.5rem', background: 'white' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#b45309' }}>
                        <AlertTriangle color="#f59e0b" /> Observed Biases
                    </h3>
                    <p style={{ marginBottom: '1rem', color: '#4b5563' }}>Through these experiments, we consistently observe that off-the-shelf models fail for marginalized groups:</p>
                    <ul className="feature-list">
                        <li><span style={{ color: '#ef4444' }}>•</span> <strong>Accent Bias</strong>: Systems optimized for "Broadcast English" fail speakers with regional accents.</li>
                        <li><span style={{ color: '#ef4444' }}>•</span> <strong>Racial Bias</strong>: Facial recognition often struggles with lighting and contrast on darker skin tones.</li>
                        <li><span style={{ color: '#ef4444' }}>•</span> <strong>Ableism</strong>: Gesture interfaces assume distinct hands and standard range of motion.</li>
                    </ul>
                </div>

                <div style={{ background: '#eff6ff', padding: '1.5rem', borderRadius: '0.5rem', borderLeft: '5px solid #3b82f6' }}>
                    <h4 style={{ fontWeight: 'bold', color: '#1e40af', margin: 0, marginBottom: '0.5rem' }}>HCI Design Principle</h4>
                    <p style={{ fontSize: '1.1rem', color: '#1e3a8a', margin: 0, fontStyle: 'italic' }}>
                        "No single modality is universally accessible. Designers MUST provide redundant/alternative methods (Multimodality) to ensure inclusion."
                    </p>
                </div>
            </div>
        )
    },
    {
        id: 10,
        title: "Conclusion & Future",
        content: (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
                <div className="slide-grid-2">
                    <div>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#7c3aed', marginBottom: '1rem' }}>Key Takeaways</h3>
                        <ol style={{ paddingLeft: '1.2rem', lineHeight: '1.8', color: '#374151' }}>
                            <li>AI is a <strong>probabilistic</strong> tool, not a magic wand.</li>
                            <li>Systems must handle <strong>failure</strong> gracefully (fallbacks).</li>
                            <li><strong>Context</strong> matters (noise, lighting, user state).</li>
                            <li><strong>Responsibility</strong> lies with the designer, not the user.</li>
                        </ol>
                    </div>
                    <div>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#059669', marginBottom: '1rem' }}>Next Steps</h3>
                        <ul className="feature-list">
                            <li>🚀 Explore the <strong style={{ color: '#059669' }}>Face Filters</strong> experiment.</li>
                            <li>🗣️ Test the <strong style={{ color: '#059669' }}>Multilingual</strong> capabilities.</li>
                            <li>🔨 <strong>Build</strong> your own ethical AI interfaces.</li>
                        </ul>
                    </div>
                </div>

                <div style={{ textAlign: 'center', paddingTop: '2rem', borderTop: '1px solid #e5e7eb' }}>
                    <p style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', color: '#111827' }}>Experience It Yourself</p>
                    <a
                        href="https://hci-games-lab-142479529330.us-central1.run.app"
                        target="_blank"
                        rel="noreferrer"
                        style={{
                            display: 'inline-block',
                            background: '#0891b2',
                            color: 'white',
                            padding: '1rem 2rem',
                            borderRadius: '9999px',
                            textDecoration: 'none',
                            fontWeight: 'bold',
                            fontSize: '1.2rem',
                            boxShadow: '0 4px 6px -1px rgba(8, 145, 178, 0.4)'
                        }}
                    >
                        Launch Lab 🚀
                    </a>
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
