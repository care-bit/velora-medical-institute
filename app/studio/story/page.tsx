'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { BookOpen, Volume2, Loader2, Headphones, Music } from 'lucide-react'
import { cn } from '@/lib/utils'

import { ScriptEditor } from '@/components/studio/script-editor'
import { VoiceSelector } from '@/components/studio/voice-selector'
import { BackgroundSelector } from '@/components/studio/background-selector'
import { SubtitleStylePicker } from '@/components/studio/subtitle-style-picker'
import { RenderButton } from '@/components/studio/render-button'
import { VideoPreview } from '@/components/studio/video-preview'

export default function StoryVideoGenerator() {
  const [script, setScript] = useState('')
  const [voiceId, setVoiceId] = useState('george')
  const [backgroundVideo, setBackgroundVideo] = useState('minecraft')
  const [subtitleStyle, setSubtitleStyle] = useState('bold-white')
  const [musicVolume, setMusicVolume] = useState(30)
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
        type: 'story',
        projectName: `Story Video - ${new Date().toLocaleString()}`,
        script,
        voiceId,
        backgroundVideo,
        subtitleStyleId: subtitleStyle,
        musicVolume,
        // If voice was already generated, pass the audio URL so we skip re-generating
        ...(audioUrl ? { audioPath: audioUrl } : {}),
      }),
    })
    const data = await res.json()
    if (data.error) throw new Error(data.error)
    return data.jobId
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
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-red-500 shadow-lg">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">
                Story Video Generator
              </h1>
              <p className="text-[13px] text-white/40">
                Reddit stories, horror tales, confessions — with narration and gameplay backgrounds
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
              type="story"
              placeholder="Paste your Reddit story or write your own script here..."
              generatePromptPlaceholder="Describe a story idea (e.g. 'creepy encounter at a gas station')"
              rows={10}
            />
          </motion.div>

          {/* Voice Selector */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5"
          >
            <VoiceSelector value={voiceId} onChange={setVoiceId} />

            {/* Generate Narration Button */}
            <div className="mt-4">
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={handleGenerateVoice}
                disabled={isGeneratingVoice || !script.trim()}
                className={cn(
                  'flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-[13px] font-medium transition-all',
                  isGeneratingVoice
                    ? 'bg-violet-500/20 text-violet-300'
                    : 'border border-violet-500/30 bg-violet-500/10 text-violet-300 hover:bg-violet-500/20 disabled:opacity-30 disabled:cursor-not-allowed'
                )}
              >
                {isGeneratingVoice ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Headphones className="h-4 w-4" />
                )}
                {isGeneratingVoice ? 'Generating Narration...' : 'Generate Narration'}
              </motion.button>
            </div>
          </motion.div>

          {/* Background Selector */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5"
          >
            <BackgroundSelector value={backgroundVideo} onChange={setBackgroundVideo} />
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
              <Music className="h-4 w-4 text-violet-400" />
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
                className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-violet-500 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-violet-400 [&::-webkit-slider-thumb]:shadow-lg"
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
              disabled={!script.trim()}
              label="Render Story Video"
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

          {/* Audio Preview */}
          {audioUrl && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4"
            >
              <p className="mb-3 flex items-center gap-2 text-[13px] font-medium text-white/70">
                <Headphones className="h-4 w-4 text-violet-400" />
                Generated Narration
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
