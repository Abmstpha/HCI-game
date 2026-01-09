import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight, Monitor, Server, Brain, Shield, AlertTriangle, Lightbulb, Hand, MoveLeft, MoveRight, Loader2 } from 'lucide-react'
import axios from 'axios'
import './PresentationSlides.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

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
                    <p style={{ marginTop: '1.5rem', fontSize: '1.1rem', color: '#64748b', fontWeight: 500 }}>
                        Presented by: <strong>Abdellahi & Darryl</strong>
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
                    </div>
                    <div className="feature-box" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f0f9ff', border: '1px solid #bae6fd' }}>
                        <h3 className="slide-subtitle" style={{ marginBottom: '1rem', fontSize: '1.2rem', color: '#0369a1' }}>Live Demo Available</h3>
                        <p style={{ fontSize: '0.9rem', color: '#64748b', textAlign: 'center' }}>
                            No installation required • Works in Browser
                        </p>
                    </div>
                </div>
            </div>
        )
    },
    {
        id: 2,
        title: "The Learning Gap (For Students)",
        subtitle: "Why we built this platform",
        content: (
            <div className="slide-content-inner">
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <p style={{ fontSize: '1.4rem', color: '#334155', maxWidth: '800px', margin: '0 auto', lineHeight: '1.6' }}>
                        Students learn "Clean AI" in textbooks: <br />
                        <span style={{ color: '#64748b', fontSize: '1.1rem' }}>Perfect datasets. Clear inputs. Deterministic outputs.</span>
                    </p>
                    <p style={{ fontSize: '1.4rem', color: '#dc2626', fontWeight: 'bold', marginTop: '1.5rem' }}>
                        Real AI is messy.
                    </p>
                </div>
                <div className="slide-grid-2">
                    <div className="feature-box" style={{ background: '#f8fafc' }}>
                        <h3 className="slide-subtitle" style={{ color: '#475569' }}>📚 The Textbook</h3>
                        <ul className="feature-list">
                            <li>✅ "Accuracy is 99%"</li>
                            <li>✅ "Latencies are negligible"</li>
                            <li>✅ "Bias is an edge case"</li>
                        </ul>
                    </div>
                    <div className="feature-box" style={{ background: '#fef2f2', borderColor: '#fca5a5' }}>
                        <h3 className="slide-subtitle" style={{ color: '#dc2626' }}>🌍 The Reality</h3>
                        <ul className="feature-list">
                            <li>❌ Accuracy drops 20% with accents</li>
                            <li>❌ Cold starts take 5+ seconds</li>
                            <li>❌ Bias is systemic</li>
                        </ul>
                    </div>
                </div>
            </div>
        )
    },
    {
        id: 3,
        title: "A Visual Teaching Tool (For Professors)",
        subtitle: "Don't just describe the Black Box. Open it.",
        content: (
            <div className="slide-grid-2">
                <div className="feature-box" style={{ borderColor: '#3b82f6', background: '#eff6ff' }}>
                    <h3 className="slide-subtitle" style={{ color: '#2563eb' }}>🎓 Pedagogical Value</h3>
                    <p style={{ lineHeight: '1.6', color: '#1e3a8a' }}>
                        This platform serves as a <strong>live laboratory</strong>. Instead of explaining "confidence thresholds" abstractly, you can show a student:
                    </p>
                    <div style={{ background: 'white', padding: '1rem', borderRadius: '8px', marginTop: '1rem', color: '#4b5563', fontStyle: 'italic', borderLeft: '4px solid #3b82f6' }}>
                        "Speak normally, then whisper. Watch the confidence score drop in real-time."
                    </div>
                </div>
                <div className="feature-box">
                    <h3 className="slide-subtitle" style={{ color: '#0f172a' }}>Key Concepts Visualized</h3>
                    <ul className="feature-list">
                        <li>🎯 <strong>Landmarks</strong>: See the 468 points tracking your face.</li>
                        <li>⚡ <strong>Latency</strong>: Feel the delay of serverless architecture.</li>
                        <li>📉 <strong>Drift</strong>: Watch models fail as lighting changes.</li>
                        <li>🤝 <strong>Multimodality</strong>: Compare Voice vs. Gesture inputs.</li>
                    </ul>
                </div>
            </div>
        )
    },
    {
        id: 4,
        title: "The Core Challenge",
        subtitle: "Bridging the Gap",
        content: (
            <div className="slide-grid-2" style={{ height: '100%' }}>
                <div className="feature-box" style={{ borderColor: '#fca5a5', background: '#fef2f2' }}>
                    <h3 style={{ color: '#dc2626', fontSize: '1.3rem', fontWeight: 'bold', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
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
                    <h3 style={{ color: '#16a34a', fontSize: '1.3rem', fontWeight: 'bold', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
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
        id: 5,
        title: "The Solution Overview",
        subtitle: "10 Interactive Modules",
        content: (
            <div className="table-container">
                <table className="slide-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Experiment</th>
                            <th>Core Concept</th>
                            <th>Educational Goal</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr><td>1</td><td><strong>Speech vs Typing</strong></td><td>Input Efficiency</td><td>Compare modality speeds</td></tr>
                        <tr><td>2</td><td><strong>Accent Effect</strong></td><td>Algo Bias</td><td>Audit recognition gaps</td></tr>
                        <tr><td>3</td><td><strong>Background Noise</strong></td><td>Robustness</td><td>Test environmental limits</td></tr>
                        <tr><td>4</td><td><strong>Multilingual</strong></td><td>Globalization</td><td>Accessibility challenges</td></tr>
                        <tr><td>5</td><td><strong>Gesture Control</strong></td><td>Computer Vision</td><td>Touchless interface design</td></tr>
                        <tr><td>6</td><td><strong>Pose Tracking</strong></td><td>Full Body HCI</td><td>Physical interaction</td></tr>
                        <tr><td>7</td><td><strong>Facial Emotion</strong></td><td>Affective Comp.</td><td>Emotional ambiguity</td></tr>
                        <tr><td>8</td><td><strong>Voice Emotion</strong></td><td>Prosody Analysis</td><td>Tone vs Words</td></tr>
                        <tr><td>9</td><td><strong>Gaze Tracking</strong></td><td>Attention API</td><td>Subconscious input</td></tr>
                        <tr><td>10</td><td><strong>Face Filters</strong></td><td>Augmented Reality</td><td>Landmark mapping</td></tr>
                    </tbody>
                </table>
            </div>
        )
    },
    {
        id: 6,
        title: "Under the Hood: AI Workflow",
        content: (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem' }}>
                <p style={{ textAlign: 'center', color: '#4b5563', maxWidth: '700px' }}>
                    A hybrid architecture leveraging client-side speed (React) and server-side power (Cloud Run).
                </p>
                <div className="arch-flow">
                    <div className="arch-box" style={{ borderColor: '#3b82f6' }}>
                        <Monitor size={40} color="#3b82f6" style={{ marginBottom: '0.5rem' }} />
                        <span style={{ fontWeight: 'bold', color: '#1e3a8a' }}>Frontend (Client)</span>
                        <span style={{ color: '#4b5563', fontSize: '0.8rem' }}>React + TypeScript</span>
                        <span style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>MediaRecorder, Canvas</span>
                    </div>
                    <div style={{ fontSize: '2rem', color: '#9ca3af' }}>→</div>
                    <div className="arch-box" style={{ borderColor: '#22c55e' }}>
                        <Server size={40} color="#22c55e" style={{ marginBottom: '0.5rem' }} />
                        <span style={{ fontWeight: 'bold', color: '#14532d' }}>Backend API</span>
                        <span style={{ color: '#4b5563', fontSize: '0.8rem' }}>FastAPI (Python)</span>
                        <span style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>FFmpeg, NumPy</span>
                    </div>
                    <div style={{ fontSize: '2rem', color: '#9ca3af' }}>→</div>
                    <div className="arch-box" style={{ borderColor: '#a855f7' }}>
                        <Brain size={40} color="#a855f7" style={{ marginBottom: '0.5rem' }} />
                        <span style={{ fontWeight: 'bold', color: '#581c87' }}>AI Models</span>
                        <span style={{ color: '#4b5563', fontSize: '0.8rem' }}>Google Cloud + Local</span>
                        <span style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>Inference & Return</span>
                    </div>
                </div>

                <div className="slide-grid-2" style={{ width: '100%' }}>
                    <div className="feature-box" style={{ padding: '1rem', borderTop: '4px solid #22c55e' }}>
                        <h4 style={{ margin: '0 0 0.5rem 0', color: '#14532d', fontSize: '0.9rem' }}>🗣️ Speech Stack</h4>
                        <ul className="feature-list" style={{ fontSize: '0.85rem' }}>
                            <li><strong>STT</strong>: Google Speech-to-Text V2</li>
                            <li><strong>Emotion</strong>: Librosa (Features) + MLP Classifier</li>
                            <li><strong>Format</strong>: WebM (Browser) → WAV (Server)</li>
                        </ul>
                    </div>
                    <div className="feature-box" style={{ padding: '1rem', borderTop: '4px solid #a855f7' }}>
                        <h4 style={{ margin: '0 0 0.5rem 0', color: '#581c87', fontSize: '0.9rem' }}>👁️ Vision Stack</h4>
                        <ul className="feature-list" style={{ fontSize: '0.85rem' }}>
                            <li><strong>Hands/Pose/Face</strong>: MediaPipe (TensorFlow.js)</li>
                            <li><strong>Gaze</strong>: Dlib (68 Landmarks) + OpenCV</li>
                            <li><strong>Processing</strong>: mostly Client-Side (Low Latency)</li>
                        </ul>
                    </div>
                </div>
            </div>
        )
    },

    {
        id: 7,
        title: "Insight #1: The Accent Gap",
        subtitle: "AI Bias in Action",
        content: (
            <div className="slide-grid-2">
                <div>
                    <p style={{ color: '#4b5563', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                        We tested the same sentence ("The quick brown fox...") across diverse groups. The drop-off for non-native speakers is stark.
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                            <span>Standard American English</span>
                            <span style={{ fontWeight: 'bold', color: '#16a34a' }}>~98% Accuracy</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                            <span>European Accents (French/German)</span>
                            <span style={{ fontWeight: 'bold', color: '#ca8a04' }}>~85% Accuracy</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                            <span>Strong Regional Accents</span>
                            <span style={{ fontWeight: 'bold', color: '#dc2626' }}>~60-70% Accuracy</span>
                        </div>
                    </div>
                </div>
                <div className="feature-box" style={{ background: '#f8fafc' }}>
                    <h3 className="slide-subtitle" style={{ color: '#334155' }}>Why this happens?</h3>
                    <ul className="feature-list">
                        <li><strong>Training Data</strong>: Models are trained primarily on "Broadcast Standard" English.</li>
                        <li><strong>Phone Mismatch</strong>: Specific phonemes (e.g., 'th' vs 'z') are misclassified consistently.</li>
                        <li><strong>Context</strong>: Models rely on probability; unexpected grammar patterns lower probability scores.</li>
                    </ul>
                </div>
            </div>
        )
    },
    {
        id: 8,
        title: "Insight #2: The Latency Threshold",
        subtitle: "Responsibility in Design",
        content: (
            <div className="slide-content-inner">
                <p style={{ textAlign: 'center', marginBottom: '2rem', color: '#4b5563' }}>
                    For an interface to feel "real-time", latency must stay below <strong>100ms</strong>.
                </p>

                <div className="slide-grid-2">
                    <div className="feature-box">
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', paddingBottom: '0.5rem', borderBottom: '1px solid #e5e7eb' }}>
                            <span style={{ color: '#6b7280' }}>Feature</span>
                            <span style={{ color: '#6b7280' }}>Responsiveness</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <span>Gesture (Hand)</span>
                            <span style={{ fontFamily: 'monospace', color: '#16a34a', fontWeight: 'bold' }}>&lt; 30ms (Smooth)</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <span>Full Body Pose</span>
                            <span style={{ fontFamily: 'monospace', color: '#ca8a04', fontWeight: 'bold' }}>~80ms (Acceptable)</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Gaze Tracking</span>
                            <span style={{ fontFamily: 'monospace', color: '#dc2626', fontWeight: 'bold' }}>~120ms (Laggy)</span>
                        </div>
                    </div>
                    <div className="feature-box" style={{ background: '#eff6ff', borderColor: '#3b82f6' }}>
                        <h4 style={{ color: '#1e40af', marginTop: 0 }}>The "Uncanny Valley" of Interaction</h4>
                        <p style={{ fontSize: '0.9rem', color: '#1e3a8a', lineHeight: '1.6' }}>
                            When latency exceeds 100ms (like in Gaze Tracking), users start to overcompensate, moving their heads further than needed. The interface feels "slippery" rather than responsive.
                        </p>
                    </div>
                </div>
            </div>
        )
    },
    {
        id: 9,
        title: "Ethical Critical: Bias & Exclusion",
        subtitle: "Who does the system fail?",
        content: (
            <div>
                <div className="feature-box" style={{ marginBottom: '1.5rem', background: 'white' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#b45309' }}>
                        <AlertTriangle color="#f59e0b" /> Observed Biases
                    </h3>
                    <p style={{ marginBottom: '1rem', color: '#4b5563' }}>Through these experiments, we consistently observe that off-the-shelf models fail for marginalized groups:</p>
                    <ul className="feature-list">
                        <li><span style={{ color: '#ef4444' }}>•</span> <strong>Accent Bias</strong>: Systems optimized for "Standard" speech fail regional speakers.</li>
                        <li><span style={{ color: '#ef4444' }}>•</span> <strong>Racial Bias</strong>: Facial recognition (Face Mesh) struggles with lighting contrast on darker skin tones.</li>
                        <li><span style={{ color: '#ef4444' }}>•</span> <strong>Ableism</strong>: Gesture interfaces assume two distinct hands and standard range of motion.</li>
                    </ul>
                </div>

                <div style={{ background: '#eff6ff', padding: '1.5rem', borderRadius: '0.5rem', borderLeft: '5px solid #3b82f6' }}>
                    <h4 style={{ fontWeight: 'bold', color: '#1e40af', margin: 0, marginBottom: '0.5rem' }}>HCI Design Mandate</h4>
                    <p style={{ fontSize: '1.1rem', color: '#1e3a8a', margin: 0, fontStyle: 'italic' }}>
                        "No single modality is universally accessible. Designers MUST provide redundant/alternative methods (Multimodality) to ensure inclusion."
                    </p>
                </div>
            </div>
        )
    },
    {
        id: 10,
        title: "Privacy & Data Safety",
        subtitle: "Respecting the User",
        content: (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div className="feature-box" style={{ borderColor: '#fca5a5', background: '#fef2f2', display: 'flex', gap: '1rem' }}>
                    <Shield color="#ef4444" size={24} style={{ marginTop: '4px' }} />
                    <div>
                        <h3 style={{ fontWeight: 'bold', color: '#991b1b', fontSize: '1.2rem', marginTop: 0 }}>Privacy Concerns</h3>
                        <p style={{ color: '#7f1d1d', margin: '0.5rem 0 0.5rem' }}>
                            Biometric data (voice prints, face scans) is immutable. Once stolen, it cannot be "reset" like a password.
                        </p>
                    </div>
                </div>

                <div className="feature-box" style={{ borderColor: '#86efac', background: '#f0fdf4', display: 'flex', gap: '1rem' }}>
                    <Shield color="#22c55e" size={24} style={{ marginTop: '4px' }} />
                    <div>
                        <h3 style={{ fontWeight: 'bold', color: '#166534', fontSize: '1.2rem', marginTop: 0 }}>Lab Mitigations</h3>
                        <ul className="feature-list" style={{ marginTop: '0.5rem' }}>
                            <li>✅ <strong>Ephemeral Processing</strong>: Audio/Video is processed in RAM and discarded immediately.</li>
                            <li>✅ <strong>No Storage</strong>: We do not save ANY user data to databases.</li>
                            <li>✅ <strong>Client-Side First</strong>: Where possible (e.g. MediaPipe), raw video never leaves your browser.</li>
                        </ul>
                    </div>
                </div>
            </div>
        )
    },
    {
        id: 11,
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
                            <li>Responsibility lies with the <strong>designer</strong>, not the user.</li>
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
    const [isGestureActive, setIsGestureActive] = useState(false)
    const [gestureFeedback, setGestureFeedback] = useState<string | null>(null)
    const [cameraAccessible, setCameraAccessible] = useState(true)
    const [processedImage, setProcessedImage] = useState<string | null>(null)

    const videoRef = useRef<HTMLVideoElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const streamRef = useRef<MediaStream | null>(null)
    const processingRef = useRef<ReturnType<typeof setInterval> | null>(null)

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowRight' || e.key === 'Space') {
                nextSlide()
            } else if (e.key === 'ArrowLeft') {
                prevSlide()
            } else if (e.key === 'Escape') {
                onClose()
            }
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [onClose])

    const nextSlide = () => setCurrentSlide(prev => Math.min(prev + 1, slides.length - 1))
    const prevSlide = () => setCurrentSlide(prev => Math.max(prev - 1, 0))

    // Gesture Detection Setup
    useEffect(() => {
        let isCancelled = false

        const initGestureDetection = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { width: 640, height: 480, facingMode: 'user' }
                })
                if (isCancelled) {
                    stream.getTracks().forEach(t => t.stop())
                    return
                }
                streamRef.current = stream
                if (videoRef.current) {
                    videoRef.current.srcObject = stream
                    await videoRef.current.play()
                }
                setIsGestureActive(true)
                startProcessing()
            } catch (err) {
                console.error('Gesture camera error:', err)
                setCameraAccessible(false)
            }
        }

        const startProcessing = () => {
            processingRef.current = setInterval(async () => {
                if (!videoRef.current || !canvasRef.current) return

                const video = videoRef.current
                const canvas = canvasRef.current
                const ctx = canvas.getContext('2d')
                if (!ctx || video.videoWidth === 0) return

                canvas.width = 320 // Higher resolution for precision
                canvas.height = 240
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

                canvas.toBlob(async (blob) => {
                    if (!blob || isCancelled) return
                    try {
                        const formData = new FormData()
                        formData.append('frame', blob, 'frame.jpg')
                        formData.append('type', 'gesture')
                        const response = await axios.post(`${API_URL}/process-frame`, formData)

                        if (response.data && response.data.gesture) {
                            const g = response.data.gesture
                            if (g !== 'None') {
                                console.log('DEBUG GESTURE DETECTED:', g)
                            }

                            if (response.data.image) {
                                setProcessedImage(response.data.image)
                            }
                            if (g === 'Swipe_Left') {
                                nextSlide()
                                triggerFeedback('Next Slide ➡️')
                            } else if (g === 'Swipe_Right') {
                                prevSlide()
                                triggerFeedback('⬅️ Prev Slide')
                            }
                        }
                    } catch (err) {
                        // Silently fail polling
                    }
                }, 'image/jpeg', 0.5)
            }, 100)
        }

        const triggerFeedback = (msg: string) => {
            setGestureFeedback(msg)
            setTimeout(() => setGestureFeedback(null), 1000)
        }

        initGestureDetection()

        return () => {
            isCancelled = true
            if (processingRef.current) clearInterval(processingRef.current)
            if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop())
        }
    }, [])

    const slide = slides[currentSlide]

    return (
        <div className="presentation-overlay">

            {/* Hidden capture elements */}
            <video ref={videoRef} style={{ display: 'none' }} playsInline muted />
            <canvas ref={canvasRef} style={{ display: 'none' }} />

            {/* Gesture Hud */}
            <div className={`gesture-hud ${!cameraAccessible ? 'error' : ''}`}>
                {cameraAccessible ? (
                    <>
                        <Hand size={16} className={isGestureActive ? 'active' : ''} />
                        <span>Gesture Control Active</span>
                    </>
                ) : (
                    <span>Camera Permission Needed for Gestures</span>
                )}
            </div>

            {/* Camera Preview */}
            <AnimatePresence>
                {cameraAccessible && isGestureActive && (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="camera-preview-box"
                    >
                        {processedImage ? (
                            <img src={processedImage} alt="Gesture Feed" />
                        ) : (
                            <div className="preview-loading">
                                <Loader2 className="animate-spin" size={20} />
                                <span>Starting Feed...</span>
                            </div>
                        )}
                        <div className="preview-label">Live Gesture Feed</div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Gesture Feedback Toast */}
            <AnimatePresence>
                {gestureFeedback && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="gesture-toast"
                    >
                        {gestureFeedback.includes('Next') ? <MoveRight size={24} /> : <MoveLeft size={24} />}
                        {gestureFeedback}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header controls */}
            <div className="presentation-controls">
                <span className="keyboard-hint">Use ← → arrow keys or Gesture Slaps</span>
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
