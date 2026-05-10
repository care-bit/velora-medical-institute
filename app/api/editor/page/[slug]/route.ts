import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

const PAGES_DIR = path.join(process.cwd(), 'data', 'pages')

function fileFor(slug: string) {
  // basic safety — alphanumerics + dashes only
  const safe = slug.replace(/[^a-z0-9-]/gi, '')
  if (!safe) throw new Error('bad slug')
  return path.join(PAGES_DIR, `${safe}.json`)
}

export async function GET(
  _req: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params
  try {
    const raw = await fs.readFile(fileFor(slug), 'utf8')
    return NextResponse.json({ schema: JSON.parse(raw) })
  } catch {
    return NextResponse.json({ schema: null })
  }
}

export async function POST(
  req: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 })
  }
  const schema = (body as { schema?: unknown })?.schema
  if (!schema || typeof schema !== 'object') {
    return NextResponse.json({ error: 'missing schema' }, { status: 400 })
  }
  try {
    await fs.mkdir(PAGES_DIR, { recursive: true })
    await fs.writeFile(fileFor(slug), JSON.stringify(schema, null, 2), 'utf8')
  } catch (err) {
    return NextResponse.json({ error: 'write failed', detail: String(err) }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}
