'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Pause, Volume2, VolumeX, Maximize2, Download } from 'lucide-react'
import { cn } from '@/lib/utils'

interface VideoPreviewProps {
  src?: string
  poster?: string
  className?: string
  showControls?: boolean
  showDownload?: boolean
  aspectRatio?: '9/16' | '16/9'
}

export function VideoPreview({
  src,
  poster,
  className,
  showControls = true,
  showDownload = false,
  aspectRatio = '9/16',
}: VideoPreviewProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const updateProgress = () => {
      if (video.duration) {
        setProgress((video.currentTime / video.duration) * 100)
      }
    }

    video.addEventListener('timeupdate', updateProgress)
    video.addEventListener('loadedmetadata', () => setDuration(video.duration))
    video.addEventListener('ended', () => setIsPlaying(false))

    return () => {
      video.removeEventListener('timeupdate', updateProgress)
      video.removeEventListener('loadedmetadata', () => {})
      video.removeEventListener('ended', () => {})
    }
  }, [src])

  const togglePlay = () => {
    if (!videoRef.current) return
    if (isPlaying) {
      videoRef.current.pause()
    } else {
      videoRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = Math.floor(s % 60)
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl border border-white/[0.06] bg-black',
        className
      )}
      style={{ aspectRatio }}
    >
      {src ? (
        <>
          <video
            ref={videoRef}
            src={src}
            poster={poster}
            className="h-full w-full object-cover"
            muted={isMuted}
            playsInline
          />

          {/* Play overlay */}
          <AnimatePresence>
            {!isPlaying && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer"
                onClick={togglePlay}
              >
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex h-14 w-14 items-center justify-center rounded-full bg-white/20 backdrop-blur-md border border-white/20"
                >
                  <Play className="h-6 w-6 text-white ml-0.5" fill="white" />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Controls */}
          {showControls && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-3 pb-3 pt-8">
              {/* Progress bar */}
              <div className="mb-2 h-1 w-full rounded-full bg-white/20 cursor-pointer"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect()
                  const pct = (e.clientX - rect.left) / rect.width
                  if (videoRef.current) {
                    videoRef.current.currentTime = pct * videoRef.current.duration
                  }
                }}
              >
                <div
                  className="h-full rounded-full bg-violet-400 transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button onClick={togglePlay} className="text-white/80 hover:text-white">
                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </button>
                  <button onClick={() => setIsMuted(!isMuted)} className="text-white/80 hover:text-white">
                    {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  </button>
                  <span className="text-[11px] text-white/50">
                    {formatTime((progress / 100) * duration)} / {formatTime(duration)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {showDownload && (
                    <a href={src} download className="text-white/80 hover:text-white">
                      <Download className="h-4 w-4" />
                    </a>
                  )}
                  <button
                    onClick={() => videoRef.current?.requestFullscreen()}
                    className="text-white/80 hover:text-white"
                  >
                    <Maximize2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white/[0.04] border border-white/[0.06]">
              <Play className="h-5 w-5 text-white/20" />
            </div>
            <p className="text-[13px] text-white/30">Preview will appear here</p>
          </div>
        </div>
      )}
    </div>
  )
}
