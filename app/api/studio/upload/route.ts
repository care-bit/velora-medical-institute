import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import path from 'path'
import fs from 'fs/promises'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const uploadDir = path.join(process.cwd(), 'public', 'studio', 'uploads')
    await fs.mkdir(uploadDir, { recursive: true })

    const ext = path.extname(file.name)
    const fileName = `${uuidv4()}${ext}`
    const filePath = path.join(uploadDir, fileName)

    const buffer = Buffer.from(await file.arrayBuffer())
    await fs.writeFile(filePath, buffer)

    return NextResponse.json({
      fileName,
      filePath,
      publicUrl: `/studio/uploads/${fileName}`,
      size: file.size,
      type: file.type,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Upload failed'
    console.error('Upload error:', error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
