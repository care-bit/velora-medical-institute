'use client'

import { useState } from 'react'
import { VOICE_OPTIONS } from '@/lib/studio/types'
import { cn } from '@/lib/utils'
import { Mic, Play, Square } from 'lucide-react'

interface VoiceSelectorProps {
  value: string
  onChange: (voiceId: string) => void
}

export function VoiceSelector({ value, onChange }: VoiceSelectorProps) {
  const [playingId, setPlayingId] = useState<string | null>(null)

  const grouped = VOICE_OPTIONS.reduce(
    (acc, voice) => {
      const cat = voice.category.split(' - ')[1] || voice.category
      if (!acc[cat]) acc[cat] = []
      acc[cat].push(voice)
      return acc
    },
    {} as Record<string, typeof VOICE_OPTIONS>
  )

  return (
    <div className="space-y-3">
      <label className="flex items-center gap-2 text-[13px] font-medium text-white/70">
        <Mic className="h-4 w-4 text-violet-400" />
        Voice
      </label>
      <div className="grid grid-cols-3 gap-2">
        {VOICE_OPTIONS.map((voice) => (
          <button
            key={voice.id}
            onClick={() => onChange(voice.id)}
            className={cn(
              'relative flex flex-col items-start rounded-lg border px-3 py-2.5 text-left transition-all',
              value === voice.id
                ? 'border-violet-500/50 bg-violet-500/10 text-white'
                : 'border-white/[0.06] bg-white/[0.02] text-white/60 hover:border-white/[0.12] hover:bg-white/[0.04]'
            )}
          >
            <span className="text-[13px] font-medium">{voice.name}</span>
            <span className="text-[11px] text-white/40">{voice.category}</span>
            {value === voice.id && (
              <div className="absolute right-2 top-2 h-2 w-2 rounded-full bg-violet-400" />
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
