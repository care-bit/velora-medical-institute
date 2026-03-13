'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { SubtitleStylePicker } from '@/components/studio/subtitle-style-picker'
import {
  Upload,
  Scissors,
  Wand2,
  Clock,
  FileVideo,
  Loader2,
  Check,
  Download,
} from 'lucide-react'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface UploadedFile {
  fileName: string
  filePath: string
  publicUrl: string
}

interface TranscriptSegment {
  start: number
  end: number
  text: string
}

interface DetectedClip {
  id: string
  title: string
  startTime: number
  endTime: number
  score: number
  reason: string
  selected: boolean
}

interface ExportedClip {
  id: string
  url: string
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

function scoreColor(score: number): string {
  if (score >= 80) return 'from-green-500 to-emerald-400'
  if (score >= 60) return 'from-yellow-400 to-green-500'
  if (score >= 40) return 'from-orange-400 to-yellow-400'
  return 'from-red-500 to-orange-400'
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function ClipCutterPage() {
  /* ----- state ---------------------------------------------------- */
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const [transcript, setTranscript] = useState<TranscriptSegment[]>([])
  const [isTranscribing, setIsTranscribing] = useState(false)

  const [clips, setClips] = useState<DetectedClip[]>([])
  const [isDetecting, setIsDetecting] = useState(false)

  const [subtitleStyle, setSubtitleStyle] = useState('bold-white')

  const [isExporting, setIsExporting] = useState(false)
  const [exportedClips, setExportedClips] = useState<ExportedClip[]>([])

  const [isDragOver, setIsDragOver] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [videoDuration, setVideoDuration] = useState(0)

  const videoRef = useRef<HTMLVideoElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  /* ----- video time tracking ------------------------------------- */
  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    const onTime = () => setCurrentTime(video.currentTime)
    const onLoaded = () => setVideoDuration(video.duration)
    video.addEventListener('timeupdate', onTime)
    video.addEventListener('loadedmetadata', onLoaded)
    return () => {
      video.removeEventListener('timeupdate', onTime)
      video.removeEventListener('loadedmetadata', onLoaded)
    }
  }, [uploadedFile])

  /* ----- upload --------------------------------------------------- */
  const handleUpload = useCallback(async (file: File) => {
    setIsUploading(true)
    setUploadProgress(0)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const xhr = new XMLHttpRequest()

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          setUploadProgress(Math.round((e.loaded / e.total) * 100))
        }
      })

      const result = await new Promise<UploadedFile>((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(JSON.parse(xhr.responseText))
          } else {
            reject(new Error('Upload failed'))
          }
        }
        xhr.onerror = () => reject(new Error('Upload failed'))
        xhr.open('POST', '/api/studio/upload')
        xhr.send(formData)
      })

      setUploadedFile(result)
      setTranscript([])
      setClips([])
      setExportedClips([])
    } catch (err) {
      console.error('Upload error:', err)
    } finally {
      setIsUploading(false)
    }
  }, [])

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)
      const file = e.dataTransfer.files[0]
      if (file && file.type.startsWith('video/')) {
        handleUpload(file)
      }
    },
    [handleUpload]
  )

  const onFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) handleUpload(file)
    },
    [handleUpload]
  )

  /* ----- transcribe ---------------------------------------------- */
  const handleTranscribe = async () => {
    if (!uploadedFile) return
    setIsTranscribing(true)
    try {
      const res = await fetch('/api/studio/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filePath: uploadedFile.filePath, withWords: false }),
      })
      const data = await res.json()
      setTranscript(data.segments ?? [])
    } catch (err) {
      console.error('Transcribe error:', err)
    } finally {
      setIsTranscribing(false)
    }
  }

  /* ----- detect clips -------------------------------------------- */
  const handleDetectClips = async () => {
    if (transcript.length === 0) return
    setIsDetecting(true)
    try {
      const res = await fetch('/api/studio/clip-detect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript: transcript }),
      })
      const data = await res.json()
      setClips(
        (data.clips ?? []).map((c: DetectedClip) => ({ ...c, selected: true }))
      )
    } catch (err) {
      console.error('Detect error:', err)
    } finally {
      setIsDetecting(false)
    }
  }

  /* ----- export --------------------------------------------------- */
  const handleExport = async () => {
    if (!uploadedFile) return
    const selected = clips.filter((c) => c.selected)
    if (selected.length === 0) return
    setIsExporting(true)
    setExportedClips([])

    try {
      const results: ExportedClip[] = []
      for (const clip of selected) {
        const relevantSegments = transcript.filter(
          (s) => s.start >= clip.startTime && s.end <= clip.endTime
        )
        const res = await fetch('/api/studio/render', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'clip-cutter',
            sourceVideoPath: uploadedFile.filePath,
            startTime: clip.startTime,
            endTime: clip.endTime,
            subtitleStyleId: subtitleStyle,
            segments: relevantSegments,
          }),
        })
        const data = await res.json()
        results.push({ id: clip.id, url: data.url })
      }
      setExportedClips(results)
    } catch (err) {
      console.error('Export error:', err)
    } finally {
      setIsExporting(false)
    }
  }

  /* ----- clip toggle --------------------------------------------- */
  const toggleClip = (id: string) => {
    setClips((prev) =>
      prev.map((c) => (c.id === id ? { ...c, selected: !c.selected } : c))
    )
  }

  /* ----- seek video ---------------------------------------------- */
  const seekTo = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time
      videoRef.current.play()
    }
  }

  const selectedCount = clips.filter((c) => c.selected).length

  /* ---------------------------------------------------------------- */
  /*  Render                                                           */
  /* ---------------------------------------------------------------- */
  return (
    <div className="flex h-full gap-6 px-6 py-6 overflow-hidden">
      {/* ============ LEFT COLUMN (55%) ============ */}
      <div className="w-[55%] shrink-0 overflow-y-auto pr-2 space-y-5 scrollbar-thin scrollbar-thumb-white/10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-500/15">
              <Scissors className="h-4.5 w-4.5 text-violet-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">
                Clip Cutter
              </h1>
              <p className="text-[13px] text-white/40">
                Upload video, AI finds viral moments
              </p>
            </div>
          </div>
        </motion.div>

        {/* Upload zone */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <div
            onDragOver={(e) => {
              e.preventDefault()
              setIsDragOver(true)
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              'relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 cursor-pointer transition-all duration-200',
              isDragOver
                ? 'border-violet-400 bg-violet-500/10'
                : 'border-white/[0.08] bg-white/[0.02] hover:border-white/[0.15]',
              isUploading && 'pointer-events-none opacity-70'
            )}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".mp4,.mov,.avi,.mkv,.webm"
              onChange={onFileChange}
              className="hidden"
            />

            {isUploading ? (
              <>
                <Loader2 className="h-8 w-8 text-violet-400 animate-spin" />
                <p className="text-sm text-white/60">
                  Uploading… {uploadProgress}%
                </p>
                <div className="w-full max-w-xs h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-violet-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${uploadProgress}%` }}
                    transition={{ ease: 'easeOut' }}
                  />
                </div>
              </>
            ) : uploadedFile ? (
              <>
                <FileVideo className="h-8 w-8 text-violet-400" />
                <p className="text-sm text-white/80 font-medium">
                  {uploadedFile.fileName}
                </p>
                <p className="text-xs text-white/40">
                  Click or drag to replace
                </p>
              </>
            ) : (
              <>
                <Upload className="h-8 w-8 text-white/30" />
                <p className="text-sm text-white/60">
                  Drag & drop a video file, or{' '}
                  <span className="text-violet-400 font-medium">browse</span>
                </p>
                <p className="text-xs text-white/30">
                  MP4, MOV, AVI, MKV, WebM
                </p>
              </>
            )}
          </div>
        </motion.div>

        {/* Transcribe button */}
        <AnimatePresence>
          {uploadedFile && transcript.length === 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <button
                onClick={handleTranscribe}
                disabled={isTranscribing}
                className={cn(
                  'flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition-all',
                  'border-violet-500/30 bg-violet-500/10 text-violet-300 hover:bg-violet-500/20',
                  isTranscribing && 'opacity-60 cursor-not-allowed'
                )}
              >
                {isTranscribing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Wand2 className="h-4 w-4" />
                )}
                {isTranscribing ? 'Transcribing…' : 'Transcribe'}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Transcript viewer */}
        <AnimatePresence>
          {transcript.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
                <span className="text-[13px] font-medium text-white/70">
                  Transcript ({transcript.length} segments)
                </span>
              </div>
              <div className="max-h-[240px] overflow-y-auto divide-y divide-white/[0.04] scrollbar-thin scrollbar-thumb-white/10">
                {transcript.map((seg, i) => (
                  <button
                    key={i}
                    onClick={() => seekTo(seg.start)}
                    className="flex w-full items-start gap-3 px-4 py-2.5 text-left transition-colors hover:bg-white/[0.04]"
                  >
                    <span className="shrink-0 mt-0.5 flex items-center gap-1 text-[11px] font-mono text-violet-400/80">
                      <Clock className="h-3 w-3" />
                      {formatTime(seg.start)}
                    </span>
                    <span className="text-[13px] text-white/60 leading-relaxed">
                      {seg.text}
                    </span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Detect clips button */}
        <AnimatePresence>
          {transcript.length > 0 && clips.length === 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <button
                onClick={handleDetectClips}
                disabled={isDetecting}
                className={cn(
                  'flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition-all',
                  'border-violet-500/30 bg-violet-500/10 text-violet-300 hover:bg-violet-500/20',
                  isDetecting && 'opacity-60 cursor-not-allowed'
                )}
              >
                {isDetecting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Scissors className="h-4 w-4" />
                )}
                {isDetecting ? 'Detecting Clips…' : 'Detect Clips'}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Detected clips list */}
        <AnimatePresence>
          {clips.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-2"
            >
              <span className="text-[13px] font-medium text-white/70">
                Detected Clips ({clips.length})
              </span>
              <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-white/10">
                {clips.map((clip, i) => (
                  <motion.div
                    key={clip.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    onClick={() => seekTo(clip.startTime)}
                    className={cn(
                      'rounded-xl border p-4 cursor-pointer transition-all',
                      clip.selected
                        ? 'border-violet-500/30 bg-violet-500/[0.06]'
                        : 'border-white/[0.06] bg-white/[0.02] opacity-60'
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-[14px] font-semibold text-white/90 truncate">
                          {clip.title}
                        </h3>
                        <p className="text-[12px] text-white/40 mt-0.5 flex items-center gap-1.5">
                          <Clock className="h-3 w-3" />
                          {formatTime(clip.startTime)} – {formatTime(clip.endTime)}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleClip(clip.id)
                        }}
                        className={cn(
                          'shrink-0 flex h-6 w-6 items-center justify-center rounded-md border transition-all',
                          clip.selected
                            ? 'border-violet-500 bg-violet-500 text-white'
                            : 'border-white/[0.12] bg-transparent text-transparent hover:border-white/[0.2]'
                        )}
                      >
                        <Check className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {/* Score bar */}
                    <div className="mt-3 flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                        <div
                          className={cn(
                            'h-full rounded-full bg-gradient-to-r transition-all',
                            scoreColor(clip.score)
                          )}
                          style={{ width: `${clip.score}%` }}
                        />
                      </div>
                      <span className="text-[11px] font-mono text-white/50 w-8 text-right">
                        {clip.score}%
                      </span>
                    </div>

                    <p className="text-[12px] text-white/40 mt-2 line-clamp-2">
                      {clip.reason}
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Subtitle style picker */}
        <AnimatePresence>
          {clips.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <SubtitleStylePicker
                value={subtitleStyle}
                onChange={setSubtitleStyle}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Export button */}
        <AnimatePresence>
          {clips.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <button
                onClick={handleExport}
                disabled={isExporting || selectedCount === 0}
                className={cn(
                  'flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-3.5 text-sm font-semibold transition-all',
                  selectedCount > 0
                    ? 'border-violet-500/40 bg-violet-500/20 text-violet-200 hover:bg-violet-500/30'
                    : 'border-white/[0.06] bg-white/[0.02] text-white/30 cursor-not-allowed',
                  isExporting && 'opacity-60 cursor-not-allowed'
                )}
              >
                {isExporting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                {isExporting
                  ? 'Exporting…'
                  : `Export Selected Clips (${selectedCount})`}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Exported clips */}
        <AnimatePresence>
          {exportedClips.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-2"
            >
              <span className="text-[13px] font-medium text-green-400/80">
                Exported ({exportedClips.length})
              </span>
              {exportedClips.map((ec) => {
                const clip = clips.find((c) => c.id === ec.id)
                return (
                  <a
                    key={ec.id}
                    href={ec.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 transition-colors hover:bg-white/[0.05]"
                  >
                    <Check className="h-4 w-4 text-green-400" />
                    <span className="text-[13px] text-white/70 truncate flex-1">
                      {clip?.title ?? ec.id}
                    </span>
                    <Download className="h-3.5 w-3.5 text-white/30" />
                  </a>
                )
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ============ RIGHT COLUMN (45%) ============ */}
      <div className="w-[45%] shrink-0 flex flex-col gap-4 overflow-hidden">
        {/* Video player */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden flex flex-col"
        >
          <div className="relative aspect-video bg-black/60 flex items-center justify-center">
            {uploadedFile ? (
              <video
                ref={videoRef}
                src={uploadedFile.publicUrl}
                controls
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="flex flex-col items-center gap-2 text-white/20">
                <FileVideo className="h-10 w-10" />
                <span className="text-[13px]">No video uploaded</span>
              </div>
            )}
          </div>

          {/* Current timestamp */}
          {uploadedFile && (
            <div className="flex items-center justify-between px-4 py-2.5 border-t border-white/[0.06]">
              <span className="text-[12px] font-mono text-white/50">
                {formatTime(currentTime)}
              </span>
              <span className="text-[12px] font-mono text-white/30">
                {formatTime(videoDuration)}
              </span>
            </div>
          )}
        </motion.div>

        {/* Mini timeline */}
        <AnimatePresence>
          {clips.length > 0 && videoDuration > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 space-y-3"
            >
              <span className="text-[13px] font-medium text-white/70">
                Clip Timeline
              </span>
              <div className="relative h-8 rounded-lg bg-white/[0.04] overflow-hidden">
                {/* Clip regions */}
                {clips.map((clip) => {
                  const left = (clip.startTime / videoDuration) * 100
                  const width =
                    ((clip.endTime - clip.startTime) / videoDuration) * 100
                  return (
                    <button
                      key={clip.id}
                      onClick={() => seekTo(clip.startTime)}
                      title={clip.title}
                      className={cn(
                        'absolute top-0 h-full rounded-sm transition-opacity',
                        clip.selected
                          ? 'bg-violet-500/40 hover:bg-violet-500/60'
                          : 'bg-white/[0.08] hover:bg-white/[0.12]'
                      )}
                      style={{ left: `${left}%`, width: `${width}%` }}
                    />
                  )
                })}

                {/* Playhead */}
                <div
                  className="absolute top-0 h-full w-0.5 bg-white/60 pointer-events-none transition-[left] duration-150"
                  style={{
                    left: `${(currentTime / videoDuration) * 100}%`,
                  }}
                />
              </div>
              <div className="flex justify-between text-[10px] font-mono text-white/30">
                <span>0:00</span>
                <span>{formatTime(videoDuration)}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
