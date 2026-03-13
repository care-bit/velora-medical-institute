'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, Play, Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface RenderButtonProps {
  onClick: () => Promise<string> // Returns job ID
  disabled?: boolean
  label?: string
  onComplete?: (outputUrl: string) => void
}

export function RenderButton({ onClick, disabled, label = 'Render Video', onComplete }: RenderButtonProps) {
  const [status, setStatus] = useState<'idle' | 'rendering' | 'complete' | 'error'>('idle')
  const [progress, setProgress] = useState(0)
  const [jobId, setJobId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!jobId || status !== 'rendering') return

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/studio/render-status?jobId=${jobId}`)
        const job = await res.json()

        setProgress(job.progress || 0)

        if (job.status === 'completed') {
          setStatus('complete')
          setProgress(100)
          if (job.outputPath && onComplete) {
            onComplete(job.outputPath)
          }
          clearInterval(interval)
        } else if (job.status === 'failed') {
          setStatus('error')
          setError(job.error || 'Render failed')
          clearInterval(interval)
        }
      } catch {
        // Polling error, will retry
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [jobId, status, onComplete])

  const handleClick = async () => {
    if (status === 'rendering') return
    setStatus('rendering')
    setProgress(0)
    setError(null)

    try {
      const id = await onClick()
      setJobId(id)
    } catch (err) {
      setStatus('error')
      setError(err instanceof Error ? err.message : 'Failed to start render')
    }
  }

  const reset = () => {
    setStatus('idle')
    setProgress(0)
    setJobId(null)
    setError(null)
  }

  return (
    <div className="space-y-2">
      <motion.button
        whileHover={status === 'idle' ? { scale: 1.01 } : {}}
        whileTap={status === 'idle' ? { scale: 0.99 } : {}}
        onClick={status === 'idle' || status === 'error' ? handleClick : undefined}
        disabled={disabled || status === 'rendering'}
        className={cn(
          'relative w-full overflow-hidden rounded-xl py-3.5 text-[14px] font-semibold transition-all',
          status === 'idle' &&
            'bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white hover:opacity-90 disabled:opacity-30',
          status === 'rendering' && 'bg-white/[0.06] text-white/70',
          status === 'complete' && 'bg-emerald-500/20 text-emerald-300 cursor-default',
          status === 'error' && 'bg-red-500/20 text-red-300'
        )}
      >
        {/* Progress bar overlay */}
        {status === 'rendering' && (
          <div
            className="absolute inset-y-0 left-0 bg-violet-500/20 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        )}

        <span className="relative z-10 flex items-center justify-center gap-2">
          {status === 'idle' && (
            <>
              <Play className="h-4 w-4" />
              {label}
            </>
          )}
          {status === 'rendering' && (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Rendering... {progress}%
            </>
          )}
          {status === 'complete' && (
            <>
              <Check className="h-4 w-4" />
              Render Complete
            </>
          )}
          {status === 'error' && (
            <>
              <X className="h-4 w-4" />
              {error || 'Failed'} — Click to retry
            </>
          )}
        </span>
      </motion.button>

      {status === 'complete' && (
        <button
          onClick={reset}
          className="w-full text-center text-[12px] text-white/30 hover:text-white/50 transition-colors"
        >
          Render another
        </button>
      )}
    </div>
  )
}
