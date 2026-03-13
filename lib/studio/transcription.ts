import OpenAI from 'openai'
import fs from 'fs'
import type { TranscriptSegment } from './types'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function transcribeAudio(audioPath: string): Promise<TranscriptSegment[]> {
  const audioFile = fs.createReadStream(audioPath)

  const response = await openai.audio.transcriptions.create({
    file: audioFile,
    model: 'whisper-1',
    response_format: 'verbose_json',
    timestamp_granularities: ['segment'],
  })

  const segments: TranscriptSegment[] = (response as unknown as {
    segments: Array<{ start: number; end: number; text: string }>
  }).segments.map((seg) => ({
    start: seg.start,
    end: seg.end,
    text: seg.text.trim(),
  }))

  return segments
}

export async function transcribeWithWordTimestamps(audioPath: string): Promise<{
  segments: TranscriptSegment[]
  words: Array<{ start: number; end: number; word: string }>
}> {
  const audioFile = fs.createReadStream(audioPath)

  const response = await openai.audio.transcriptions.create({
    file: audioFile,
    model: 'whisper-1',
    response_format: 'verbose_json',
    timestamp_granularities: ['word', 'segment'],
  })

  const data = response as unknown as {
    segments: Array<{ start: number; end: number; text: string }>
    words: Array<{ start: number; end: number; word: string }>
  }

  return {
    segments: data.segments.map((seg) => ({
      start: seg.start,
      end: seg.end,
      text: seg.text.trim(),
    })),
    words: data.words || [],
  }
}
