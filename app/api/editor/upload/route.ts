import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import crypto from 'crypto'

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads')
const ALLOWED = new Set(['image/png', 'image/jpeg', 'image/webp', 'image/avif', 'image/gif'])

export async function POST(req: Request) {
  let form: FormData
  try {
    form = await req.formData()
  } catch {
    return NextResponse.json({ error: 'Invalid form data' }, { status: 400 })
  }

  const file = form.get('file')
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'No file' }, { status: 400 })
  }
  if (!ALLOWED.has(file.type)) {
    return NextResponse.json({ error: `Unsupported type: ${file.type}` }, { status: 400 })
  }
  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 400 })
  }

  const buf = Buffer.from(await file.arrayBuffer())
  const ext = file.name.match(/\.[a-z0-9]+$/i)?.[0] ?? `.${file.type.split('/')[1] ?? 'png'}`
  const hash = crypto.createHash('sha1').update(buf).digest('hex').slice(0, 12)
  const filename = `${Date.now().toString(36)}_${hash}${ext.toLowerCase()}`

  try {
    await fs.mkdir(UPLOAD_DIR, { recursive: true })
    await fs.writeFile(path.join(UPLOAD_DIR, filename), buf)
  } catch (err) {
    return NextResponse.json({ error: 'Could not write file', detail: String(err) }, { status: 500 })
  }

  return NextResponse.json({ url: `/uploads/${filename}` })
}
