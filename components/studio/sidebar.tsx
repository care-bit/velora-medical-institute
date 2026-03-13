'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  BookOpen,
  Clapperboard,
  Download,
  Flame,
  FolderOpen,
  ListOrdered,
  Loader2,
  Scissors,
  Settings,
  Sparkles,
  Video,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const createLinks = [
  { href: '/studio/story', label: 'Story Videos', icon: BookOpen },
  { href: '/studio/educational', label: 'Educational Videos', icon: Sparkles },
  { href: '/studio/list', label: 'List / Ranking', icon: ListOrdered },
  { href: '/studio/clip-cutter', label: 'Clip Cutter', icon: Scissors },
  { href: '/studio/motivational', label: 'Motivational Videos', icon: Flame },
]

const manageLinks = [
  { href: '/studio/projects', label: 'Projects', icon: FolderOpen },
  { href: '/studio/render-queue', label: 'Render Queue', icon: Loader2 },
  { href: '/studio/exports', label: 'Exports', icon: Download },
  { href: '/studio/settings', label: 'Settings', icon: Settings },
]

export function StudioSidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-white/[0.06] bg-[#0A0A0B]">
      {/* Logo */}
      <Link href="/studio" className="flex items-center gap-3 px-6 py-5 border-b border-white/[0.06]">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500">
          <Video className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-[15px] font-semibold text-white tracking-tight">AI Video Studio</h1>
          <p className="text-[11px] text-white/40">by Sightline</p>
        </div>
      </Link>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {/* Create Section */}
        <div>
          <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-widest text-white/30">
            Create
          </p>
          <div className="space-y-0.5">
            {createLinks.map((link) => {
              const isActive = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-all duration-150',
                    isActive
                      ? 'text-white'
                      : 'text-white/50 hover:text-white/80 hover:bg-white/[0.04]'
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active"
                      className="absolute inset-0 rounded-lg bg-white/[0.08] border border-white/[0.06]"
                      transition={{ type: 'spring', bounce: 0.15, duration: 0.5 }}
                    />
                  )}
                  <link.icon className={cn('relative z-10 h-4 w-4', isActive && 'text-violet-400')} />
                  <span className="relative z-10">{link.label}</span>
                </Link>
              )
            })}
          </div>
        </div>

        {/* Manage Section */}
        <div>
          <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-widest text-white/30">
            Manage
          </p>
          <div className="space-y-0.5">
            {manageLinks.map((link) => {
              const isActive = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-all duration-150',
                    isActive
                      ? 'text-white'
                      : 'text-white/50 hover:text-white/80 hover:bg-white/[0.04]'
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active-manage"
                      className="absolute inset-0 rounded-lg bg-white/[0.08] border border-white/[0.06]"
                      transition={{ type: 'spring', bounce: 0.15, duration: 0.5 }}
                    />
                  )}
                  <link.icon className={cn('relative z-10 h-4 w-4', isActive && 'text-violet-400')} />
                  <span className="relative z-10">{link.label}</span>
                </Link>
              )
            })}
          </div>
        </div>
      </nav>

      {/* Footer */}
      <div className="border-t border-white/[0.06] px-4 py-3">
        <div className="rounded-lg bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 border border-violet-500/20 p-3">
          <p className="text-[12px] font-medium text-violet-300">Pro Features</p>
          <p className="text-[11px] text-white/40 mt-0.5">Batch rendering, 4K export</p>
        </div>
      </div>
    </aside>
  )
}
