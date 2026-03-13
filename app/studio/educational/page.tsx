'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles,
  Loader2,
  Plus,
  Trash2,
  Clock,
  Eye,
  GripVertical,
  BookOpen,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { VoiceSelector } from '@/components/studio/voice-selector'
import { SubtitleStylePicker } from '@/components/studio/subtitle-style-picker'
import { RenderButton } from '@/components/studio/render-button'
import { VideoPreview } from '@/components/studio/video-preview'

interface Scene {
  id: string
  text: string
  duration: number
  visualDescription: string
}

export default function EducationalVideoGenerator() {
  const [topic, setTopic] = useState('')
  const [scenes, setScenes] = useState<Scene[]>([])
  const [voiceId, setVoiceId] = useState('sarah')
  const [subtitleStyle, setSubtitleStyle] = useState('clean-minimal')
  const [isGenerating, setIsGenerating] = useState(false)
  const [outputUrl, setOutputUrl] = useState<string | null>(null)

  const totalDuration = scenes.reduce((sum, s) => sum + s.duration, 0)

  const generateScript = async () => {
    if (!topic.trim() || isGenerating) return
    setIsGenerating(true)

    try {
      const res = await fetch('/api/studio/generate-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'educational', topic }),
      })

      const data = await res.json()

      if (data.scenes && Array.isArray(data.scenes)) {
        setScenes(
          data.scenes.map((scene: Partial<Scene>, i: number) => ({
            id: `scene-${Date.now()}-${i}`,
            text: scene.text || '',
            duration: scene.duration || 5,
            visualDescription: scene.visualDescription || '',
          }))
        )
      }
    } catch (err) {
      console.error('Failed to generate script:', err)
    } finally {
      setIsGenerating(false)
    }
  }

  const updateScene = (id: string, updates: Partial<Scene>) => {
    setScenes((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
    )
  }

  const removeScene = (id: string) => {
    setScenes((prev) => prev.filter((s) => s.id !== id))
  }

  const addScene = () => {
    setScenes((prev) => [
      ...prev,
      {
        id: `scene-${Date.now()}`,
        text: '',
        duration: 5,
        visualDescription: '',
      },
    ])
  }

  const handleRender = async (): Promise<string> => {
    const res = await fetch('/api/studio/render', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'educational',
        projectName: `Educational: ${topic}`,
        script: scenes.map((s) => s.text).join(' '),
        voiceId,
        subtitleStyleId: subtitleStyle,
        backgroundVideo: 'space',
      }),
    })

    const data = await res.json()
    return data.jobId
  }

  return (
    <div className="flex h-full gap-6 px-8 py-8">
      {/* Left Column - Configuration (60%) */}
      <div className="w-[60%] space-y-6 overflow-y-auto pr-2">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-3 mb-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Educational Video Generator
              </h1>
              <p className="text-[13px] text-white/40">
                Create facts, history, and documentary-style videos with
                structured scenes
              </p>
            </div>
          </div>
        </motion.div>

        {/* Topic Input */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="space-y-2"
        >
          <label className="flex items-center gap-2 text-[13px] font-medium text-white/70">
            <BookOpen className="h-4 w-4 text-violet-400" />
            Topic
          </label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder='e.g., "The history of the Roman Empire" or "5 facts about black holes"'
            className="w-full rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-[14px] text-white placeholder-white/20 outline-none transition-all focus:border-violet-500/50 focus:bg-white/[0.04]"
            onKeyDown={(e) => {
              if (e.key === 'Enter') generateScript()
            }}
          />
        </motion.div>

        {/* Generate Button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={generateScript}
            disabled={!topic.trim() || isGenerating}
            className={cn(
              'flex w-full items-center justify-center gap-2 rounded-xl py-3 text-[14px] font-semibold transition-all',
              topic.trim() && !isGenerating
                ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:opacity-90'
                : 'bg-white/[0.04] text-white/20 cursor-not-allowed'
            )}
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating Script...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Generate Script
              </>
            )}
          </motion.button>
        </motion.div>

        {/* Scene Editor */}
        <AnimatePresence mode="wait">
          {scenes.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-3"
            >
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-[13px] font-medium text-white/70">
                  <Eye className="h-4 w-4 text-violet-400" />
                  Scenes ({scenes.length})
                </label>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 text-[12px] text-white/30">
                    <Clock className="h-3 w-3" />
                    Total: {totalDuration}s
                  </span>
                  <button
                    onClick={addScene}
                    className="flex items-center gap-1 rounded-lg border border-white/[0.06] bg-white/[0.02] px-2.5 py-1.5 text-[12px] text-white/50 transition-all hover:border-white/[0.12] hover:text-white/70"
                  >
                    <Plus className="h-3 w-3" />
                    Add Scene
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {scenes.map((scene, index) => (
                  <motion.div
                    key={scene.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="group rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 transition-all hover:border-white/[0.1]"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <GripVertical className="h-4 w-4 text-white/10" />
                        <span className="flex h-6 w-6 items-center justify-center rounded-md bg-violet-500/10 text-[11px] font-bold text-violet-400">
                          {index + 1}
                        </span>
                        <span className="text-[12px] text-white/40">
                          Scene {index + 1}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.02] px-2 py-1">
                          <Clock className="h-3 w-3 text-white/30" />
                          <input
                            type="number"
                            min={1}
                            max={60}
                            value={scene.duration}
                            onChange={(e) =>
                              updateScene(scene.id, {
                                duration: parseInt(e.target.value) || 1,
                              })
                            }
                            className="w-10 bg-transparent text-center text-[12px] text-white/70 outline-none"
                          />
                          <span className="text-[11px] text-white/30">sec</span>
                        </div>
                        <button
                          onClick={() => removeScene(scene.id)}
                          className="rounded-lg p-1.5 text-white/20 transition-all hover:bg-red-500/10 hover:text-red-400"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Scene Text */}
                    <textarea
                      value={scene.text}
                      onChange={(e) =>
                        updateScene(scene.id, { text: e.target.value })
                      }
                      placeholder="Scene narration text..."
                      rows={3}
                      className="mb-3 w-full resize-none rounded-lg border border-white/[0.04] bg-white/[0.02] px-3 py-2.5 text-[13px] text-white/80 placeholder-white/15 outline-none transition-all focus:border-violet-500/30 focus:bg-white/[0.04]"
                    />

                    {/* Visual Description */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] text-white/30">
                        Visual Description
                      </label>
                      <input
                        type="text"
                        value={scene.visualDescription}
                        onChange={(e) =>
                          updateScene(scene.id, {
                            visualDescription: e.target.value,
                          })
                        }
                        placeholder="Describe the visual for this scene..."
                        className="w-full rounded-lg border border-white/[0.04] bg-white/[0.02] px-3 py-2 text-[12px] text-white/60 placeholder-white/15 outline-none transition-all focus:border-violet-500/30 focus:bg-white/[0.04]"
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Voice Selector */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <VoiceSelector value={voiceId} onChange={setVoiceId} />
        </motion.div>

        {/* Subtitle Style Picker */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <SubtitleStylePicker value={subtitleStyle} onChange={setSubtitleStyle} />
        </motion.div>

        {/* Render Button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <RenderButton
            onClick={handleRender}
            disabled={scenes.length === 0 || !topic.trim()}
            label="Render Educational Video"
            onComplete={(url) => setOutputUrl(url)}
          />
        </motion.div>
      </div>

      {/* Right Column - Preview (40%) */}
      <div className="w-[40%] space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="sticky top-8"
        >
          {/* Video Preview */}
          <div className="mb-4">
            <VideoPreview
              src={outputUrl || undefined}
              aspectRatio="9/16"
              className="w-full"
            />
          </div>

          {/* Scene Timeline */}
          {scenes.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="text-[13px] font-medium text-white/70">
                  Scene Timeline
                </span>
                <span className="text-[12px] text-white/30">
                  {totalDuration}s total
                </span>
              </div>

              {/* Timeline Bar */}
              <div className="mb-3 flex h-2 w-full overflow-hidden rounded-full bg-white/[0.04]">
                {scenes.map((scene, i) => (
                  <div
                    key={scene.id}
                    className={cn(
                      'h-full transition-all',
                      i % 4 === 0 && 'bg-violet-500/60',
                      i % 4 === 1 && 'bg-blue-500/60',
                      i % 4 === 2 && 'bg-cyan-500/60',
                      i % 4 === 3 && 'bg-fuchsia-500/60'
                    )}
                    style={{
                      width:
                        totalDuration > 0
                          ? `${(scene.duration / totalDuration) * 100}%`
                          : '0%',
                    }}
                  />
                ))}
              </div>

              {/* Scene List */}
              <div className="space-y-1.5 max-h-[300px] overflow-y-auto">
                {scenes.map((scene, index) => (
                  <div
                    key={scene.id}
                    className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition-all hover:bg-white/[0.03]"
                  >
                    <span
                      className={cn(
                        'flex h-5 w-5 shrink-0 items-center justify-center rounded text-[10px] font-bold',
                        index % 4 === 0 &&
                          'bg-violet-500/15 text-violet-400',
                        index % 4 === 1 && 'bg-blue-500/15 text-blue-400',
                        index % 4 === 2 && 'bg-cyan-500/15 text-cyan-400',
                        index % 4 === 3 &&
                          'bg-fuchsia-500/15 text-fuchsia-400'
                      )}
                    >
                      {index + 1}
                    </span>
                    <span className="flex-1 truncate text-[12px] text-white/50">
                      {scene.text || 'Empty scene'}
                    </span>
                    <span className="shrink-0 text-[11px] text-white/25">
                      {scene.duration}s
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
