import { exec } from 'child_process'
import { promisify } from 'util'
import path from 'path'
import fs from 'fs/promises'
import { v4 as uuidv4 } from 'uuid'

const execAsync = promisify(exec)

const BACKGROUNDS_DIR = path.join(process.cwd(), 'public', 'studio', 'backgrounds')
const UPLOADS_DIR = path.join(process.cwd(), 'public', 'studio', 'uploads')
const FFMPEG_BIN_DIR = process.env.FFMPEG_PATH ||
  'C:\\Users\\pourb\\AppData\\Local\\Microsoft\\WinGet\\Packages\\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\\ffmpeg-8.0.1-full_build\\bin'
const FFMPEG = `"${path.join(FFMPEG_BIN_DIR, 'ffmpeg.exe')}"`

async function ensureDir(dir: string) {
  await fs.mkdir(dir, { recursive: true })
}

/**
 * Download a YouTube video using yt-dlp (must be installed on system).
 * Falls back to ytdl-core if yt-dlp is not available.
 */
export async function downloadYouTubeVideo(
  url: string,
  options?: {
    saveName?: string
    saveDir?: 'backgrounds' | 'uploads'
    maxDuration?: number // seconds
  }
): Promise<{
  filePath: string
  publicUrl: string
  duration: number
  title: string
}> {
  const saveDir = options?.saveDir === 'backgrounds' ? BACKGROUNDS_DIR : UPLOADS_DIR
  await ensureDir(saveDir)

  const fileName = options?.saveName || `yt-${uuidv4()}.mp4`
  const filePath = path.join(saveDir, fileName)
  const publicBase = options?.saveDir === 'backgrounds' ? '/studio/backgrounds' : '/studio/uploads'

  // Try yt-dlp first (most reliable)
  try {
    const result = await downloadWithYtDlp(url, filePath, options?.maxDuration)
    return {
      ...result,
      filePath,
      publicUrl: `${publicBase}/${fileName}`,
    }
  } catch (ytDlpError) {
    console.log('yt-dlp not available, trying ytdl-core...', ytDlpError)
  }

  // Fallback to ytdl-core (Node.js library)
  try {
    const result = await downloadWithYtdlCore(url, filePath)
    return {
      ...result,
      filePath,
      publicUrl: `${publicBase}/${fileName}`,
    }
  } catch (ytdlError) {
    throw new Error(
      `YouTube download failed. Install yt-dlp for best results: winget install yt-dlp. Error: ${ytdlError instanceof Error ? ytdlError.message : 'Unknown error'}`
    )
  }
}

async function downloadWithYtDlp(
  url: string,
  outputPath: string,
  maxDuration?: number
): Promise<{ duration: number; title: string }> {
  // Get video info first
  const { stdout: infoJson } = await execAsync(
    `yt-dlp --dump-json --no-download "${url}"`,
    { timeout: 30000 }
  )
  const info = JSON.parse(infoJson)
  const duration = info.duration || 0
  const title = info.title || 'Untitled'

  if (maxDuration && duration > maxDuration) {
    // Download only a portion
    const cmd = [
      `yt-dlp`,
      `-f "bestvideo[height<=1080]+bestaudio/best[height<=1080]"`,
      `--merge-output-format mp4`,
      `--download-sections "*0-${maxDuration}"`,
      `-o "${outputPath}"`,
      `"${url}"`,
    ].join(' ')
    await execAsync(cmd, { timeout: 300000 })
  } else {
    const cmd = [
      `yt-dlp`,
      `-f "bestvideo[height<=1080]+bestaudio/best[height<=1080]"`,
      `--merge-output-format mp4`,
      `-o "${outputPath}"`,
      `"${url}"`,
    ].join(' ')
    await execAsync(cmd, { timeout: 300000 })
  }

  return { duration, title }
}

async function downloadWithYtdlCore(
  url: string,
  outputPath: string
): Promise<{ duration: number; title: string }> {
  // Dynamic import to avoid issues if not installed
  const ytdl = require('ytdl-core')

  const info = await ytdl.getInfo(url)
  const title = info.videoDetails.title || 'Untitled'
  const duration = parseInt(info.videoDetails.lengthSeconds, 10) || 0

  return new Promise((resolve, reject) => {
    const stream = ytdl(url, {
      quality: 'highest',
      filter: 'audioandvideo',
    })

    const fileStream = require('fs').createWriteStream(outputPath)
    stream.pipe(fileStream)

    fileStream.on('finish', () => resolve({ duration, title }))
    fileStream.on('error', reject)
    stream.on('error', reject)
  })
}

/**
 * Convert a downloaded YouTube video to vertical 9:16 format
 */
export async function convertToVertical(
  inputPath: string,
  outputPath?: string
): Promise<string> {
  const outPath = outputPath || inputPath.replace('.mp4', '-vertical.mp4')

  const cmd = [
    `${FFMPEG} -y -i "${inputPath}"`,
    `-vf "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920"`,
    `-c:v libx264 -preset fast -crf 23`,
    `-c:a aac -b:a 128k`,
    `-r 30`,
    `"${outPath}"`,
  ].join(' ')

  await execAsync(cmd, { timeout: 300000 })
  return outPath
}
