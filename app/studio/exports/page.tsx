'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Download, Play, Trash2, FileVideo, Film, Calendar, HardDrive } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { RenderJob } from '@/lib/studio/types'

export default function ExportsPage() {
  const [exports, setExports] = useState<RenderJob[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchExports() {
      try {
        const res = await fetch('/api/studio/render-status')
        const data = await res.json()
        const completed = (data.jobs || []).filter((j: RenderJob) => j.status === 'completed')
        setExports(completed)
      } catch (err) {
        console.error('Failed to fetch exports:', err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchExports()
  }, [])

  return (
    <div className="px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-2xl font-bold text-white tracking-tight">Exports</h1>
        <p className="text-[14px] text-white/40 mt-1">{exports.length} videos exported</p>
      </motion.div>

      {exports.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-20"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/[0.03] border border-white/[0.06] mb-4">
            <Download className="h-7 w-7 text-white/15" />
          </div>
          <p className="text-[15px] text-white/40">No exports yet</p>
          <p className="text-[13px] text-white/25 mt-1">Completed renders will appear here</p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {exports.map((exp, i) => (
            <motion.div
              key={exp.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="group rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden"
            >
              {/* Video thumbnail / preview */}
              <div className="relative aspect-video bg-black">
                {exp.outputPath ? (
                  <video
                    src={exp.outputPath}
                    className="h-full w-full object-cover"
                    preload="metadata"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <Film className="h-8 w-8 text-white/10" />
                  </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                  <a
                    href={exp.outputPath}
                    target="_blank"
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-md"
                  >
                    <Play className="h-4 w-4 text-white ml-0.5" fill="white" />
                  </a>
                </div>
                <div className="absolute top-2 right-2 rounded-md bg-black/60 px-1.5 py-0.5 text-[10px] text-white/60">
                  9:16
                </div>
              </div>

              {/* Info */}
              <div className="p-3">
                <p className="text-[13px] font-medium text-white truncate">{exp.projectName}</p>
                <div className="flex items-center gap-3 mt-1.5 text-[11px] text-white/30">
                  <span className="flex items-center gap-1">
                    <FileVideo className="h-3 w-3" />
                    {exp.type}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(exp.completedAt || exp.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex gap-2 mt-3">
                  {exp.outputPath && (
                    <a
                      href={exp.outputPath}
                      download
                      className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-violet-500/10 border border-violet-500/20 py-1.5 text-[12px] text-violet-300 hover:bg-violet-500/20 transition-all"
                    >
                      <Download className="h-3 w-3" />
                      Download MP4
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
