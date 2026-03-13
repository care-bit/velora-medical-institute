'use client'

import { useState } from 'react'
import { BACKGROUND_VIDEOS } from '@/lib/studio/types'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Film,
  Search,
  Youtube,
  Download,
  Loader2,
  Check,
  Image as ImageIcon,
  X,
  RefreshCw,
} from 'lucide-react'

interface BackgroundSelectorProps {
  value: string
  onChange: (videoId: string) => void
}

type Tab = 'presets' | 'stock' | 'youtube'

interface StockResult {
  id: string
  url: string
  thumbnail: string
  duration: number
}

export function BackgroundSelector({ value, onChange }: BackgroundSelectorProps) {
  const [tab, setTab] = useState<Tab>('presets')
  const [stockQuery, setStockQuery] = useState('')
  const [stockResults, setStockResults] = useState<StockResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isDownloading, setIsDownloading] = useState<string | null>(null)
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [ytDownloading, setYtDownloading] = useState(false)
  const [ytStatus, setYtStatus] = useState<string | null>(null)
  const [fetchingAll, setFetchingAll] = useState(false)

  const grouped = BACKGROUND_VIDEOS.reduce(
    (acc, vid) => {
      if (!acc[vid.category]) acc[vid.category] = []
      acc[vid.category].push(vid)
      return acc
    },
    {} as Record<string, typeof BACKGROUND_VIDEOS>
  )

  const handleStockSearch = async () => {
    if (!stockQuery.trim()) return
    setIsSearching(true)
    try {
      const res = await fetch(`/api/studio/stock-footage?query=${encodeURIComponent(stockQuery)}&orientation=portrait&perPage=8`)
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setStockResults(data.videos || [])
    } catch (err) {
      console.error('Stock search failed:', err)
    } finally {
      setIsSearching(false)
    }
  }

  const handleStockDownload = async (video: StockResult, saveName: string) => {
    setIsDownloading(video.id)
    try {
      const res = await fetch('/api/studio/stock-footage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoUrl: video.url, saveName: `${saveName}.mp4` }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      onChange(saveName)
    } catch (err) {
      console.error('Download failed:', err)
    } finally {
      setIsDownloading(null)
    }
  }

  const handleYoutubeDownload = async () => {
    if (!youtubeUrl.trim()) return
    setYtDownloading(true)
    setYtStatus('Downloading...')
    try {
      const res = await fetch('/api/studio/youtube-download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: youtubeUrl,
          saveAs: 'background',
          convertVertical: true,
          maxDuration: 120,
        }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setYtStatus(`Downloaded: ${data.title}`)
      // Extract filename without extension as the ID
      const id = data.publicUrl.split('/').pop()?.replace('.mp4', '') || ''
      onChange(id)
      setYoutubeUrl('')
    } catch (err) {
      setYtStatus(err instanceof Error ? err.message : 'Download failed')
    } finally {
      setYtDownloading(false)
    }
  }

  const handleFetchAllStock = async () => {
    setFetchingAll(true)
    try {
      const res = await fetch('/api/studio/stock-footage?action=fetch-all')
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setFetchingAll(false)
    } catch {
      setFetchingAll(false)
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-[13px] font-medium text-white/70">
          <Film className="h-4 w-4 text-violet-400" />
          Background Video
        </label>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg bg-white/[0.03] p-1 border border-white/[0.04]">
        {([
          { id: 'presets', label: 'Presets', icon: Film },
          { id: 'stock', label: 'Stock Footage', icon: ImageIcon },
          { id: 'youtube', label: 'YouTube', icon: Youtube },
        ] as const).map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              'flex flex-1 items-center justify-center gap-1.5 rounded-md py-1.5 text-[12px] font-medium transition-all',
              tab === t.id
                ? 'bg-white/[0.08] text-white'
                : 'text-white/40 hover:text-white/60'
            )}
          >
            <t.icon className="h-3 w-3" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Presets tab */}
      <AnimatePresence mode="wait">
        {tab === 'presets' && (
          <motion.div
            key="presets"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="space-y-3"
          >
            {/* Fetch all real backgrounds button */}
            <button
              onClick={handleFetchAllStock}
              disabled={fetchingAll}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-white/[0.08] py-2 text-[11px] text-white/30 hover:text-white/50 hover:border-white/[0.15] transition-all"
            >
              {fetchingAll ? (
                <><Loader2 className="h-3 w-3 animate-spin" /> Fetching real footage from Pexels...</>
              ) : (
                <><RefreshCw className="h-3 w-3" /> Replace placeholders with real stock footage</>
              )}
            </button>

            {Object.entries(grouped).map(([category, videos]) => (
              <div key={category}>
                <p className="text-[11px] text-white/30 uppercase tracking-wider mb-1.5 px-1">{category}</p>
                <div className="grid grid-cols-4 gap-1.5">
                  {videos.map((video) => (
                    <button
                      key={video.id}
                      onClick={() => onChange(video.id)}
                      className={cn(
                        'flex flex-col items-center gap-1 rounded-lg border p-2.5 transition-all',
                        value === video.id
                          ? 'border-violet-500/50 bg-violet-500/10'
                          : 'border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12] hover:bg-white/[0.04]'
                      )}
                    >
                      <span className="text-xl">{video.thumbnail}</span>
                      <span className="text-[10px] text-white/50 truncate w-full text-center">
                        {video.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {/* Stock Footage tab */}
        {tab === 'stock' && (
          <motion.div
            key="stock"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="space-y-3"
          >
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/25" />
                <input
                  type="text"
                  value={stockQuery}
                  onChange={(e) => setStockQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleStockSearch()}
                  placeholder="Search Pexels... (e.g. 'ocean waves', 'gym workout')"
                  className="w-full rounded-lg border border-white/[0.06] bg-white/[0.02] pl-9 pr-3 py-2 text-[12px] text-white placeholder:text-white/20 focus:border-violet-500/50 focus:outline-none"
                />
              </div>
              <button
                onClick={handleStockSearch}
                disabled={isSearching}
                className="rounded-lg bg-violet-500/10 border border-violet-500/20 px-3 text-[12px] text-violet-300 hover:bg-violet-500/20 transition-all disabled:opacity-50"
              >
                {isSearching ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Search'}
              </button>
            </div>

            {stockResults.length > 0 && (
              <div className="grid grid-cols-2 gap-2 max-h-[280px] overflow-y-auto pr-1">
                {stockResults.map((video) => (
                  <div
                    key={video.id}
                    className="group relative rounded-lg border border-white/[0.06] overflow-hidden"
                  >
                    <img
                      src={video.thumbnail}
                      alt=""
                      className="w-full aspect-[9/16] object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        onClick={() => handleStockDownload(video, `stock-${video.id}`)}
                        disabled={isDownloading === video.id}
                        className="flex items-center gap-1.5 rounded-lg bg-violet-500 px-3 py-1.5 text-[11px] font-medium text-white"
                      >
                        {isDownloading === video.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Download className="h-3 w-3" />
                        )}
                        Use This
                      </button>
                    </div>
                    <div className="absolute bottom-1 right-1 rounded bg-black/60 px-1 py-0.5 text-[9px] text-white/60">
                      {video.duration}s
                    </div>
                  </div>
                ))}
              </div>
            )}

            {stockResults.length === 0 && !isSearching && (
              <div className="text-center py-6">
                <ImageIcon className="h-6 w-6 text-white/10 mx-auto mb-2" />
                <p className="text-[12px] text-white/25">Search for free stock footage from Pexels</p>
                <p className="text-[11px] text-white/15 mt-1">Requires PEXELS_API_KEY in .env.local</p>
              </div>
            )}
          </motion.div>
        )}

        {/* YouTube tab */}
        {tab === 'youtube' && (
          <motion.div
            key="youtube"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="space-y-3"
          >
            <p className="text-[11px] text-white/30">
              Paste a YouTube link to download as a background video. Max 2 minutes, auto-cropped to 9:16.
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleYoutubeDownload()}
                placeholder="https://youtube.com/watch?v=..."
                className="flex-1 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-[12px] text-white placeholder:text-white/20 focus:border-violet-500/50 focus:outline-none"
              />
              <button
                onClick={handleYoutubeDownload}
                disabled={ytDownloading || !youtubeUrl.trim()}
                className="flex items-center gap-1.5 rounded-lg bg-red-500/10 border border-red-500/20 px-3 text-[12px] text-red-300 hover:bg-red-500/20 transition-all disabled:opacity-30"
              >
                {ytDownloading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Youtube className="h-3.5 w-3.5" />
                )}
                Download
              </button>
            </div>

            {ytStatus && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  'rounded-lg px-3 py-2 text-[12px]',
                  ytStatus.startsWith('Downloaded')
                    ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                    : ytStatus === 'Downloading...'
                      ? 'bg-blue-500/10 text-blue-300 border border-blue-500/20'
                      : 'bg-red-500/10 text-red-300 border border-red-500/20'
                )}
              >
                <div className="flex items-center justify-between">
                  <span>{ytStatus}</span>
                  <button onClick={() => setYtStatus(null)} className="text-white/30 hover:text-white/50">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              </motion.div>
            )}

            <div className="rounded-lg border border-white/[0.04] bg-white/[0.01] p-3">
              <p className="text-[11px] text-white/20">
                Requires yt-dlp installed on your system for best results.
                <br />
                Run: <code className="text-violet-300/50">winget install yt-dlp</code>
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
