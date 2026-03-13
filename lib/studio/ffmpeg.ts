import { exec } from 'child_process'
import { promisify } from 'util'
import path from 'path'
import fs from 'fs/promises'
import { v4 as uuidv4 } from 'uuid'
import { DEFAULT_RENDER_CONFIG, type RenderConfig, type SubtitleStyle, SUBTITLE_PRESETS } from './types'

const execAsync = promisify(exec)

// FFmpeg binary path - winget installs here on Windows
const FFMPEG_BIN_DIR = process.env.FFMPEG_PATH ||
  'C:\\Users\\pourb\\AppData\\Local\\Microsoft\\WinGet\\Packages\\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\\ffmpeg-8.0.1-full_build\\bin'
const FFMPEG = `"${path.join(FFMPEG_BIN_DIR, 'ffmpeg.exe')}"`
const FFPROBE = `"${path.join(FFMPEG_BIN_DIR, 'ffprobe.exe')}"`

const OUTPUT_DIR = path.join(process.cwd(), 'public', 'studio', 'renders')
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'studio', 'uploads')
const BACKGROUNDS_DIR = path.join(process.cwd(), 'public', 'studio', 'backgrounds')

async function ensureDir(dir: string) {
  await fs.mkdir(dir, { recursive: true })
}

/** Resolve a background video ID to an actual file path */
export function resolveBackgroundVideo(videoId: string): string {
  return path.join(BACKGROUNDS_DIR, `${videoId}.mp4`)
}

export function getSubtitleFilter(style: SubtitleStyle, srtPath: string): string {
  return `subtitles='${srtPath.replace(/\\/g, '/').replace(/:/g, '\\:')}':force_style='FontName=${style.fontFamily},FontSize=${style.fontSize},PrimaryColour=&H${hexToASS(style.fontColor)},OutlineColour=&H${hexToASS(style.strokeColor)},BorderStyle=1,Outline=${style.strokeWidth},Shadow=0,MarginV=${style.position === 'bottom' ? 60 : style.position === 'top' ? 60 : 0}'`
}

function hexToASS(hex: string): string {
  const clean = hex.replace('#', '')
  if (clean.length === 8) {
    const a = clean.substring(6, 8)
    const r = clean.substring(4, 6)
    const g = clean.substring(2, 4)
    const b = clean.substring(0, 2)
    return `${a}${b}${g}${r}`
  }
  const r = clean.substring(0, 2)
  const g = clean.substring(2, 4)
  const b = clean.substring(4, 6)
  return `00${b}${g}${r}`
}

export async function generateSRT(
  segments: Array<{ start: number; end: number; text: string }>
): Promise<string> {
  await ensureDir(OUTPUT_DIR)
  const srtPath = path.join(OUTPUT_DIR, `${uuidv4()}.srt`)

  const srtContent = segments
    .map((seg, i) => {
      const startTC = secondsToTimecode(seg.start)
      const endTC = secondsToTimecode(seg.end)
      return `${i + 1}\n${startTC} --> ${endTC}\n${seg.text}\n`
    })
    .join('\n')

  await fs.writeFile(srtPath, srtContent, 'utf-8')
  return srtPath
}

function secondsToTimecode(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  const ms = Math.round((seconds % 1) * 1000)
  return `${pad(h)}:${pad(m)}:${pad(s)},${pad3(ms)}`
}

function pad(n: number): string {
  return n.toString().padStart(2, '0')
}

function pad3(n: number): string {
  return n.toString().padStart(3, '0')
}

export async function renderStoryVideo(params: {
  audioPath: string
  backgroundVideoPath: string
  srtPath: string
  subtitleStyleId: string
  backgroundMusicPath?: string
  musicVolume?: number
  config?: RenderConfig
}): Promise<string> {
  const config = params.config || DEFAULT_RENDER_CONFIG
  const subtitleStyle = SUBTITLE_PRESETS.find((s) => s.id === params.subtitleStyleId) || SUBTITLE_PRESETS[0]
  await ensureDir(OUTPUT_DIR)
  const outputPath = path.join(OUTPUT_DIR, `${uuidv4()}.mp4`)

  const subtitleFilter = getSubtitleFilter(subtitleStyle, params.srtPath)

  let filterComplex: string
  let audioMapping: string

  if (params.backgroundMusicPath && params.musicVolume !== undefined) {
    const vol = params.musicVolume / 100
    filterComplex = [
      `[0:v]scale=${config.width}:${config.height}:force_original_aspect_ratio=increase,crop=${config.width}:${config.height},${subtitleFilter}[vout]`,
      `[1:a]volume=1.0[narration]`,
      `[2:a]volume=${vol}[music]`,
      `[narration][music]amix=inputs=2:duration=first[aout]`,
    ].join(';')
    audioMapping = '-map "[vout]" -map "[aout]"'
  } else {
    filterComplex = `[0:v]scale=${config.width}:${config.height}:force_original_aspect_ratio=increase,crop=${config.width}:${config.height},${subtitleFilter}[vout]`
    audioMapping = '-map "[vout]" -map 1:a'
  }

  const inputs = [
    `-i "${params.backgroundVideoPath}"`,
    `-i "${params.audioPath}"`,
    params.backgroundMusicPath ? `-i "${params.backgroundMusicPath}"` : '',
  ]
    .filter(Boolean)
    .join(' ')

  const cmd = `${FFMPEG} -y ${inputs} -filter_complex "${filterComplex}" ${audioMapping} -c:v ${config.codec} -b:v ${config.videoBitrate} -c:a aac -b:a ${config.audioBitrate} -r ${config.fps} -shortest "${outputPath}"`

  await execAsync(cmd, { timeout: 300000 })
  return outputPath
}

export async function renderListVideo(params: {
  audioSegments: Array<{ audioPath: string; rank: number; title: string }>
  srtPath: string
  subtitleStyleId: string
  transition: 'slide' | 'fade' | 'zoom'
  config?: RenderConfig
}): Promise<string> {
  const config = params.config || DEFAULT_RENDER_CONFIG
  await ensureDir(OUTPUT_DIR)
  const outputPath = path.join(OUTPUT_DIR, `${uuidv4()}.mp4`)

  const concatListPath = path.join(OUTPUT_DIR, `${uuidv4()}_concat.txt`)
  const concatContent = params.audioSegments
    .map((seg) => `file '${seg.audioPath.replace(/\\/g, '/')}'`)
    .join('\n')
  await fs.writeFile(concatListPath, concatContent, 'utf-8')

  const subtitleStyle = SUBTITLE_PRESETS.find((s) => s.id === params.subtitleStyleId) || SUBTITLE_PRESETS[0]

  const cmd = [
    `${FFMPEG} -y`,
    `-f concat -safe 0 -i "${concatListPath}"`,
    `-f lavfi -i "color=c=black:s=${config.width}x${config.height}:r=${config.fps}"`,
    `-filter_complex "[1:v]${getSubtitleFilter(subtitleStyle, params.srtPath)}[vout]"`,
    `-map "[vout]" -map 0:a`,
    `-c:v ${config.codec} -b:v ${config.videoBitrate}`,
    `-c:a aac -b:a ${config.audioBitrate}`,
    `-r ${config.fps} -shortest`,
    `"${outputPath}"`,
  ].join(' ')

  await execAsync(cmd, { timeout: 300000 })
  await fs.unlink(concatListPath).catch(() => {})

  return outputPath
}

export async function cutClip(params: {
  sourceVideoPath: string
  startTime: number
  endTime: number
  srtPath?: string
  subtitleStyleId?: string
  config?: RenderConfig
}): Promise<string> {
  const config = params.config || DEFAULT_RENDER_CONFIG
  await ensureDir(OUTPUT_DIR)
  const outputPath = path.join(OUTPUT_DIR, `${uuidv4()}.mp4`)

  const duration = params.endTime - params.startTime

  let filterComplex = `[0:v]scale=${config.width}:${config.height}:force_original_aspect_ratio=increase,crop=${config.width}:${config.height}`

  if (params.srtPath && params.subtitleStyleId) {
    const subtitleStyle = SUBTITLE_PRESETS.find((s) => s.id === params.subtitleStyleId) || SUBTITLE_PRESETS[0]
    filterComplex += `,${getSubtitleFilter(subtitleStyle, params.srtPath)}`
  }

  filterComplex += '[vout]'

  const cmd = [
    `${FFMPEG} -y`,
    `-ss ${params.startTime} -t ${duration}`,
    `-i "${params.sourceVideoPath}"`,
    `-filter_complex "${filterComplex}"`,
    `-map "[vout]" -map 0:a`,
    `-c:v ${config.codec} -b:v ${config.videoBitrate}`,
    `-c:a aac -b:a ${config.audioBitrate}`,
    `-r ${config.fps}`,
    `"${outputPath}"`,
  ].join(' ')

  await execAsync(cmd, { timeout: 300000 })
  return outputPath
}

export async function getVideoDuration(filePath: string): Promise<number> {
  const { stdout } = await execAsync(
    `${FFPROBE} -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${filePath}"`
  )
  return parseFloat(stdout.trim())
}

export async function extractAudio(videoPath: string): Promise<string> {
  await ensureDir(OUTPUT_DIR)
  const audioPath = path.join(OUTPUT_DIR, `${uuidv4()}.wav`)
  await execAsync(
    `${FFMPEG} -y -i "${videoPath}" -vn -acodec pcm_s16le -ar 16000 -ac 1 "${audioPath}"`
  )
  return audioPath
}

/** Generate placeholder background videos using FFmpeg (colored gradients with motion) */
export async function generatePlaceholderBackgrounds(): Promise<void> {
  await ensureDir(BACKGROUNDS_DIR)

  const backgrounds = [
    { id: 'minecraft', color1: '2d5a27', color2: '1a3a17', label: 'Minecraft Parkour' },
    { id: 'subway-surfers', color1: '2196F3', color2: '0D47A1', label: 'Subway Surfers' },
    { id: 'gta-driving', color1: 'FF6F00', color2: '4A148C', label: 'GTA Driving' },
    { id: 'satisfying', color1: 'E91E63', color2: '9C27B0', label: 'Satisfying' },
    { id: 'cooking', color1: 'FF8F00', color2: 'D84315', label: 'Cooking ASMR' },
    { id: 'nature', color1: '1B5E20', color2: '004D40', label: 'Nature Scenery' },
    { id: 'city-timelapse', color1: '1A237E', color2: '0D47A1', label: 'City Timelapse' },
    { id: 'ocean-waves', color1: '006064', color2: '01579B', label: 'Ocean Waves' },
    { id: 'space', color1: '0a001a', color2: '1a0033', label: 'Space Footage' },
    { id: 'gym', color1: 'B71C1C', color2: '1B1B1B', label: 'Gym Footage' },
    { id: 'running', color1: 'E65100', color2: '3E2723', label: 'Running' },
  ]

  for (const bg of backgrounds) {
    const outPath = path.join(BACKGROUNDS_DIR, `${bg.id}.mp4`)
    // Check if already exists
    try {
      await fs.access(outPath)
      continue // already exists
    } catch {
      // doesn't exist, create it
    }

    // Create a 60s animated gradient background at 9:16 with scrolling noise
    const cmd = [
      `${FFMPEG} -y`,
      `-f lavfi -i "gradients=s=1080x1920:c0=#${bg.color1}:c1=#${bg.color2}:duration=60:speed=1:r=30"`,
      `-f lavfi -i "anullsrc=channel_layout=stereo:sample_rate=44100"`,
      `-t 60`,
      `-c:v libx264 -preset ultrafast -crf 28`,
      `-c:a aac -b:a 128k`,
      `-pix_fmt yuv420p`,
      `-shortest`,
      `"${outPath}"`,
    ].join(' ')

    try {
      await execAsync(cmd, { timeout: 120000 })
      console.log(`Created background: ${bg.id}`)
    } catch (err) {
      // Fallback: simple color background if gradients filter not available
      const fallbackCmd = [
        `${FFMPEG} -y`,
        `-f lavfi -i "color=c=#${bg.color1}:s=1080x1920:d=60:r=30"`,
        `-f lavfi -i "anullsrc=channel_layout=stereo:sample_rate=44100"`,
        `-t 60`,
        `-c:v libx264 -preset ultrafast -crf 28`,
        `-c:a aac -b:a 128k`,
        `-pix_fmt yuv420p`,
        `-shortest`,
        `"${outPath}"`,
      ].join(' ')

      try {
        await execAsync(fallbackCmd, { timeout: 120000 })
        console.log(`Created background (fallback): ${bg.id}`)
      } catch (e) {
        console.error(`Failed to create background ${bg.id}:`, e)
      }
    }
  }
}
