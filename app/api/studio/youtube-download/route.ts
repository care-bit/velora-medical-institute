import { NextRequest, NextResponse } from 'next/server'
import { downloadYouTubeVideo, convertToVertical } from '@/lib/studio/youtube'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { url, saveName, saveAs, convertVertical, maxDuration } = body

    if (!url) {
      return NextResponse.json({ error: 'url is required' }, { status: 400 })
    }

    // Validate it looks like a YouTube URL
    const isYouTube = url.includes('youtube.com') || url.includes('youtu.be')
    if (!isYouTube) {
      return NextResponse.json({ error: 'Must be a YouTube URL' }, { status: 400 })
    }

    const saveDir = saveAs === 'background' ? 'backgrounds' : 'uploads'

    const result = await downloadYouTubeVideo(url, {
      saveName,
      saveDir: saveDir as 'backgrounds' | 'uploads',
      maxDuration: maxDuration || 120, // Default max 2 minutes
    })

    // Optionally convert to vertical 9:16
    if (convertVertical) {
      const verticalPath = await convertToVertical(result.filePath)
      // Replace original with vertical version
      const fs = require('fs/promises')
      await fs.unlink(result.filePath).catch(() => {})
      await fs.rename(verticalPath, result.filePath).catch(() => {})
    }

    return NextResponse.json({
      filePath: result.filePath,
      publicUrl: result.publicUrl,
      duration: result.duration,
      title: result.title,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'YouTube download failed'
    console.error('YouTube download error:', error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
