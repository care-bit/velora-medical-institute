'use client'

import { useState } from 'react'
import { useSchema } from './SchemaProvider'
import { getBlockDefinition, type PropertyField } from '@/lib/editor/registry'
import { findBlock } from '@/lib/editor/schema'
import { Upload, Loader2 } from 'lucide-react'

const SPACING_HINT = 'e.g. 16px / 2rem / 4%'

export function InspectorV2() {
  const ctx = useSchema()
  if (!ctx) return null

  const id = ctx.selectedId
  if (!id) {
    return (
      <SidebarShell>
        <header className="px-4 py-3 border-b border-neutral-200">
          <p className="text-[10px] tracking-[0.22em] uppercase text-neutral-500 font-semibold">
            Inspector
          </p>
        </header>
        <div className="flex-1 grid place-items-center text-center px-6 text-[13px] text-neutral-500">
          Select a block on the page to edit its properties.
        </div>
      </SidebarShell>
    )
  }

  const block = findBlock(ctx.schema, id)
  if (!block) {
    return (
      <SidebarShell>
        <div className="p-6 text-[13px] text-neutral-500">Block not found.</div>
      </SidebarShell>
    )
  }

  const def = getBlockDefinition(block.type)
  if (!def) {
    return (
      <SidebarShell>
        <div className="p-6 text-[13px] text-red-700">No definition for type {block.type}</div>
      </SidebarShell>
    )
  }

  // Group fields by their `group`
  const groups = new Map<string, PropertyField[]>()
  for (const f of def.schema) {
    const g = f.group ?? 'General'
    if (!groups.has(g)) groups.set(g, [])
    groups.get(g)!.push(f)
  }

  function setProp(key: string, value: unknown) {
    ctx!.patchProps(id!, { [key]: value })
  }

  return (
    <SidebarShell>
      <header className="px-4 py-3 border-b border-neutral-200">
        <p className="text-[10px] tracking-[0.22em] uppercase text-neutral-500 font-semibold">
          Inspector
        </p>
        <p className="mt-1 text-[13px] font-semibold text-neutral-900">{def.label}</p>
        <p className="text-[10.5px] text-neutral-400 font-mono truncate">{id}</p>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {[...groups.entries()].map(([group, fields]) => (
          <section key={group}>
            <p className="text-[9.5px] tracking-[0.22em] uppercase text-neutral-400 font-semibold mb-3">
              {group}
            </p>
            <div className="space-y-3">
              {fields.map((f) => (
                <FieldEditor
                  key={f.key}
                  field={f}
                  value={block.props[f.key]}
                  onChange={(v) => setProp(f.key, v)}
                />
              ))}
            </div>
          </section>
        ))}

        <div className="pt-4 border-t border-neutral-200 flex flex-col gap-2">
          <button
            type="button"
            onClick={() => ctx.duplicate(id)}
            className="text-[11px] tracking-[0.16em] uppercase font-semibold px-3 py-2 rounded border border-neutral-300 text-neutral-700 hover:bg-neutral-100 transition-colors"
          >
            Duplicate block
          </button>
          <button
            type="button"
            onClick={() => ctx.toggleHidden(id)}
            className="text-[11px] tracking-[0.16em] uppercase font-semibold px-3 py-2 rounded border border-neutral-300 text-neutral-700 hover:bg-neutral-100 transition-colors"
          >
            Toggle hidden
          </button>
          <button
            type="button"
            onClick={() => ctx.remove(id)}
            className="text-[11px] tracking-[0.16em] uppercase font-semibold px-3 py-2 rounded border border-red-300 text-red-700 hover:bg-red-50 transition-colors"
          >
            Delete block
          </button>
        </div>
      </div>
    </SidebarShell>
  )
}

function SidebarShell({ children }: { children: React.ReactNode }) {
  return (
    <aside className="w-[300px] shrink-0 border-l border-neutral-200 bg-white text-neutral-900 flex flex-col h-full overflow-hidden" data-editor-chrome>
      {children}
    </aside>
  )
}

/* ------------- per-field editors ------------- */

function FieldEditor({
  field, value, onChange,
}: {
  field: PropertyField
  value: unknown
  onChange: (v: unknown) => void
}) {
  const v = value as string
  switch (field.kind) {
    case 'text':
    case 'cssLength':
      return (
        <Field label={field.label}>
          <Text
            value={v ?? ''}
            onChange={onChange}
            placeholder={field.placeholder ?? (field.kind === 'cssLength' ? SPACING_HINT : undefined)}
          />
        </Field>
      )
    case 'textarea':
      return (
        <Field label={field.label}>
          <textarea
            value={v ?? ''}
            onChange={(e) => onChange(e.target.value)}
            rows={3}
            className="w-full bg-white border border-neutral-300 rounded px-2 py-1.5 text-[12px] resize-y min-h-[60px] focus:outline-none focus:ring-2 focus:ring-brown/30 focus:border-brown"
          />
        </Field>
      )
    case 'number':
      return (
        <Field label={field.label}>
          <input
            type="number"
            value={v ?? ''}
            onChange={(e) => onChange(e.target.valueAsNumber)}
            className="w-full bg-white border border-neutral-300 rounded px-2 py-1.5 text-[12px] focus:outline-none focus:ring-2 focus:ring-brown/30 focus:border-brown"
          />
        </Field>
      )
    case 'color':
      return (
        <Field label={field.label}>
          <ColorInput value={v ?? ''} onChange={onChange} />
        </Field>
      )
    case 'select':
      return (
        <Field label={field.label}>
          <select
            value={v ?? ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full bg-white border border-neutral-300 rounded px-2 py-1.5 text-[12px]"
          >
            {(field.options ?? []).map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </Field>
      )
    case 'image':
      return (
        <Field label={field.label}>
          <ImageInput value={v ?? ''} onChange={onChange} />
        </Field>
      )
    case 'switch':
      return (
        <Field label={field.label}>
          <button
            type="button"
            onClick={() => onChange(!value)}
            className={`px-3 py-1.5 rounded text-[11px] uppercase tracking-wide ${
              value ? 'bg-brown text-cream' : 'bg-white border border-neutral-300 text-neutral-700'
            }`}
          >
            {value ? 'On' : 'Off'}
          </button>
        </Field>
      )
    default:
      return null
  }
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[10px] tracking-[0.18em] uppercase text-neutral-500 font-semibold">
        {label}
      </span>
      {children}
    </label>
  )
}

function Text({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-white border border-neutral-300 rounded px-2 py-1.5 text-[12px] focus:outline-none focus:ring-2 focus:ring-brown/30 focus:border-brown"
    />
  )
}

function ColorInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex gap-1.5 items-center">
      <input
        type="color"
        value={isHex(value) ? value : '#000000'}
        onChange={(e) => onChange(e.target.value)}
        className="size-8 rounded border border-neutral-300 bg-white cursor-pointer shrink-0"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="#000 or rgb(...)"
        className="flex-1 min-w-0 bg-white border border-neutral-300 rounded px-2 py-1.5 text-[12px] font-mono"
      />
    </div>
  )
}

function isHex(v: string) {
  return /^#[0-9a-fA-F]{3,8}$/.test(v)
}

function ImageInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [uploading, setUploading] = useState(false)

  async function handleFile(file: File) {
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/editor/upload', { method: 'POST', body: fd })
      if (res.ok) {
        const json = (await res.json()) as { url?: string }
        if (json.url) onChange(json.url)
      }
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-2">
      {value ? (
        <div
          className="aspect-[4/3] w-full rounded border border-neutral-200 bg-neutral-100 bg-center bg-cover"
          style={{ backgroundImage: `url(${value})` }}
        />
      ) : (
        <div className="aspect-[4/3] w-full rounded border border-dashed border-neutral-300 grid place-items-center text-[11px] text-neutral-400">
          No image
        </div>
      )}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="https://… or /photos/…"
        className="w-full bg-white border border-neutral-300 rounded px-2 py-1.5 text-[12px] font-mono focus:outline-none focus:ring-2 focus:ring-brown/30 focus:border-brown"
      />
      <label className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded border border-neutral-300 text-[11px] tracking-[0.16em] uppercase font-semibold text-neutral-700 hover:bg-neutral-100 cursor-pointer w-full">
        {uploading ? <Loader2 className="size-3.5 animate-spin" /> : <Upload className="size-3.5" />}
        Upload
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) void handleFile(f)
          }}
        />
      </label>
    </div>
  )
}
