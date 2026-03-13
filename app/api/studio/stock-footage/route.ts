import { NextRequest, NextResponse } from 'next/server'
import {
  searchPexelsVideos,
  downloadStockVideo,
  fetchBackgroundForCategory,
  fetchAllBackgrounds,
} from '@/lib/studio/stock-footage'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('query')
  const category = searchParams.get('category')
  const action = searchParams.get('action')

  try {
    // Fetch all backgrounds at once
    if (action === 'fetch-all') {
      const results = await fetchAllBackgrounds()
      return NextResponse.json({ results })
    }

    // Search for stock videos
    if (query) {
      const orientation = (searchParams.get('orientation') as 'portrait' | 'landscape') || 'portrait'
      const perPage = parseInt(searchParams.get('perPage') || '10', 10)
      const videos = await searchPexelsVideos(query, orientation, perPage)
      return NextResponse.json({ videos })
    }

    // Fetch for a specific category
    if (category) {
      const result = await fetchBackgroundForCategory(category)
      if (!result) {
        return NextResponse.json({ error: 'No videos found for this category' }, { status: 404 })
      }
      return NextResponse.json(result)
    }

    return NextResponse.json({ error: 'Provide query, category, or action=fetch-all' }, { status: 400 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Stock footage search failed'
    console.error('Stock footage error:', error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { videoUrl, saveName } = body

    if (!videoUrl) {
      return NextResponse.json({ error: 'videoUrl is required' }, { status: 400 })
    }

    const result = await downloadStockVideo(videoUrl, saveName)
    return NextResponse.json(result)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Download failed'
    console.error('Stock footage download error:', error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
