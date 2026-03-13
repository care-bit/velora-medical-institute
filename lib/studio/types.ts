export type VideoType = 'story' | 'educational' | 'list' | 'clip-cutter' | 'motivational'

export type RenderStatus = 'queued' | 'processing' | 'rendering' | 'completed' | 'failed'

export interface Project {
  id: string
  name: string
  type: VideoType
  createdAt: string
  updatedAt: string
  status: RenderStatus
  thumbnail?: string
  outputPath?: string
  duration?: number
}

export interface RenderJob {
  id: string
  projectId: string
  projectName: string
  type: VideoType
  status: RenderStatus
  progress: number
  createdAt: string
  startedAt?: string
  completedAt?: string
  outputPath?: string
  error?: string
  config: RenderConfig
}

export interface RenderConfig {
  width: number
  height: number
  fps: number
  format: 'mp4'
  codec: 'libx264'
  audioBitrate: string
  videoBitrate: string
}

export const DEFAULT_RENDER_CONFIG: RenderConfig = {
  width: 1080,
  height: 1920,
  fps: 30,
  format: 'mp4',
  codec: 'libx264',
  audioBitrate: '192k',
  videoBitrate: '4000k',
}

export interface VoiceOption {
  id: string
  name: string
  preview_url?: string
  category: string
}

export interface SubtitleStyle {
  id: string
  name: string
  fontFamily: string
  fontSize: number
  fontColor: string
  strokeColor: string
  strokeWidth: number
  position: 'bottom' | 'center' | 'top'
  animation: 'none' | 'word-by-word' | 'fade' | 'bounce'
}

export const SUBTITLE_PRESETS: SubtitleStyle[] = [
  {
    id: 'bold-white',
    name: 'Bold White',
    fontFamily: 'Arial Black',
    fontSize: 48,
    fontColor: '#FFFFFF',
    strokeColor: '#000000',
    strokeWidth: 4,
    position: 'bottom',
    animation: 'word-by-word',
  },
  {
    id: 'neon-green',
    name: 'Neon Green',
    fontFamily: 'Impact',
    fontSize: 52,
    fontColor: '#39FF14',
    strokeColor: '#000000',
    strokeWidth: 3,
    position: 'center',
    animation: 'bounce',
  },
  {
    id: 'clean-minimal',
    name: 'Clean Minimal',
    fontFamily: 'Helvetica Neue',
    fontSize: 40,
    fontColor: '#FFFFFF',
    strokeColor: '#00000080',
    strokeWidth: 2,
    position: 'bottom',
    animation: 'fade',
  },
  {
    id: 'youtube-red',
    name: 'YouTube Red',
    fontFamily: 'Arial Black',
    fontSize: 50,
    fontColor: '#FF0000',
    strokeColor: '#FFFFFF',
    strokeWidth: 3,
    position: 'center',
    animation: 'word-by-word',
  },
  {
    id: 'cinematic',
    name: 'Cinematic',
    fontFamily: 'Georgia',
    fontSize: 44,
    fontColor: '#F5F5DC',
    strokeColor: '#000000',
    strokeWidth: 2,
    position: 'bottom',
    animation: 'fade',
  },
]

export interface StoryConfig {
  storyText: string
  voiceId: string
  backgroundVideo: string
  subtitleStyle: string
  backgroundMusic?: string
  musicVolume: number
}

export interface EducationalConfig {
  topic: string
  script: string
  scenes: ScriptScene[]
  voiceId: string
  subtitleStyle: string
}

export interface ScriptScene {
  id: string
  text: string
  duration: number
  mediaUrl?: string
  mediaType: 'image' | 'video'
}

export interface ListConfig {
  topic: string
  items: ListItem[]
  voiceId: string
  subtitleStyle: string
  transitionStyle: 'slide' | 'fade' | 'zoom'
}

export interface ListItem {
  rank: number
  title: string
  description: string
  mediaUrl?: string
}

export interface ClipCutterConfig {
  sourceVideo: string
  transcript: TranscriptSegment[]
  clips: DetectedClip[]
  subtitleStyle: string
}

export interface TranscriptSegment {
  start: number
  end: number
  text: string
}

export interface DetectedClip {
  id: string
  title: string
  startTime: number
  endTime: number
  score: number
  reason: string
  selected: boolean
}

export interface MotivationalConfig {
  speechText: string
  voiceId: string
  backgroundClips: string[]
  subtitleStyle: string
  captionStyle: 'bold' | 'italic' | 'uppercase'
  backgroundMusic?: string
  musicVolume: number
}

export const BACKGROUND_VIDEOS = [
  { id: 'minecraft', name: 'Minecraft Parkour', category: 'Gaming', thumbnail: '🎮' },
  { id: 'subway-surfers', name: 'Subway Surfers', category: 'Gaming', thumbnail: '🏃' },
  { id: 'gta-driving', name: 'GTA Driving', category: 'Gaming', thumbnail: '🚗' },
  { id: 'satisfying', name: 'Satisfying Clips', category: 'Satisfying', thumbnail: '✨' },
  { id: 'cooking', name: 'Cooking ASMR', category: 'Satisfying', thumbnail: '🍳' },
  { id: 'nature', name: 'Nature Scenery', category: 'Cinematic', thumbnail: '🌿' },
  { id: 'city-timelapse', name: 'City Timelapse', category: 'Cinematic', thumbnail: '🏙️' },
  { id: 'ocean-waves', name: 'Ocean Waves', category: 'Cinematic', thumbnail: '🌊' },
  { id: 'space', name: 'Space Footage', category: 'Cinematic', thumbnail: '🚀' },
  { id: 'gym', name: 'Gym Footage', category: 'Fitness', thumbnail: '💪' },
  { id: 'running', name: 'Running Footage', category: 'Fitness', thumbnail: '🏃‍♂️' },
]

export const VOICE_OPTIONS: VoiceOption[] = [
  { id: 'adam', name: 'Adam', category: 'Male - Dominant' },
  { id: 'brian', name: 'Brian', category: 'Male - Deep' },
  { id: 'charlie', name: 'Charlie', category: 'Male - Energetic' },
  { id: 'chris', name: 'Chris', category: 'Male - Casual' },
  { id: 'daniel', name: 'Daniel', category: 'Male - Broadcaster' },
  { id: 'george', name: 'George', category: 'Male - Storyteller' },
  { id: 'liam', name: 'Liam', category: 'Male - Creator' },
  { id: 'bella', name: 'Bella', category: 'Female - Warm' },
  { id: 'sarah', name: 'Sarah', category: 'Female - Confident' },
]
