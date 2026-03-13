import { NextRequest, NextResponse } from 'next/server'
import { detectEngagingClips } from '@/lib/studio/ai'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { transcript } = body

    if (!transcript || !Array.isArray(transcript)) {
      return NextResponse.json({ error: 'transcript array is required' }, { status: 400 })
    }

    const clips = await detectEngagingClips(transcript)
    return NextResponse.json({ clips })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Clip detection failed'
    console.error('Clip detection error:', error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
