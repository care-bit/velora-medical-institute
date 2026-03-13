'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Loader2,
  Check,
  X,
  Clock,
  Trash2,
  RefreshCw,
  Play,
  Download,
  FileVideo,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { RenderJob } from '@/lib/studio/types'

const statusConfig = {
  queued: { icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-400/10', label: 'Queued' },
  processing: { icon: Loader2, color: 'text-blue-400', bg: 'bg-blue-400/10', label: 'Processing' },
  rendering: { icon: Loader2, color: 'text-violet-400', bg: 'bg-violet-400/10', label: 'Rendering' },
  completed: { icon: Check, color: 'text-emerald-400', bg: 'bg-emerald-400/10', label: 'Completed' },
  failed: { icon: X, color: 'text-red-400', bg: 'bg-red-400/10', label: 'Failed' },
}

export default function RenderQueuePage() {
  const [jobs, setJobs] = useState<RenderJob[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchJobs = async () => {
    try {
      const res = await fetch('/api/studio/render-status')
      const data = await res.json()
      setJobs(data.jobs || [])
    } catch (err) {
      console.error('Failed to fetch jobs:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchJobs()
    const interval = setInterval(fetchJobs, 3000)
    return () => clearInterval(interval)
  }, [])

  const activeJobs = jobs.filter((j) => j.status === 'queued' || j.status === 'processing' || j.status === 'rendering')
  const completedJobs = jobs.filter((j) => j.status === 'completed')
  const failedJobs = jobs.filter((j) => j.status === 'failed')

  return (
    <div className="px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Render Queue</h1>
          <p className="text-[14px] text-white/40 mt-1">
            {activeJobs.length} active · {completedJobs.length} completed · {failedJobs.length} failed
          </p>
        </div>
        <button
          onClick={fetchJobs}
          className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-[13px] text-white/60 hover:text-white/80 hover:bg-white/[0.04] transition-all"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </button>
      </motion.div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-white/20" />
        </div>
      ) : jobs.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-20"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/[0.03] border border-white/[0.06] mb-4">
            <FileVideo className="h-7 w-7 text-white/15" />
          </div>
          <p className="text-[15px] text-white/40">No render jobs yet</p>
          <p className="text-[13px] text-white/25 mt-1">Start a render from any generator</p>
        </motion.div>
      ) : (
        <div className="space-y-6">
          {/* Active Renders */}
          {activeJobs.length > 0 && (
            <div>
              <h2 className="text-[13px] font-semibold text-white/50 uppercase tracking-wider mb-3">
                Active Renders
              </h2>
              <div className="space-y-2">
                {activeJobs.map((job) => (
                  <RenderJobCard key={job.id} job={job} />
                ))}
              </div>
            </div>
          )}

          {/* Completed */}
          {completedJobs.length > 0 && (
            <div>
              <h2 className="text-[13px] font-semibold text-white/50 uppercase tracking-wider mb-3">
                Completed
              </h2>
              <div className="space-y-2">
                {completedJobs.map((job) => (
                  <RenderJobCard key={job.id} job={job} />
                ))}
              </div>
            </div>
          )}

          {/* Failed */}
          {failedJobs.length > 0 && (
            <div>
              <h2 className="text-[13px] font-semibold text-white/50 uppercase tracking-wider mb-3">
                Failed
              </h2>
              <div className="space-y-2">
                {failedJobs.map((job) => (
                  <RenderJobCard key={job.id} job={job} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function RenderJobCard({ job }: { job: RenderJob }) {
  const config = statusConfig[job.status]
  const StatusIcon = config.icon
  const isAnimating = job.status === 'processing' || job.status === 'rendering'

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4"
    >
      <div className="flex items-center gap-4">
        <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg', config.bg)}>
          <StatusIcon className={cn('h-4 w-4', config.color, isAnimating && 'animate-spin')} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-[14px] font-medium text-white truncate">{job.projectName}</p>
            <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-medium', config.bg, config.color)}>
              {config.label}
            </span>
          </div>
          <p className="text-[12px] text-white/30 mt-0.5">
            {job.type} · {new Date(job.createdAt).toLocaleString()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {job.status === 'completed' && job.outputPath && (
            <>
              <a
                href={job.outputPath}
                target="_blank"
                className="flex items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-1.5 text-[12px] text-white/60 hover:text-white/80 transition-all"
              >
                <Play className="h-3 w-3" />
                Preview
              </a>
              <a
                href={job.outputPath}
                download
                className="flex items-center gap-1.5 rounded-lg bg-violet-500/10 border border-violet-500/20 px-3 py-1.5 text-[12px] text-violet-300 hover:bg-violet-500/20 transition-all"
              >
                <Download className="h-3 w-3" />
                Download
              </a>
            </>
          )}
        </div>
      </div>

      {/* Progress bar for active jobs */}
      {(job.status === 'processing' || job.status === 'rendering') && (
        <div className="mt-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] text-white/30">Progress</span>
            <span className="text-[11px] text-white/50">{job.progress}%</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-white/[0.06]">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500"
              initial={{ width: 0 }}
              animate={{ width: `${job.progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      )}

      {/* Error message */}
      {job.status === 'failed' && job.error && (
        <p className="mt-2 text-[12px] text-red-400/70 bg-red-500/5 rounded-lg px-3 py-2">
          {job.error}
        </p>
      )}
    </motion.div>
  )
}
