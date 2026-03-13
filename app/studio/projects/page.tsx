'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  FolderOpen,
  BookOpen,
  Sparkles,
  ListOrdered,
  Scissors,
  Flame,
  Clock,
  MoreHorizontal,
  Plus,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { RenderJob, VideoType } from '@/lib/studio/types'

const typeIcons: Record<VideoType, typeof BookOpen> = {
  story: BookOpen,
  educational: Sparkles,
  list: ListOrdered,
  'clip-cutter': Scissors,
  motivational: Flame,
}

const typeColors: Record<VideoType, string> = {
  story: 'from-orange-500 to-red-500',
  educational: 'from-blue-500 to-cyan-500',
  list: 'from-emerald-500 to-teal-500',
  'clip-cutter': 'from-violet-500 to-purple-500',
  motivational: 'from-amber-500 to-orange-500',
}

const typeRoutes: Record<VideoType, string> = {
  story: '/studio/story',
  educational: '/studio/educational',
  list: '/studio/list',
  'clip-cutter': '/studio/clip-cutter',
  motivational: '/studio/motivational',
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<RenderJob[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchProjects() {
      try {
        const res = await fetch('/api/studio/render-status')
        const data = await res.json()
        setProjects(data.jobs || [])
      } catch (err) {
        console.error('Failed to fetch projects:', err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchProjects()
  }, [])

  return (
    <div className="px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Projects</h1>
          <p className="text-[14px] text-white/40 mt-1">{projects.length} projects</p>
        </div>
      </motion.div>

      {projects.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-20"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/[0.03] border border-white/[0.06] mb-4">
            <FolderOpen className="h-7 w-7 text-white/15" />
          </div>
          <p className="text-[15px] text-white/40">No projects yet</p>
          <p className="text-[13px] text-white/25 mt-1">Create a video to start a project</p>
          <Link
            href="/studio"
            className="mt-4 flex items-center gap-2 rounded-lg bg-violet-500/10 border border-violet-500/20 px-4 py-2 text-[13px] text-violet-300 hover:bg-violet-500/20 transition-all"
          >
            <Plus className="h-3.5 w-3.5" />
            New Project
          </Link>
        </motion.div>
      ) : (
        <div className="space-y-2">
          {projects.map((project, i) => {
            const Icon = typeIcons[project.type] || FolderOpen
            const gradient = typeColors[project.type] || 'from-gray-500 to-gray-600'

            return (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <Link
                  href={typeRoutes[project.type] || '/studio'}
                  className="flex items-center gap-4 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 hover:bg-white/[0.04] hover:border-white/[0.1] transition-all"
                >
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${gradient}`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-medium text-white truncate">{project.projectName}</p>
                    <div className="flex items-center gap-3 mt-0.5 text-[12px] text-white/30">
                      <span className="capitalize">{project.type}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(project.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <span
                    className={cn(
                      'rounded-full px-2.5 py-1 text-[11px] font-medium',
                      project.status === 'completed' && 'bg-emerald-400/10 text-emerald-400',
                      project.status === 'failed' && 'bg-red-400/10 text-red-400',
                      project.status === 'rendering' && 'bg-violet-400/10 text-violet-400',
                      project.status === 'queued' && 'bg-yellow-400/10 text-yellow-400',
                      project.status === 'processing' && 'bg-blue-400/10 text-blue-400'
                    )}
                  >
                    {project.status}
                  </span>
                </Link>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
