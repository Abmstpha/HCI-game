import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, Type, Globe, Volume2, Sparkles, Home, Hand, Activity, Smile, Podcast, Eye } from 'lucide-react'
import './App.css'
import SpeechVsTyping from './components/SpeechVsTyping'
import AccentTest from './components/AccentTest'
import NoiseTest from './components/NoiseTest'
import MultilingualTest from './components/MultilingualTest'
import VisionExperience from './components/VisionExperience'
import VoiceEmotion from './components/VoiceEmotion'
import GazeTracking from './components/GazeTracking'

type ExperimentId = null | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9

function App() {
  const [activeExperiment, setActiveExperiment] = useState<ExperimentId>(null)

  const experiments = [
    {
      id: 1 as const,
      title: 'Speech vs Typing',
      description: 'Race: Voice or Keyboard?',
      icon: Type,
      color: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
      bgGlow: 'bg-cyan-500/20'
    },
    {
      id: 2 as const,
      title: 'Accent Effect',
      description: 'How accents affect AI',
      icon: Globe,
      color: 'linear-gradient(135deg, #a855f7, #ec4899)',
      bgGlow: 'bg-purple-500/20'
    },
    {
      id: 3 as const,
      title: 'Background Noise',
      description: 'Test speech in noisy environments',
      icon: Volume2,
      color: 'linear-gradient(135deg, #22c55e, #10b981)',
      bgGlow: 'bg-green-500/20'
    },
    {
      id: 4 as const,
      title: 'Multilingual',
      description: 'Speak in 13+ languages',
      icon: Sparkles,
      color: 'linear-gradient(135deg, #f97316, #ef4444)',
      bgGlow: 'bg-orange-500/20'
    },
    {
      id: 5 as const,
      title: 'Gesture Control',
      description: 'Touchless hand interaction',
      icon: Hand,
      color: 'linear-gradient(135deg, #f43f5e, #f0abfc)',
      bgGlow: 'bg-rose-500/20'
    },
    {
      id: 6 as const,
      title: 'Pose Tracking',
      description: 'Full-body skeleton overlay',
      icon: Activity,
      color: 'linear-gradient(135deg, #84cc16, #14b8a6)',
      bgGlow: 'bg-lime-500/20'
    },
    {
      id: 7 as const,
      title: 'Emotion AI',
      description: 'Adaptive mood detection',
      icon: Smile,
      color: 'linear-gradient(135deg, #fbbf24, #d97706)',
      bgGlow: 'bg-amber-500/20'
    },
    {
      id: 8 as const,
      title: 'Voice Emotion',
      description: 'Detect emotion from tone',
      icon: Podcast,
      color: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
      bgGlow: 'bg-indigo-500/20'
    },
    {
      id: 9 as const,
      title: 'Gaze Tracking',
      description: 'Eye tracking with Dlib',
      icon: Eye,
      color: 'linear-gradient(135deg, #14b8a6, #06b6d4)',
      bgGlow: 'bg-teal-500/20'
    }
  ]

  const renderExperiment = () => {
    switch (activeExperiment) {
      case 1:
        return <SpeechVsTyping />
      case 2:
        return <AccentTest />
      case 3:
        return <NoiseTest />
      case 4:
        return <MultilingualTest />
      case 5:
        return (
          <VisionExperience
            title="Gesture Control"
            description="Real-time hand tracking with gesture recognition"
            streamEndpoint="/stream/gesture"
            statusKey="gesture"
            icon={Hand}
            color="linear-gradient(135deg, #f43f5e, #f0abfc)"
            instructions={[
              "Show your hand to the camera",
              "Point with your index finger to move cursor",
              "Pinch (touch thumb to index) to click",
              "Open hand = Wave gesture",
              "Closed fist = Fist gesture"
            ]}
          />
        )
      case 6:
        return (
          <VisionExperience
            title="Pose Estimation"
            description="Full body pose tracking with skeleton visualization"
            streamEndpoint="/stream/pose"
            statusKey="pose"
            icon={Activity}
            color="linear-gradient(135deg, #84cc16, #14b8a6)"
            instructions={[
              "Stand back so your full body is visible",
              "Raise both hands above your head = Hands Up!",
              "Extend arms horizontally = T-Pose",
              "Raise one arm = Arm raised detection",
              "The skeleton overlay shows all 33 body landmarks"
            ]}
          />
        )
      case 7:
        return (
          <VisionExperience
            title="Emotion AI"
            description="Facial emotion detection with adaptive UI"
            streamEndpoint="/stream/emotion"
            statusKey="emotion"
            icon={Smile}
            color="linear-gradient(135deg, #fbbf24, #d97706)"
            instructions={[
              "Face the camera clearly",
              "The AI detects: Happy, Sad, Angry, Surprised, Neutral, Fear",
              "UI header color adapts to your emotion",
              "Messages change based on detected mood",
              "Uses temporal smoothing for stable detection"
            ]}
          />
        )
      case 8:
        return (
          <VoiceEmotion
            title="Voice Emotion"
            description="Speech Emotion Recognition using ML"
            color="linear-gradient(135deg, #6366f1, #8b5cf6)"
            icon={Podcast}
          />
        )
      case 9:
        return (
          <GazeTracking
            title="Gaze Tracking"
            description="Real-time eye tracking using Dlib landmarks"
            color="linear-gradient(135deg, #14b8a6, #06b6d4)"
            icon={Eye}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="app">
      {/* Animated background gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-black -z-10" />

      {/* Floating orbs for effect */}
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      <div className="container">
        <AnimatePresence mode="wait">
          {activeExperiment === null ? (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="home-view"
            >
              {/* Header */}
              <motion.div
                className="header"
                initial={{ opacity: 0, y: -30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="flex items-center justify-center gap-3 mb-3" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <Mic style={{ width: '48px', height: '48px', color: '#22d3ee' }} />
                  <h1 className="title">
                    <span className="gradient-text">Choose Your Game</span>
                  </h1>
                </div>
                <p className="subtitle">
                  ⚡ Advanced HCI Laboratory ⚡
                </p>
              </motion.div>

              {/* Experiments Grid */}
              <div className="experiments-grid">
                {experiments.map((exp, index) => (
                  <motion.button
                    key={exp.id}
                    className="experiment-card"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    whileHover={{ scale: 1.05, y: -5 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setActiveExperiment(exp.id)}
                  >
                    <div className={`experiment-glow ${exp.bgGlow}`} />
                    <div
                      className="experiment-icon"
                      style={{
                        background: exp.color,
                        boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
                      }}
                    >
                      <exp.icon style={{ width: '48px', height: '48px', color: 'white' }} />
                    </div>
                    <h3 className="experiment-title">{exp.title}</h3>
                    <p className="experiment-description">{exp.description}</p>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="experiment"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="experiment-view"
            >
              {/* Back button */}
              <motion.button
                className="back-button"
                onClick={() => setActiveExperiment(null)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Home className="w-5 h-5" />
                <span>Home</span>
              </motion.button>

              {/* Render active experiment */}
              {renderExperiment()}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default App
