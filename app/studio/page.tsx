'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  BookOpen,
  Sparkles,
  ListOrdered,
  Scissors,
  Flame,
  ArrowRight,
  Video,
  Clock,
  TrendingUp,
} from 'lucide-react'

const generators = [
  {
    href: '/studio/story',
    title: 'Story Videos',
    description: 'Reddit stories, horror, confessions with narration and gameplay backgrounds',
    icon: BookOpen,
    gradient: 'from-orange-500 to-red-500',
    tag: 'Popular',
  },
  {
    href: '/studio/educational',
    title: 'Educational Videos',
    description: 'Facts, history, "did you know" videos with structured scenes',
    icon: Sparkles,
    gradient: 'from-blue-500 to-cyan-500',
    tag: 'New',
  },
  {
    href: '/studio/list',
    title: 'List / Ranking',
    description: 'Top 10, rankings, comparisons with numbered overlays',
    icon: ListOrdered,
    gradient: 'from-emerald-500 to-teal-500',
    tag: null,
  },
  {
    href: '/studio/clip-cutter',
    title: 'Clip Cutter',
    description: 'Upload long videos, AI detects viral moments, auto-cut to 9:16',
    icon: Scissors,
    gradient: 'from-violet-500 to-purple-500',
    tag: 'Opus Style',
  },
  {
    href: '/studio/motivational',
    title: 'Motivational Videos',
    description: 'Gym edits, speeches, entrepreneur content with cinematic style',
    icon: Flame,
    gradient: 'from-amber-500 to-orange-500',
    tag: null,
  },
]

const stats = [
  { label: 'Videos Created', value: '0', icon: Video },
  { label: 'Render Time Saved', value: '0h', icon: Clock },
  { label: 'Total Views', value: '0', icon: TrendingUp },
]

export default function StudioDashboard() {
  return (
    <div className="px-8 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-2xl font-bold text-white tracking-tight">Dashboard</h1>
        <p className="text-[14px] text-white/40 mt-1">Select a generator to start creating</p>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="grid grid-cols-3 gap-4 mb-8"
      >
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[12px] text-white/40">{stat.label}</p>
                <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
              </div>
              <stat.icon className="h-5 w-5 text-white/10" />
            </div>
          </div>
        ))}
      </motion.div>

      {/* Generators */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6"
      >
        <h2 className="text-[15px] font-semibold text-white mb-4">Video Generators</h2>
        <div className="grid grid-cols-2 gap-3">
          {generators.map((gen, i) => (
            <motion.div
              key={gen.href}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.03 }}
            >
              <Link
                href={gen.href}
                className="group relative flex items-start gap-4 rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 transition-all hover:border-white/[0.12] hover:bg-white/[0.04]"
              >
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${gen.gradient} shadow-lg`}
                >
                  <gen.icon className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-[14px] font-semibold text-white">{gen.title}</h3>
                    {gen.tag && (
                      <span className="rounded-full bg-violet-500/10 border border-violet-500/20 px-2 py-0.5 text-[10px] font-medium text-violet-300">
                        {gen.tag}
                      </span>
                    )}
                  </div>
                  <p className="text-[12px] text-white/40 mt-1 line-clamp-2">{gen.description}</p>
                </div>
                <ArrowRight className="h-4 w-4 shrink-0 text-white/20 group-hover:text-white/50 transition-colors mt-1" />
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <h2 className="text-[15px] font-semibold text-white mb-4">Quick Start</h2>
        <div className="grid grid-cols-3 gap-3">
          <Link
            href="/studio/story"
            className="rounded-xl border border-dashed border-white/[0.08] bg-white/[0.01] p-4 text-center transition-all hover:border-violet-500/30 hover:bg-violet-500/[0.03]"
          >
            <p className="text-[13px] text-white/50">Paste a Reddit Story</p>
          </Link>
          <Link
            href="/studio/clip-cutter"
            className="rounded-xl border border-dashed border-white/[0.08] bg-white/[0.01] p-4 text-center transition-all hover:border-violet-500/30 hover:bg-violet-500/[0.03]"
          >
            <p className="text-[13px] text-white/50">Upload a Video to Clip</p>
          </Link>
          <Link
            href="/studio/motivational"
            className="rounded-xl border border-dashed border-white/[0.08] bg-white/[0.01] p-4 text-center transition-all hover:border-violet-500/30 hover:bg-violet-500/[0.03]"
          >
            <p className="text-[13px] text-white/50">Generate a Motivational Edit</p>
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
