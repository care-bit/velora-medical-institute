import { NextResponse } from 'next/server'
import { generatePlaceholderBackgrounds } from '@/lib/studio/ffmpeg'

export async function POST() {
  try {
    await generatePlaceholderBackgrounds()
    return NextResponse.json({ success: true, message: 'Background videos generated' })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Setup failed'
    console.error('Setup error:', error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
