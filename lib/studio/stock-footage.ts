import path from 'path'
import fs from 'fs/promises'
import { v4 as uuidv4 } from 'uuid'

const PEXELS_API_KEY = process.env.PEXELS_API_KEY || ''
const BACKGROUNDS_DIR = path.join(process.cwd(), 'public', 'studio', 'backgrounds')

async function ensureDir(dir: string) {
  await fs.mkdir(dir, { recursive: true })
}

// ─── Pexels / Pixabay stock footage ───────────────────────────────────────────

export interface StockVideo {
  id: string
  url: string
  thumbnail: string
  duration: number
  width: number
  height: number
  source: 'pexels' | 'pixabay'
}

export async function searchPexelsVideos(
  query: string,
  orientation: 'portrait' | 'landscape' = 'portrait',
  perPage: number = 10
): Promise<StockVideo[]> {
  if (!PEXELS_API_KEY) {
    throw new Error('PEXELS_API_KEY is not configured. Get a free key at pexels.com/api')
  }

  const params = new URLSearchParams({
    query,
    orientation,
    per_page: String(perPage),
  })

  const response = await fetch(`https://api.pexels.com/videos/search?${params}`, {
    headers: { Authorization: PEXELS_API_KEY },
  })

  if (!response.ok) {
    throw new Error(`Pexels API error: ${response.status}`)
  }

  const data = await response.json()

  return data.videos.map((video: {
    id: number
    image: string
    duration: number
    video_files: Array<{ width: number; height: number; link: string; quality: string }>
  }) => {
    // Pick the best quality vertical file, or highest quality available
    const files = video.video_files
      .filter((f) => f.width && f.height)
      .sort((a, b) => (b.height * b.width) - (a.height * a.width))

    const bestFile = files.find((f) => f.height > f.width) || files[0]

    return {
      id: String(video.id),
      url: bestFile?.link || '',
      thumbnail: video.image,
      duration: video.duration,
      width: bestFile?.width || 0,
      height: bestFile?.height || 0,
      source: 'pexels' as const,
    }
  })
}

export async function downloadStockVideo(
  videoUrl: string,
  saveName?: string
): Promise<{ filePath: string; publicUrl: string }> {
  await ensureDir(BACKGROUNDS_DIR)

  const fileName = saveName || `stock-${uuidv4()}.mp4`
  const filePath = path.join(BACKGROUNDS_DIR, fileName)

  const response = await fetch(videoUrl)
  if (!response.ok) throw new Error(`Failed to download video: ${response.status}`)

  const buffer = Buffer.from(await response.arrayBuffer())
  await fs.writeFile(filePath, buffer)

  return {
    filePath,
    publicUrl: `/studio/backgrounds/${fileName}`,
  }
}

// ─── Pexels category search helpers ───────────────────────────────────────────

const CATEGORY_QUERIES: Record<string, string> = {
  'minecraft': 'gaming abstract colorful',
  'subway-surfers': 'running urban city fast',
  'gta-driving': 'driving car night city',
  'satisfying': 'satisfying oddly mesmerizing',
  'cooking': 'cooking food close up',
  'nature': 'nature forest green scenery',
  'city-timelapse': 'city timelapse night lights',
  'ocean-waves': 'ocean waves aerial',
  'space': 'space stars galaxy dark',
  'gym': 'gym workout fitness training',
  'running': 'running athlete outdoor',
}

export async function fetchBackgroundForCategory(
  categoryId: string
): Promise<{ filePath: string; publicUrl: string } | null> {
  const query = CATEGORY_QUERIES[categoryId] || categoryId

  try {
    const videos = await searchPexelsVideos(query, 'portrait', 5)
    if (videos.length === 0) return null

    // Pick a random one from results
    const pick = videos[Math.floor(Math.random() * videos.length)]
    return await downloadStockVideo(pick.url, `${categoryId}.mp4`)
  } catch (err) {
    console.error(`Failed to fetch background for ${categoryId}:`, err)
    return null
  }
}

export async function fetchAllBackgrounds(): Promise<Record<string, boolean>> {
  const results: Record<string, boolean> = {}

  for (const categoryId of Object.keys(CATEGORY_QUERIES)) {
    try {
      // Skip if a real video already exists (> 500KB means it's not a placeholder)
      const filePath = path.join(BACKGROUNDS_DIR, `${categoryId}.mp4`)
      try {
        const stat = await fs.stat(filePath)
        if (stat.size > 500_000) {
          results[categoryId] = true
          continue
        }
      } catch {
        // File doesn't exist
      }

      const result = await fetchBackgroundForCategory(categoryId)
      results[categoryId] = !!result
    } catch {
      results[categoryId] = false
    }
  }

  return results
}
