import { NextRequest, NextResponse } from 'next/server'
import { getRenderJob, getAllRenderJobs } from '@/lib/studio/render-queue'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const jobId = searchParams.get('jobId')

  if (jobId) {
    const job = getRenderJob(jobId)
    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }
    return NextResponse.json(job)
  }

  // Return all jobs
  const jobs = getAllRenderJobs()
  return NextResponse.json({ jobs })
}
