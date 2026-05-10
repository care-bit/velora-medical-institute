'use client'

import { useEffect, type ReactNode } from 'react'
import { useSearchParams } from 'next/navigation'
import { SchemaProvider, useSchema } from './SchemaProvider'
import { TopBarV2 } from './TopBarV2'
import { InspectorV2 } from './InspectorV2'
import { InserterPanel } from './InserterPanel'
import { PageRenderer } from './PageRenderer'
import { initialHomeSchema } from '@/lib/editor/initial-home'

/**
 * Mounts the schema-driven visual builder when `?edit=1` is in the URL.
 * Renders the homepage schema in place of normal `children`.
 *
 * For now, only the home page (`/`) is editable — `?edit=1` on any other
 * route renders the underlying source children unchanged with a small badge.
 */
export function EditorRoot({ children }: { children: ReactNode }) {
  const params = useSearchParams()
  const isEditing = params.get('edit') === '1' || params.get('edit') === 'true'

  if (!isEditing) return <>{children}</>

  // For the MVP we treat all `?edit=1` pages as the homepage editor.
  // (In the future, route-aware schema selection goes here.)
  return (
    <SchemaProvider initialSchema={initialHomeSchema} pageSlug="home">
      <Chrome />
    </SchemaProvider>
  )
}

function Chrome() {
  const ctx = useSchema()

  // Click outside any block deselects
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!ctx) return
      const t = e.target as HTMLElement | null
      if (!t) return
      if (t.closest('[data-block-id]')) return
      if (t.closest('[data-editor-chrome]')) return
      ctx.select(null)
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [ctx])

  // Keyboard shortcuts
  useEffect(() => {
    if (!ctx) return
    function onKey(e: KeyboardEvent) {
      if (!ctx) return
      const t = e.target as HTMLElement | null
      const typing =
        t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)
      const meta = e.metaKey || e.ctrlKey
      const key = e.key.toLowerCase()

      // Undo / redo always
      if (meta && key === 'z' && !e.shiftKey) {
        e.preventDefault(); ctx.undo(); return
      }
      if (meta && (key === 'y' || (key === 'z' && e.shiftKey))) {
        e.preventDefault(); ctx.redo(); return
      }
      if (meta && key === 's') {
        e.preventDefault(); void ctx.save(); return
      }

      if (typing) return

      if (meta && key === 'd' && ctx.selectedId) {
        e.preventDefault(); ctx.duplicate(ctx.selectedId); return
      }
      if ((key === 'delete' || key === 'backspace') && ctx.selectedId) {
        e.preventDefault(); ctx.remove(ctx.selectedId); return
      }
      if (key === 'escape') {
        ctx.select(null); return
      }
      if (key === 'e' && !meta) {
        ctx.setMode(ctx.mode === 'preview' ? 'edit' : 'preview'); return
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [ctx])

  if (!ctx) return null
  const showChrome = ctx.mode === 'edit'

  return (
    <div className="min-h-screen flex flex-col bg-neutral-100" data-editor-chrome-root>
      {showChrome && <TopBarV2 />}
      <div className="flex-1 flex min-h-0">
        {showChrome && <InserterPanel />}
        <main
          className="flex-1 min-w-0 overflow-y-auto bg-bone"
          data-editor-canvas
        >
          <PageRenderer editMode />
        </main>
        {showChrome && <InspectorV2 />}
      </div>
    </div>
  )
}
