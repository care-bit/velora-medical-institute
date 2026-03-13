import { NextRequest, NextResponse } from 'next/server'
import {
  generateStoryScript,
  generateEducationalScript,
  generateListScript,
  generateMotivationalScript,
} from '@/lib/studio/ai'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, prompt, topic, count } = body

    let result: unknown

    switch (type) {
      case 'story':
        result = { script: await generateStoryScript(prompt || topic) }
        break
      case 'educational':
        result = await generateEducationalScript(topic)
        break
      case 'list':
        result = await generateListScript(topic, count || 5)
        break
      case 'motivational':
        result = { script: await generateMotivationalScript(prompt || topic) }
        break
      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }

    return NextResponse.json(result)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Script generation failed'
    console.error('Script generation error:', error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
