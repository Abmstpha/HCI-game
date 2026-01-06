import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, Type, Globe, Volume2, Sparkles, Home } from 'lucide-react'
import './App.css'
import SpeechVsTyping from './components/SpeechVsTyping'
import AccentTest from './components/AccentTest'
import NoiseTest from './components/NoiseTest'
import MultilingualTest from './components/MultilingualTest'

type ExperimentId = null | 1 | 2 | 3 | 4

function App() {
  const [activeExperiment, setActiveExperiment] = useState<ExperimentId>(null)

  const experiments = [
    {
      id: 1 as const,
      title: 'Speech vs Typing',
      description: 'Compare speed and accuracy',
      icon: Type,
      color: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
      bgGlow: 'bg-cyan-500/20'
    },
    {
      id: 2 as const,
      title: 'Accent Effect',
      description: 'Test different accents',
      icon: Globe,
      color: 'linear-gradient(135deg, #a855f7, #ec4899)',
      bgGlow: 'bg-purple-500/20'
    },
    {
      id: 3 as const,
      title: 'Background Noise',
      description: 'Impact of noise',
      icon: Volume2,
      color: 'linear-gradient(135deg, #22c55e, #10b981)',
      bgGlow: 'bg-green-500/20'
    },
    {
      id: 4 as const,
      title: 'Multilingual',
      description: 'Test multiple languages',
      icon: Sparkles,
      color: 'linear-gradient(135deg, #f97316, #ef4444)',
      bgGlow: 'bg-orange-500/20'
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
