import { NextRequest, NextResponse } from 'next/server'
import { transcribeAudio, transcribeWithWordTimestamps } from '@/lib/studio/transcription'
import { extractAudio } from '@/lib/studio/ffmpeg'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { filePath, withWords } = body

    if (!filePath) {
      return NextResponse.json({ error: 'filePath is required' }, { status: 400 })
    }

    // Resolve the file path
    const fullPath = filePath.startsWith('/')
      ? path.join(process.cwd(), 'public', filePath)
      : filePath

    // Extract audio if it's a video file
    const ext = path.extname(fullPath).toLowerCase()
    const videoExts = ['.mp4', '.mov', '.avi', '.mkv', '.webm']
    let audioPath = fullPath

    if (videoExts.includes(ext)) {
      audioPath = await extractAudio(fullPath)
    }

    // Transcribe
    if (withWords) {
      const result = await transcribeWithWordTimestamps(audioPath)
      return NextResponse.json(result)
    }

    const segments = await transcribeAudio(audioPath)
    return NextResponse.json({ segments })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Transcription failed'
    console.error('Transcription error:', error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
