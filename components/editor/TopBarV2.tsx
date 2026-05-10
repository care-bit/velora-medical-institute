'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSchema } from './SchemaProvider'
import {
  Undo2, Redo2, Eye, EyeOff, Save, X, Loader2, Check,
} from 'lucide-react'

export function TopBarV2() {
  const router = useRouter()
  const ctx = useSchema()
  const [saving, setSaving] = useState<'idle' | 'saving' | 'saved'>('idle')
  if (!ctx) return null

  async function handleSave() {
    setSaving('saving')
    try {
      await ctx!.save()
      setSaving('saved')
      setTimeout(() => setSaving('idle'), 1400)
    } catch {
      setSaving('idle')
    }
  }

  function exit() {
    const url = new URL(window.location.href)
    url.searchParams.delete('edit')
    router.push(url.pathname + (url.search || ''))
  }

  const isPreview = ctx.mode === 'preview'

  return (
    <header className="h-12 shrink-0 bg-neutral-900 text-neutral-100 border-b border-neutral-800 flex items-center justify-between px-3 z-50" data-editor-chrome>
      <div className="flex items-center gap-1">
        <span className="text-[11px] tracking-[0.24em] uppercase font-semibold mr-3 text-neutral-300">
          Velora · Builder
        </span>
        <Button onClick={ctx.undo} disabled={!ctx.canUndo} title="Undo (⌘Z)">
          <Undo2 className="size-4" />
        </Button>
        <Button onClick={ctx.redo} disabled={!ctx.canRedo} title="Redo (⌘⇧Z)">
          <Redo2 className="size-4" />
        </Button>
      </div>

      <div className="flex items-center gap-2">
        {ctx.dirty && (
          <span className="text-[10px] tracking-[0.2em] uppercase text-amber-300">Unsaved</span>
        )}

        <Button
          onClick={() => ctx.setMode(isPreview ? 'edit' : 'preview')}
          title={isPreview ? 'Back to edit (E)' : 'Preview (E)'}
        >
          {isPreview ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          <span className="text-[11px] tracking-[0.18em] uppercase ml-1.5">
            {isPreview ? 'Edit' : 'Preview'}
          </span>
        </Button>

        <Button
          onClick={handleSave}
          variant="primary"
          disabled={saving !== 'idle'}
          title="Save (⌘S)"
        >
          {saving === 'saving' ? (
            <Loader2 className="size-4 animate-spin" />
          ) : saving === 'saved' ? (
            <Check className="size-4" />
          ) : (
            <Save className="size-4" />
          )}
          <span className="text-[11px] tracking-[0.18em] uppercase ml-1.5">
            {saving === 'saved' ? 'Saved' : 'Save'}
          </span>
        </Button>

        <Button onClick={exit} title="Exit editor">
          <X className="size-4" />
          <span className="text-[11px] tracking-[0.18em] uppercase ml-1.5">Exit</span>
        </Button>
      </div>
    </header>
  )
}

function Button({
  children, onClick, disabled, title, variant = 'ghost',
}: {
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  title?: string
  variant?: 'ghost' | 'primary'
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={[
        'inline-flex items-center px-2.5 py-1.5 rounded transition-colors',
        variant === 'primary'
          ? 'bg-brown text-cream hover:bg-brown-deep disabled:opacity-50'
          : 'text-neutral-100 hover:bg-neutral-800 disabled:opacity-30 disabled:hover:bg-transparent',
      ].join(' ')}
    >
      {children}
    </button>
  )
}
