'use client'

import {
  useState,
  type DragEvent as ReactDragEvent,
  type ReactNode,
} from 'react'
import { useSchema } from './SchemaProvider'
import { getBlockDefinition } from '@/lib/editor/registry'
import type { Block } from '@/lib/editor/schema'
import {
  ArrowUp,
  ArrowDown,
  Copy,
  Trash2,
  Eye,
  EyeOff,
  GripVertical,
} from 'lucide-react'

/**
 * Recursively renders the schema. In edit mode wraps each block with chrome.
 */
export function PageRenderer({ editMode = false }: { editMode?: boolean }) {
  const ctx = useSchema()
  if (!ctx) return null
  return (
    <>
      {ctx.schema.blocks.map((block, i) => (
        <BlockNode
          key={block.id}
          block={block}
          index={i}
          isTopLevel
          editMode={editMode && ctx.mode === 'edit'}
        />
      ))}
    </>
  )
}

function BlockNode({
  block, index, isTopLevel, editMode,
}: {
  block: Block
  index: number
  isTopLevel: boolean
  editMode: boolean
}) {
  const ctx = useSchema()
  const def = getBlockDefinition(block.type)
  const isHidden = block.props.hidden === true

  if (!def) {
    return (
      <div className="bg-red-100 text-red-900 p-4 rounded text-[12px]">
        Unknown block type: <code>{block.type}</code>
      </div>
    )
  }

  if (isHidden && (!ctx || ctx.mode === 'preview')) return null

  const childNodes: ReactNode | undefined = block.children?.length
    ? block.children.map((c, i) => (
        <BlockNode key={c.id} block={c} index={i} isTopLevel={false} editMode={editMode} />
      ))
    : undefined

  const rendered = def.render(block.props, childNodes, { isEditing: editMode })

  if (!editMode) return <>{rendered}</>

  return (
    <BlockChrome
      block={block}
      index={index}
      isTopLevel={isTopLevel}
      isHidden={isHidden}
    >
      {rendered}
    </BlockChrome>
  )
}

function BlockChrome({
  block, index, isTopLevel, isHidden, children,
}: {
  block: Block
  index: number
  isTopLevel: boolean
  isHidden: boolean
  children: ReactNode
}) {
  const ctx = useSchema()
  const [over, setOver] = useState<'top' | 'bottom' | null>(null)

  if (!ctx) return <>{children}</>

  const isSelected = ctx.selectedId === block.id

  function handleClick(e: React.MouseEvent) {
    e.stopPropagation()
    ctx!.select(block.id)
  }

  /* ---------- top-level drag-and-drop reorder ---------- */
  function onDragStart(e: ReactDragEvent) {
    if (!isTopLevel) return
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('application/x-velora-block', block.id)
  }
  function onDragOver(e: ReactDragEvent) {
    if (!isTopLevel) return
    if (e.dataTransfer.types.includes('application/x-velora-block')) {
      e.preventDefault()
      const r = (e.currentTarget as HTMLElement).getBoundingClientRect()
      const isTop = e.clientY - r.top < r.height / 2
      setOver(isTop ? 'top' : 'bottom')
    }
  }
  function onDragLeave() {
    setOver(null)
  }
  function onDrop(e: ReactDragEvent) {
    if (!isTopLevel) return
    const draggedId = e.dataTransfer.getData('application/x-velora-block')
    setOver(null)
    if (!draggedId || draggedId === block.id) return
    e.preventDefault()
    const draggedIndex = ctx!.schema.blocks.findIndex((b) => b.id === draggedId)
    if (draggedIndex < 0) return
    let target = index
    if (over === 'bottom') target = index + 1
    if (draggedIndex < target) target -= 1 // adjust for self removal
    ctx!.move(draggedId, target)
  }

  const wrapClasses = [
    'relative group',
    !isHidden && [
      'transition-all duration-100',
      isSelected
        ? 'outline outline-2 outline-offset-[3px] outline-brown'
        : 'outline outline-1 outline-offset-[3px] outline-transparent hover:outline-brown/40',
    ],
    isHidden && 'opacity-30',
    over === 'top' && 'before:content-[""] before:absolute before:left-0 before:right-0 before:-top-1 before:h-1 before:bg-brown before:rounded-full before:z-50',
    over === 'bottom' && 'after:content-[""] after:absolute after:left-0 after:right-0 after:-bottom-1 after:h-1 after:bg-brown after:rounded-full after:z-50',
  ].flat().filter(Boolean).join(' ')

  return (
    <div
      data-block-id={block.id}
      className={wrapClasses}
      onClick={handleClick}
      draggable={isTopLevel}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      {children}

      {/* Floating block toolbar — visible on hover or when selected */}
      {(isSelected || isTopLevel) && (
        <div
          className={[
            'pointer-events-none absolute z-40 top-2 right-2 flex items-center gap-1',
            isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100',
            'transition-opacity',
          ].join(' ')}
          data-editor-chrome
        >
          <div className="pointer-events-auto bg-neutral-900 text-neutral-100 rounded shadow-md flex items-center gap-0.5 px-1 py-1">
            <span className="px-2 text-[10px] tracking-[0.2em] uppercase font-semibold text-neutral-300">
              {block.type}
            </span>
            {isTopLevel && (
              <ChromeButton
                title="Drag to reorder"
                onMouseDown={(e) => e.stopPropagation()}
              >
                <GripVertical className="size-3.5" />
              </ChromeButton>
            )}
            {isTopLevel && (
              <>
                <ChromeButton
                  title="Move up"
                  onClick={(e) => {
                    e.stopPropagation()
                    ctx.move(block.id, Math.max(0, index - 1))
                  }}
                >
                  <ArrowUp className="size-3.5" />
                </ChromeButton>
                <ChromeButton
                  title="Move down"
                  onClick={(e) => {
                    e.stopPropagation()
                    ctx.move(block.id, index + 1)
                  }}
                >
                  <ArrowDown className="size-3.5" />
                </ChromeButton>
              </>
            )}
            <ChromeButton
              title="Duplicate"
              onClick={(e) => {
                e.stopPropagation()
                ctx.duplicate(block.id)
              }}
            >
              <Copy className="size-3.5" />
            </ChromeButton>
            <ChromeButton
              title={isHidden ? 'Show' : 'Hide'}
              onClick={(e) => {
                e.stopPropagation()
                ctx.toggleHidden(block.id)
              }}
            >
              {isHidden ? <Eye className="size-3.5" /> : <EyeOff className="size-3.5" />}
            </ChromeButton>
            <ChromeButton
              title="Delete"
              onClick={(e) => {
                e.stopPropagation()
                ctx.remove(block.id)
              }}
            >
              <Trash2 className="size-3.5" />
            </ChromeButton>
          </div>
        </div>
      )}
    </div>
  )
}

function ChromeButton({
  children, ...rest
}: { children: ReactNode } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className="inline-flex items-center justify-center size-6 rounded text-neutral-200 hover:bg-neutral-800 hover:text-white transition-colors"
      {...rest}
    >
      {children}
    </button>
  )
}
