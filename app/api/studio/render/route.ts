import { NextRequest, NextResponse } from 'next/server'
import { createRenderJob, updateRenderJob } from '@/lib/studio/render-queue'
import { renderStoryVideo, cutClip, generateSRT, resolveBackgroundVideo } from '@/lib/studio/ffmpeg'
import { generateVoiceNarration } from '@/lib/studio/voice'
import { transcribeWithWordTimestamps } from '@/lib/studio/transcription'
import { DEFAULT_RENDER_CONFIG } from '@/lib/studio/types'
import { v4 as uuidv4 } from 'uuid'
import path from 'path'
import fs from 'fs/promises'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, projectName, config: userConfig, ...params } = body

    const config = { ...DEFAULT_RENDER_CONFIG, ...userConfig }

    const job = createRenderJob({
      projectName: projectName || `${type} video`,
      type,
      config,
    })

    // Start rendering in background
    processRender(job.id, type, params, config).catch((error) => {
      console.error('Render failed:', error)
      updateRenderJob(job.id, {
        status: 'failed',
        error: error instanceof Error ? error.message : 'Render failed',
        completedAt: new Date().toISOString(),
      })
    })

    return NextResponse.json({ jobId: job.id, status: 'queued' })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Render request failed'
    console.error('Render error:', error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

async function processRender(
  jobId: string,
  type: string,
  params: Record<string, unknown>,
  config: typeof DEFAULT_RENDER_CONFIG
) {
  updateRenderJob(jobId, {
    status: 'processing',
    progress: 10,
    startedAt: new Date().toISOString(),
  })

  const rendersDir = path.join(process.cwd(), 'public', 'studio', 'renders')
  await fs.mkdir(rendersDir, { recursive: true })

  let outputPath: string

  switch (type) {
    case 'story':
    case 'educational':
    case 'motivational': {
      // Step 1: Generate voice if we have text but no audio file
      let audioPath = params.audioPath as string | undefined
      const scriptText = (params.speechText || params.script || '') as string

      if (!audioPath && scriptText) {
        updateRenderJob(jobId, { progress: 20, status: 'processing' })
        const voiceId = (params.voiceId as string) || 'josh'
        const audioBuffer = await generateVoiceNarration(scriptText, voiceId)
        audioPath = path.join(rendersDir, `${uuidv4()}.mp3`)
        await fs.writeFile(audioPath, audioBuffer)
      }

      if (!audioPath) {
        throw new Error('No audio available - provide audioPath or script text with voice')
      }

      // Step 2: Transcribe the audio to get word timestamps for subtitles
      updateRenderJob(jobId, { progress: 40, status: 'processing' })
      let srtPath = params.srtPath as string | undefined
      if (!srtPath) {
        try {
          const transcription = await transcribeWithWordTimestamps(audioPath)
          srtPath = await generateSRT(transcription.segments)
        } catch {
          // If transcription fails, create a simple SRT from the script
          const words = scriptText.split(/\s+/)
          const avgWPS = 2.5 // words per second
          const segments: Array<{ start: number; end: number; text: string }> = []
          const chunkSize = 8
          for (let i = 0; i < words.length; i += chunkSize) {
            const chunk = words.slice(i, i + chunkSize).join(' ')
            const start = (i / avgWPS)
            const end = ((i + chunkSize) / avgWPS)
            segments.push({ start, end, text: chunk })
          }
          srtPath = await generateSRT(segments)
        }
      }

      // Step 3: Resolve background video
      updateRenderJob(jobId, { progress: 60, status: 'rendering' })
      let bgVideoPath = params.backgroundVideoPath as string | undefined
      if (!bgVideoPath) {
        const clips = params.backgroundClips as string[] | undefined
        const bgId = (params.backgroundVideo || (clips && clips[0]) || 'minecraft') as string
        bgVideoPath = resolveBackgroundVideo(Array.isArray(bgId) ? bgId[0] : bgId)
      }

      // Step 4: Render
      outputPath = await renderStoryVideo({
        audioPath,
        backgroundVideoPath: bgVideoPath,
        srtPath,
        subtitleStyleId: (params.subtitleStyleId as string) || 'bold-white',
        backgroundMusicPath: params.backgroundMusicPath as string | undefined,
        musicVolume: (params.musicVolume as number) ?? 30,
        config,
      })
      break
    }

    case 'list': {
      // For list videos, generate voice for each item, then combine
      const items = params.items as Array<{ rank: number; title: string; description: string }> | undefined
      if (!items || items.length === 0) throw new Error('No list items provided')

      const voiceId = (params.voiceId as string) || 'adam'
      const audioSegments: Array<{ audioPath: string; rank: number; title: string }> = []
      const allSegments: Array<{ start: number; end: number; text: string }> = []
      let currentTime = 0

      updateRenderJob(jobId, { progress: 20, status: 'processing' })

      for (const item of items) {
        const narrationText = `Number ${item.rank}. ${item.title}. ${item.description}`
        const audioBuffer = await generateVoiceNarration(narrationText, voiceId)
        const segAudioPath = path.join(rendersDir, `${uuidv4()}.mp3`)
        await fs.writeFile(segAudioPath, audioBuffer)
        audioSegments.push({ audioPath: segAudioPath, rank: item.rank, title: item.title })

        // Estimate duration (rough: 150 wpm)
        const wordCount = narrationText.split(/\s+/).length
        const duration = wordCount / 2.5
        allSegments.push({ start: currentTime, end: currentTime + duration, text: narrationText })
        currentTime += duration
      }

      updateRenderJob(jobId, { progress: 50, status: 'rendering' })

      // Concat all audio into one file using FFmpeg
      const concatListPath = path.join(rendersDir, `${uuidv4()}_list.txt`)
      const concatContent = audioSegments.map((s) => `file '${s.audioPath.replace(/\\/g, '/')}'`).join('\n')
      await fs.writeFile(concatListPath, concatContent, 'utf-8')

      const FFMPEG_BIN = process.env.FFMPEG_PATH ||
        'C:\\Users\\pourb\\AppData\\Local\\Microsoft\\WinGet\\Packages\\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\\ffmpeg-8.0.1-full_build\\bin'
      const FFMPEG = `"${path.join(FFMPEG_BIN, 'ffmpeg.exe')}"`
      const { exec } = require('child_process')
      const { promisify } = require('util')
      const execAsync = promisify(exec)

      const combinedAudio = path.join(rendersDir, `${uuidv4()}.mp3`)
      await execAsync(`${FFMPEG} -y -f concat -safe 0 -i "${concatListPath}" -c copy "${combinedAudio}"`, { timeout: 120000 })

      // Generate SRT
      const srtPath = await generateSRT(allSegments)

      // Resolve background
      const bgVideoPath = resolveBackgroundVideo('city-timelapse')

      outputPath = await renderStoryVideo({
        audioPath: combinedAudio,
        backgroundVideoPath: bgVideoPath,
        srtPath,
        subtitleStyleId: (params.subtitleStyleId as string) || 'youtube-red',
        config,
      })

      // Cleanup
      await fs.unlink(concatListPath).catch(() => {})
      break
    }

    case 'clip-cutter': {
      updateRenderJob(jobId, { progress: 30, status: 'rendering' })

      let srtPath: string | undefined
      if (params.segments) {
        srtPath = await generateSRT(
          params.segments as Array<{ start: number; end: number; text: string }>
        )
      }

      // Resolve the source video path
      let sourceVideoPath = params.sourceVideoPath as string
      if (sourceVideoPath.startsWith('/')) {
        sourceVideoPath = path.join(process.cwd(), 'public', sourceVideoPath)
      }

      outputPath = await cutClip({
        sourceVideoPath,
        startTime: params.startTime as number,
        endTime: params.endTime as number,
        srtPath,
        subtitleStyleId: params.subtitleStyleId as string | undefined,
        config,
      })
      break
    }

    default:
      throw new Error(`Unknown render type: ${type}`)
  }

  // Convert absolute path to public URL
  const publicDir = path.join(process.cwd(), 'public')
  const publicPath = outputPath
    .replace(publicDir.replace(/\\/g, '/'), '')
    .replace(publicDir, '')
    .replace(/\\/g, '/')

  updateRenderJob(jobId, {
    status: 'completed',
    progress: 100,
    outputPath: publicPath,
    completedAt: new Date().toISOString(),
  })
}
