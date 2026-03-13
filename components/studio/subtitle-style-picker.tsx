'use client'

import { SUBTITLE_PRESETS } from '@/lib/studio/types'
import { cn } from '@/lib/utils'
import { Type } from 'lucide-react'

interface SubtitleStylePickerProps {
  value: string
  onChange: (styleId: string) => void
}

export function SubtitleStylePicker({ value, onChange }: SubtitleStylePickerProps) {
  return (
    <div className="space-y-3">
      <label className="flex items-center gap-2 text-[13px] font-medium text-white/70">
        <Type className="h-4 w-4 text-violet-400" />
        Subtitle Style
      </label>
      <div className="grid grid-cols-5 gap-2">
        {SUBTITLE_PRESETS.map((style) => (
          <button
            key={style.id}
            onClick={() => onChange(style.id)}
            className={cn(
              'group relative flex flex-col items-center justify-center rounded-lg border p-3 transition-all',
              value === style.id
                ? 'border-violet-500/50 bg-violet-500/10'
                : 'border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12]'
            )}
          >
            {/* Preview */}
            <div
              className="flex h-10 items-center justify-center rounded bg-black/60 px-2 w-full mb-1.5"
              style={{ border: '1px solid rgba(255,255,255,0.05)' }}
            >
              <span
                className="text-[11px] font-bold truncate"
                style={{
                  color: style.fontColor,
                  textShadow: `0 0 4px ${style.strokeColor}`,
                  fontFamily: style.fontFamily,
                }}
              >
                Sample
              </span>
            </div>
            <span className="text-[11px] text-white/50 group-hover:text-white/70 truncate w-full text-center">
              {style.name}
            </span>
            {value === style.id && (
              <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-violet-400 border-2 border-[#0A0A0B]" />
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
