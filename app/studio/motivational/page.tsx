'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Flame, Volume2, Loader2, Headphones, Music, Bold, Italic, CaseSensitive } from 'lucide-react'
import { cn } from '@/lib/utils'
import { BACKGROUND_VIDEOS } from '@/lib/studio/types'

import { ScriptEditor } from '@/components/studio/script-editor'
import { VoiceSelector } from '@/components/studio/voice-selector'
import { SubtitleStylePicker } from '@/components/studio/subtitle-style-picker'
import { RenderButton } from '@/components/studio/render-button'
import { VideoPreview } from '@/components/studio/video-preview'

const MOTIVATIONAL_BACKGROUNDS = BACKGROUND_VIDEOS.filter(
  (bg) => bg.category === 'Cinematic' || bg.category === 'Fitness'
)

const CAPTION_STYLES = [
  { id: 'bold' as const, label: 'Bold', icon: Bold },
  { id: 'italic' as const, label: 'Italic', icon: Italic },
  { id: 'uppercase' as const, label: 'Uppercase', icon: CaseSensitive },
]

export default function MotivationalVideoGenerator() {
  const [script, setScript] = useState('')
  const [captionStyle, setCaptionStyle] = useState<'bold' | 'italic' | 'uppercase'>('uppercase')
  const [voiceId, setVoiceId] = useState('charlie')
  const [selectedBackgrounds, setSelectedBackgrounds] = useState<string[]>(['gym'])
  const [subtitleStyle, setSubtitleStyle] = useState('neon-green')
  const [musicVolume, setMusicVolume] = useState(40)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [isGeneratingVoice, setIsGeneratingVoice] = useState(false)
  const [outputUrl, setOutputUrl] = useState<string | null>(null)

  const handleGenerateVoice = async () => {
    if (!script.trim()) return
    setIsGeneratingVoice(true)
    try {
      const res = await fetch('/api/studio/generate-voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: script, voiceId }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setAudioUrl(data.audioUrl || data.url)
    } catch (err) {
      console.error('Voice generation failed:', err)
    } finally {
      setIsGeneratingVoice(false)
    }
  }

  const handleRender = async (): Promise<string> => {
    const res = await fetch('/api/studio/render', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'motivational',
        projectName: 'Motivational Video',
        speechText: script,
        voiceId,
        backgroundClips: selectedBackgrounds,
        subtitleStyleId: subtitleStyle,
        captionStyle,
        musicVolume,
      }),
    })
    const data = await res.json()
    if (data.error) throw new Error(data.error)
    return data.jobId
  }

  const toggleBackground = (id: string) => {
    setSelectedBackgrounds((prev) =>
      prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id]
    )
  }

  return (
    <div className="flex h-full gap-6 px-8 py-8">
      {/* Left Column - Configuration (60%) */}
      <div className="flex w-[60%] flex-col">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg">
              <Flame className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">
                Motivational Video Generator
              </h1>
              <p className="text-[13px] text-white/40">
                Gym edits, speeches, entrepreneur content
              </p>
            </div>
          </div>
        </motion.div>

        <div className="flex-1 space-y-6 overflow-y-auto pr-2 pb-4 scrollbar-thin scrollbar-thumb-white/10">
          {/* Script Editor */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5"
          >
            <ScriptEditor
              value={script}
              onChange={setScript}
              type="motivational"
              placeholder="Write your motivational speech here..."
              generatePromptPlaceholder="Describe the motivational theme..."
              rows={10}
            />
          </motion.div>

          {/* Caption Style Selector */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5"
          >
            <label className="mb-3 flex items-center gap-2 text-[13px] font-medium text-white/70">
              <Bold className="h-4 w-4 text-amber-400" />
              Caption Style
            </label>
            <div className="flex gap-2">
              {CAPTION_STYLES.map((style) => {
                const Icon = style.icon
                return (
                  <motion.button
                    key={style.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setCaptionStyle(style.id)}
                    className={cn(
                      'flex flex-1 items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-[13px] font-medium transition-all',
                      captionStyle === style.id
                        ? 'border-amber-500/50 bg-amber-500/10 text-amber-300'
                        : 'border-white/[0.06] bg-white/[0.02] text-white/50 hover:border-white/[0.12] hover:bg-white/[0.04]'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {style.label}
                  </motion.button>
                )
              })}
            </div>
          </motion.div>

          {/* Voice Selector */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5"
          >
            <VoiceSelector value={voiceId} onChange={setVoiceId} />

            {/* Generate Voice Button */}
            <div className="mt-4">
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={handleGenerateVoice}
                disabled={isGeneratingVoice || !script.trim()}
                className={cn(
                  'flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-[13px] font-medium transition-all',
                  isGeneratingVoice
                    ? 'bg-amber-500/20 text-amber-300'
                    : 'border border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 disabled:opacity-30 disabled:cursor-not-allowed'
                )}
              >
                {isGeneratingVoice ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Headphones className="h-4 w-4" />
                )}
                {isGeneratingVoice ? 'Generating Voice...' : 'Generate Voice'}
              </motion.button>
            </div>
          </motion.div>

          {/* Background Clips Selector */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5"
          >
            <label className="mb-3 flex items-center gap-2 text-[13px] font-medium text-white/70">
              <Flame className="h-4 w-4 text-amber-400" />
              Background Clips
              <span className="ml-auto text-[11px] text-white/30">
                {selectedBackgrounds.length} selected
              </span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {MOTIVATIONAL_BACKGROUNDS.map((bg) => (
                <motion.button
                  key={bg.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => toggleBackground(bg.id)}
                  className={cn(
                    'relative flex flex-col items-center justify-center rounded-lg border p-3 transition-all',
                    selectedBackgrounds.includes(bg.id)
                      ? 'border-amber-500/50 bg-amber-500/10'
                      : 'border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12] hover:bg-white/[0.04]'
                  )}
                >
                  <span className="mb-1.5 text-2xl">{bg.thumbnail}</span>
                  <span className="text-[12px] font-medium text-white/70">{bg.name}</span>
                  <span className="text-[10px] text-white/30">{bg.category}</span>
                  {selectedBackgrounds.includes(bg.id) && (
                    <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-amber-400 border-2 border-[#060607]" />
                  )}
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Subtitle Style Picker */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5"
          >
            <SubtitleStylePicker value={subtitleStyle} onChange={setSubtitleStyle} />
          </motion.div>

          {/* Music Volume */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5"
          >
            <label className="flex items-center gap-2 text-[13px] font-medium text-white/70">
              <Music className="h-4 w-4 text-amber-400" />
              Background Music Volume
            </label>
            <div className="mt-3 flex items-center gap-4">
              <Volume2 className="h-4 w-4 shrink-0 text-white/30" />
              <input
                type="range"
                min={0}
                max={100}
                value={musicVolume}
                onChange={(e) => setMusicVolume(Number(e.target.value))}
                className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-amber-500 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-amber-400 [&::-webkit-slider-thumb]:shadow-lg"
              />
              <span className="min-w-[3ch] text-right text-[13px] font-medium text-white/50">
                {musicVolume}%
              </span>
            </div>
          </motion.div>

          {/* Render Button */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <RenderButton
              onClick={handleRender}
              disabled={!script.trim() || selectedBackgrounds.length === 0}
              label="Render Motivational Video"
              onComplete={(url) => setOutputUrl(url)}
            />
          </motion.div>
        </div>
      </div>

      {/* Right Column - Preview (40%) */}
      <div className="w-[40%]">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="sticky top-8 space-y-4"
        >
          {/* Video Preview */}
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
            <p className="mb-3 text-[13px] font-medium text-white/70">Preview</p>
            <VideoPreview
              src={outputUrl || undefined}
              aspectRatio="9/16"
              showDownload={!!outputUrl}
            />
          </div>

          {/* Selected Backgrounds Preview Strip */}
          {selectedBackgrounds.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4"
            >
              <p className="mb-3 text-[13px] font-medium text-white/70">
                Selected Backgrounds
              </p>
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-white/10">
                {selectedBackgrounds.map((bgId) => {
                  const bg = BACKGROUND_VIDEOS.find((b) => b.id === bgId)
                  if (!bg) return null
                  return (
                    <motion.div
                      key={bg.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex shrink-0 flex-col items-center gap-1 rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2"
                    >
                      <span className="text-lg">{bg.thumbnail}</span>
                      <span className="text-[10px] text-white/50">{bg.name}</span>
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>
          )}

          {/* Audio Preview */}
          {audioUrl && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4"
            >
              <p className="mb-3 flex items-center gap-2 text-[13px] font-medium text-white/70">
                <Headphones className="h-4 w-4 text-amber-400" />
                Generated Voice
              </p>
              <audio
                controls
                src={audioUrl}
                className="w-full h-10 [&::-webkit-media-controls-panel]:bg-white/[0.06] rounded-lg"
              />
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
