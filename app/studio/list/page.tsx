'use client'

import { useState } from 'react'
import { motion, AnimatePresence, Reorder } from 'framer-motion'
import {
  ListOrdered,
  Sparkles,
  Loader2,
  GripVertical,
  Plus,
  Trash2,
  ChevronDown,
  SlidersHorizontal,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { VoiceSelector } from '@/components/studio/voice-selector'
import { SubtitleStylePicker } from '@/components/studio/subtitle-style-picker'
import { RenderButton } from '@/components/studio/render-button'
import { VideoPreview } from '@/components/studio/video-preview'

interface ListItem {
  rank: number
  title: string
  description: string
  visualDescription: string
}

export default function ListRankingPage() {
  const [topic, setTopic] = useState('')
  const [count, setCount] = useState(5)
  const [items, setItems] = useState<ListItem[]>([])
  const [transitionStyle, setTransitionStyle] = useState<'slide' | 'fade' | 'zoom'>('slide')
  const [voiceId, setVoiceId] = useState('adam')
  const [subtitleStyle, setSubtitleStyle] = useState('youtube-red')
  const [isGenerating, setIsGenerating] = useState(false)
  const [outputUrl, setOutputUrl] = useState<string | null>(null)

  const handleGenerate = async () => {
    if (!topic.trim()) return
    setIsGenerating(true)
    try {
      const res = await fetch('/api/studio/generate-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'list', topic, count }),
      })
      const data = await res.json()
      if (data.items && Array.isArray(data.items)) {
        setItems(data.items.map((item: Partial<ListItem>, i: number) => ({
          rank: i + 1,
          title: item.title || '',
          description: item.description || '',
          visualDescription: item.visualDescription || '',
        })))
      }
    } catch (err) {
      console.error('Failed to generate list:', err)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleRender = async (): Promise<string> => {
    const res = await fetch('/api/studio/render', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'list',
        projectName: `Top ${count}: ${topic}`,
        items,
        voiceId,
        subtitleStyleId: subtitleStyle,
        transition: transitionStyle,
      }),
    })
    const data = await res.json()
    return data.jobId
  }

  const updateItem = (index: number, field: keyof ListItem, value: string) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    )
  }

  const removeItem = (index: number) => {
    setItems((prev) => {
      const next = prev.filter((_, i) => i !== index)
      return next.map((item, i) => ({ ...item, rank: i + 1 }))
    })
  }

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      {
        rank: prev.length + 1,
        title: '',
        description: '',
        visualDescription: '',
      },
    ])
  }

  const handleReorder = (newItems: ListItem[]) => {
    setItems(newItems.map((item, i) => ({ ...item, rank: i + 1 })))
  }

  return (
    <div className="flex h-full gap-6 px-8 py-8">
      {/* Left Column - 60% */}
      <div className="w-[60%] space-y-6 overflow-y-auto pr-2 pb-8 custom-scrollbar">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-3 mb-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg">
              <ListOrdered className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">
                List / Ranking Generator
              </h1>
              <p className="text-[13px] text-white/40">
                Top 10 videos, rankings, comparisons
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
          <label className="text-[13px] font-medium text-white/70">Topic</label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g., Scariest horror movies of all time"
            className="w-full rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-[14px] text-white placeholder:text-white/20 outline-none transition-all focus:border-violet-500/50 focus:bg-white/[0.04]"
          />
        </motion.div>

        {/* Count Selector */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="space-y-2"
        >
          <label className="text-[13px] font-medium text-white/70">
            Number of Items
          </label>
          <div className="relative w-40">
            <select
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              className="w-full appearance-none rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-2.5 text-[14px] text-white outline-none transition-all focus:border-violet-500/50 focus:bg-white/[0.04] cursor-pointer"
            >
              {Array.from({ length: 8 }, (_, i) => i + 3).map((n) => (
                <option key={n} value={n} className="bg-[#0A0A0B] text-white">
                  {n} items
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
          </div>
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
            onClick={handleGenerate}
            disabled={!topic.trim() || isGenerating}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-3 text-[14px] font-semibold text-white transition-all hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Generate List
              </>
            )}
          </motion.button>
        </motion.div>

        {/* List Items Editor */}
        <AnimatePresence>
          {items.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-3"
            >
              <div className="flex items-center justify-between">
                <label className="text-[13px] font-medium text-white/70">
                  List Items
                </label>
                <button
                  onClick={addItem}
                  className="flex items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-1.5 text-[12px] text-white/50 transition-all hover:border-white/[0.12] hover:text-white/70"
                >
                  <Plus className="h-3 w-3" />
                  Add Item
                </button>
              </div>

              <Reorder.Group
                axis="y"
                values={items}
                onReorder={handleReorder}
                className="space-y-3"
              >
                {items.map((item, index) => (
                  <Reorder.Item
                    key={`item-${item.rank}-${index}`}
                    value={item}
                    className="group"
                  >
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className="relative flex gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 transition-all hover:border-white/[0.1] hover:bg-white/[0.03]"
                    >
                      {/* Drag Handle + Rank */}
                      <div className="flex flex-col items-center gap-2 pt-1">
                        <GripVertical className="h-4 w-4 cursor-grab text-white/15 active:cursor-grabbing group-hover:text-white/30" />
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 border border-violet-500/20">
                          <span className="bg-gradient-to-br from-violet-300 to-fuchsia-300 bg-clip-text text-lg font-bold text-transparent">
                            {item.rank}
                          </span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 space-y-2.5 min-w-0">
                        <input
                          type="text"
                          value={item.title}
                          onChange={(e) => updateItem(index, 'title', e.target.value)}
                          placeholder="Item title..."
                          className="w-full rounded-lg border border-white/[0.04] bg-white/[0.02] px-3 py-2 text-[14px] font-semibold text-white placeholder:text-white/20 outline-none transition-all focus:border-violet-500/30 focus:bg-white/[0.04]"
                        />
                        <textarea
                          value={item.description}
                          onChange={(e) => updateItem(index, 'description', e.target.value)}
                          placeholder="Description or narration for this item..."
                          rows={2}
                          className="w-full resize-none rounded-lg border border-white/[0.04] bg-white/[0.02] px-3 py-2 text-[13px] text-white/80 placeholder:text-white/20 outline-none transition-all focus:border-violet-500/30 focus:bg-white/[0.04]"
                        />
                        <input
                          type="text"
                          value={item.visualDescription}
                          onChange={(e) => updateItem(index, 'visualDescription', e.target.value)}
                          placeholder="Visual description (what to show on screen)..."
                          className="w-full rounded-lg border border-dashed border-white/[0.06] bg-white/[0.01] px-3 py-2 text-[12px] text-white/50 placeholder:text-white/15 outline-none transition-all focus:border-violet-500/30 focus:bg-white/[0.03]"
                        />
                      </div>

                      {/* Delete */}
                      <button
                        onClick={() => removeItem(index)}
                        className="shrink-0 self-start rounded-lg p-1.5 text-white/10 transition-all hover:bg-red-500/10 hover:text-red-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </motion.div>
                  </Reorder.Item>
                ))}
              </Reorder.Group>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Transition Style Selector */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="space-y-3"
        >
          <label className="flex items-center gap-2 text-[13px] font-medium text-white/70">
            <SlidersHorizontal className="h-4 w-4 text-violet-400" />
            Transition Style
          </label>
          <div className="flex gap-2">
            {(['slide', 'fade', 'zoom'] as const).map((style) => (
              <button
                key={style}
                onClick={() => setTransitionStyle(style)}
                className={cn(
                  'rounded-lg border px-5 py-2.5 text-[13px] font-medium capitalize transition-all',
                  transitionStyle === style
                    ? 'border-violet-500/50 bg-violet-500/10 text-white'
                    : 'border-white/[0.06] bg-white/[0.02] text-white/50 hover:border-white/[0.12] hover:text-white/70'
                )}
              >
                {style}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Voice Selector */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.14 }}
        >
          <VoiceSelector value={voiceId} onChange={setVoiceId} />
        </motion.div>

        {/* Subtitle Style Picker */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.16 }}
        >
          <SubtitleStylePicker value={subtitleStyle} onChange={setSubtitleStyle} />
        </motion.div>

        {/* Render Button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
        >
          <RenderButton
            onClick={handleRender}
            disabled={items.length === 0}
            label="Render List Video"
            onComplete={(url) => setOutputUrl(url)}
          />
        </motion.div>
      </div>

      {/* Right Column - 40% */}
      <div className="w-[40%] space-y-4 overflow-y-auto pb-8 custom-scrollbar">
        {/* Video Preview */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <VideoPreview
            src={outputUrl || undefined}
            aspectRatio="9/16"
            showDownload={!!outputUrl}
          />
        </motion.div>

        {/* List Preview */}
        <AnimatePresence>
          {items.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 space-y-2"
            >
              <p className="text-[12px] font-medium text-white/40 mb-3">
                List Preview
              </p>
              {items.map((item, index) => (
                <motion.div
                  key={`preview-${index}`}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.04 }}
                  className="flex items-start gap-3 rounded-lg border border-white/[0.04] bg-white/[0.02] px-3 py-2.5 transition-all"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 border border-violet-500/15">
                    <span className="bg-gradient-to-br from-violet-300 to-fuchsia-300 bg-clip-text text-[13px] font-bold text-transparent">
                      {item.rank}
                    </span>
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-medium text-white truncate">
                      {item.title || 'Untitled item'}
                    </p>
                    {item.description && (
                      <p className="text-[11px] text-white/30 line-clamp-1 mt-0.5">
                        {item.description}
                      </p>
                    )}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
