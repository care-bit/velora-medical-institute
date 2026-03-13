'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Loader2, Sparkles, Copy, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ScriptEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  type: 'story' | 'educational' | 'list' | 'motivational'
  generatePromptPlaceholder?: string
  rows?: number
}

export function ScriptEditor({
  value,
  onChange,
  placeholder = 'Write your script here...',
  type,
  generatePromptPlaceholder = 'Describe the content you want...',
  rows = 8,
}: ScriptEditorProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [prompt, setPrompt] = useState('')
  const [showGenerate, setShowGenerate] = useState(!value)

  const handleGenerate = async () => {
    if (!prompt.trim()) return
    setIsGenerating(true)
    try {
      const res = await fetch('/api/studio/generate-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, prompt, topic: prompt }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)

      if (type === 'story' || type === 'motivational') {
        onChange(data.script)
      } else if (type === 'educational') {
        const sceneTexts = data.scenes?.map((s: { text: string }) => s.text).join('\n\n') || ''
        onChange(sceneTexts)
      } else if (type === 'list') {
        const itemTexts = data.items
          ?.map((i: { rank: number; title: string; description: string }) =>
            `#${i.rank} - ${i.title}\n${i.description}`
          )
          .join('\n\n') || ''
        onChange(itemTexts)
      }
      setShowGenerate(false)
    } catch (err) {
      console.error('Generation failed:', err)
    } finally {
      setIsGenerating(false)
    }
  }

  const wordCount = value.trim().split(/\s+/).filter(Boolean).length
  const estimatedDuration = Math.round(wordCount / 2.5) // ~150 words per minute

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-[13px] font-medium text-white/70">Script</label>
        <div className="flex items-center gap-3 text-[11px] text-white/30">
          <span>{wordCount} words</span>
          <span>~{estimatedDuration}s</span>
        </div>
      </div>

      {/* AI Generate bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
            placeholder={generatePromptPlaceholder}
            className="w-full rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-[13px] text-white placeholder:text-white/25 focus:border-violet-500/50 focus:outline-none focus:ring-1 focus:ring-violet-500/20"
          />
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleGenerate}
          disabled={isGenerating || !prompt.trim()}
          className={cn(
            'flex items-center gap-2 rounded-lg px-4 py-2 text-[13px] font-medium transition-all',
            isGenerating
              ? 'bg-violet-500/20 text-violet-300'
              : 'bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white hover:opacity-90 disabled:opacity-30'
          )}
        >
          {isGenerating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          {isGenerating ? 'Generating...' : 'Generate'}
        </motion.button>
      </div>

      {/* Text editor */}
      <div className="relative">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          className="w-full rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-[13px] leading-relaxed text-white/90 placeholder:text-white/20 focus:border-violet-500/50 focus:outline-none focus:ring-1 focus:ring-violet-500/20 resize-none"
        />

        {/* Actions */}
        {value && (
          <div className="absolute bottom-3 right-3 flex gap-1.5">
            <button
              onClick={() => navigator.clipboard.writeText(value)}
              className="rounded-md bg-white/[0.04] p-1.5 text-white/30 hover:text-white/60 hover:bg-white/[0.08] transition-all"
              title="Copy"
            >
              <Copy className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => { onChange(''); setShowGenerate(true) }}
              className="rounded-md bg-white/[0.04] p-1.5 text-white/30 hover:text-white/60 hover:bg-white/[0.08] transition-all"
              title="Clear"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
