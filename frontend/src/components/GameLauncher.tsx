import { useState } from 'react'
import { Play, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'\nimport type { LucideIcon } from 'lucide-react'
import { motion } from 'framer-motion'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

interface GameLauncherProps {
    title: string
    description: string
    endpoint: string
    icon: LucideIcon
    color: string
}

const GameLauncher = ({ title, description, endpoint, icon: Icon, color }: GameLauncherProps) => {
    const [loading, setLoading] = useState(false)
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
    const [message, setMessage] = useState('')

    const launchGame = async () => {
        setLoading(true)
        setStatus('idle')
        setMessage('')

        try {
            await axios.post(`${API_URL}${endpoint}`)
            setStatus('success')
            setMessage('Game launched successfully! Check your taskbar.')
        } catch (err) {
            setStatus('error')
            const error = err as { response?: { data?: { detail?: string } } }
            setMessage(error.response?.data?.detail || 'Failed to connect to backend')
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="game-launcher-container">
            <motion.div
                className="game-icon-circle"
                style={{ background: color }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
            >
                <Icon size={80} color="white" />
            </motion.div>

            <motion.h2
                className="game-title"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                {title}
            </motion.h2>

            <motion.p
                className="game-description"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
            >
                {description}
            </motion.p>

            <motion.button
                onClick={launchGame}
                disabled={loading}
                className="btn-launch group"
                style={{ background: color }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />

                {loading ? (
                    <>
                        <Loader2 className="animate-spin" size={32} />
                        Launching...
                    </>
                ) : (
                    <>
                        <Play fill="currentColor" size={32} />
                        Start Game
                    </>
                )}
            </motion.button>

            <div className="h-16 flex items-center justify-center mt-4">
                {/* Status Messages */}
                {status === 'success' && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="status-box status-success"
                    >
                        <CheckCircle2 size={24} />
                        <span>{message}</span>
                    </motion.div>
                )}

                {status === 'error' && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="status-box status-error"
                    >
                        <AlertCircle size={24} />
                        <span>{message}</span>
                    </motion.div>
                )}
            </div>
        </div>
    )
}

export default GameLauncher
