'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Settings, Key, Volume2, Monitor, Save, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function SettingsPage() {
  const [openaiKey, setOpenaiKey] = useState('')
  const [elevenLabsKey, setElevenLabsKey] = useState('')
  const [defaultVoice, setDefaultVoice] = useState('george')
  const [defaultSubtitleStyle, setDefaultSubtitleStyle] = useState('bold-white')
  const [defaultMusicVolume, setDefaultMusicVolume] = useState(30)
  const [renderQuality, setRenderQuality] = useState<'standard' | 'high' | 'ultra'>('high')
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    // In production, save to localStorage or backend
    localStorage.setItem(
      'studio-settings',
      JSON.stringify({
        openaiKey,
        elevenLabsKey,
        defaultVoice,
        defaultSubtitleStyle,
        defaultMusicVolume,
        renderQuality,
      })
    )
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="px-8 py-8 max-w-2xl">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-2xl font-bold text-white tracking-tight">Settings</h1>
        <p className="text-[14px] text-white/40 mt-1">Configure your AI Video Studio</p>
      </motion.div>

      <div className="space-y-8">
        {/* API Keys */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Key className="h-4 w-4 text-violet-400" />
            <h2 className="text-[15px] font-semibold text-white">API Keys</h2>
          </div>
          <div className="space-y-4 rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
            <div>
              <label className="block text-[13px] text-white/60 mb-1.5">OpenAI API Key</label>
              <input
                type="password"
                value={openaiKey}
                onChange={(e) => setOpenaiKey(e.target.value)}
                placeholder="sk-..."
                className="w-full rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2.5 text-[13px] text-white placeholder:text-white/20 focus:border-violet-500/50 focus:outline-none focus:ring-1 focus:ring-violet-500/20"
              />
              <p className="text-[11px] text-white/25 mt-1">Used for script generation and Whisper transcription</p>
            </div>
            <div>
              <label className="block text-[13px] text-white/60 mb-1.5">ElevenLabs API Key</label>
              <input
                type="password"
                value={elevenLabsKey}
                onChange={(e) => setElevenLabsKey(e.target.value)}
                placeholder="xi-..."
                className="w-full rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2.5 text-[13px] text-white placeholder:text-white/20 focus:border-violet-500/50 focus:outline-none focus:ring-1 focus:ring-violet-500/20"
              />
              <p className="text-[11px] text-white/25 mt-1">Used for AI voice narration</p>
            </div>
          </div>
        </motion.section>

        {/* Defaults */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Settings className="h-4 w-4 text-violet-400" />
            <h2 className="text-[15px] font-semibold text-white">Defaults</h2>
          </div>
          <div className="space-y-4 rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
            <div>
              <label className="block text-[13px] text-white/60 mb-1.5">Default Music Volume</label>
              <div className="flex items-center gap-3">
                <Volume2 className="h-4 w-4 text-white/30" />
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={defaultMusicVolume}
                  onChange={(e) => setDefaultMusicVolume(Number(e.target.value))}
                  className="flex-1 accent-violet-500"
                />
                <span className="text-[13px] text-white/50 w-8 text-right">{defaultMusicVolume}%</span>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Render Quality */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Monitor className="h-4 w-4 text-violet-400" />
            <h2 className="text-[15px] font-semibold text-white">Render Quality</h2>
          </div>
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
            <div className="grid grid-cols-3 gap-2">
              {(['standard', 'high', 'ultra'] as const).map((q) => (
                <button
                  key={q}
                  onClick={() => setRenderQuality(q)}
                  className={cn(
                    'rounded-lg border py-3 text-[13px] font-medium capitalize transition-all',
                    renderQuality === q
                      ? 'border-violet-500/50 bg-violet-500/10 text-white'
                      : 'border-white/[0.06] bg-white/[0.02] text-white/50 hover:text-white/70'
                  )}
                >
                  {q}
                  <p className="text-[10px] text-white/30 mt-0.5 font-normal">
                    {q === 'standard' && '720p · Fast'}
                    {q === 'high' && '1080p · Balanced'}
                    {q === 'ultra' && '4K · Slow'}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Save */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <button
            onClick={handleSave}
            className={cn(
              'flex items-center gap-2 rounded-xl px-6 py-3 text-[14px] font-semibold transition-all',
              saved
                ? 'bg-emerald-500/20 text-emerald-300'
                : 'bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white hover:opacity-90'
            )}
          >
            {saved ? (
              <>
                <Check className="h-4 w-4" />
                Saved
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Settings
              </>
            )}
          </button>
        </motion.div>
      </div>
    </div>
  )
}
