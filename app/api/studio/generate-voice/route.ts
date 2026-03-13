import { NextRequest, NextResponse } from 'next/server'
import { generateVoiceNarration } from '@/lib/studio/voice'
import { v4 as uuidv4 } from 'uuid'
import path from 'path'
import fs from 'fs/promises'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { text, voiceId } = body

    if (!text || !voiceId) {
      return NextResponse.json({ error: 'text and voiceId are required' }, { status: 400 })
    }

    const audioBuffer = await generateVoiceNarration(text, voiceId)

    const outputDir = path.join(process.cwd(), 'public', 'studio', 'renders')
    await fs.mkdir(outputDir, { recursive: true })

    const fileName = `${uuidv4()}.mp3`
    const filePath = path.join(outputDir, fileName)
    await fs.writeFile(filePath, audioBuffer)

    return NextResponse.json({
      audioUrl: `/studio/renders/${fileName}`,
      filePath,
      duration: null, // Client can determine from audio element
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Voice generation failed'
    console.error('Voice generation error:', error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
