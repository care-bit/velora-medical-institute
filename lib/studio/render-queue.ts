import { v4 as uuidv4 } from 'uuid'
import type { RenderJob, RenderStatus, VideoType, RenderConfig, DEFAULT_RENDER_CONFIG } from './types'

// In-memory render queue (in production, use Redis or a database)
const renderJobs: Map<string, RenderJob> = new Map()

export function createRenderJob(params: {
  projectName: string
  type: VideoType
  config: RenderConfig
}): RenderJob {
  const job: RenderJob = {
    id: uuidv4(),
    projectId: uuidv4(),
    projectName: params.projectName,
    type: params.type,
    status: 'queued',
    progress: 0,
    createdAt: new Date().toISOString(),
    config: params.config,
  }
  renderJobs.set(job.id, job)
  return job
}

export function updateRenderJob(
  jobId: string,
  update: Partial<Pick<RenderJob, 'status' | 'progress' | 'outputPath' | 'error' | 'startedAt' | 'completedAt'>>
) {
  const job = renderJobs.get(jobId)
  if (!job) throw new Error(`Render job ${jobId} not found`)
  Object.assign(job, update)
  renderJobs.set(jobId, job)
  return job
}

export function getRenderJob(jobId: string): RenderJob | undefined {
  return renderJobs.get(jobId)
}

export function getAllRenderJobs(): RenderJob[] {
  return Array.from(renderJobs.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
}

export function getActiveJobs(): RenderJob[] {
  return getAllRenderJobs().filter(
    (job) => job.status === 'queued' || job.status === 'processing' || job.status === 'rendering'
  )
}

export function getCompletedJobs(): RenderJob[] {
  return getAllRenderJobs().filter((job) => job.status === 'completed')
}

export function deleteRenderJob(jobId: string): boolean {
  return renderJobs.delete(jobId)
}
