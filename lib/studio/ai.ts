import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function generateStoryScript(prompt: string): Promise<string> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: `You are a viral short-form video scriptwriter. Write engaging first-person stories optimized for TikTok/YouTube Shorts narration.

Rules:
- Write in first person
- Keep it under 300 words (60-90 seconds when narrated)
- Use conversational language
- Build tension and have a satisfying conclusion
- No stage directions or brackets
- Just the narration text, ready to be read aloud`,
      },
      { role: 'user', content: prompt },
    ],
    temperature: 0.8,
    max_tokens: 1000,
  })
  return response.choices[0].message.content || ''
}

export async function generateEducationalScript(topic: string): Promise<{
  title: string
  scenes: Array<{ text: string; duration: number; visualDescription: string }>
}> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: `You are an educational content creator for short-form video. Generate structured scripts with scenes.

Return a JSON object with:
{
  "title": "video title",
  "scenes": [
    {
      "text": "narration text for this scene",
      "duration": estimated_seconds,
      "visualDescription": "what visual should accompany this"
    }
  ]
}

Rules:
- 5-8 scenes total
- Each scene 5-15 seconds of narration
- Total video under 90 seconds
- Engaging, surprising facts
- Hook in first scene
- Strong conclusion`,
      },
      { role: 'user', content: `Create an educational short video about: ${topic}` },
    ],
    temperature: 0.7,
    max_tokens: 1500,
    response_format: { type: 'json_object' },
  })
  return JSON.parse(response.choices[0].message.content || '{}')
}

export async function generateListScript(topic: string, count: number = 5): Promise<{
  title: string
  items: Array<{ rank: number; title: string; description: string; visualDescription: string }>
}> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: `You create ranked list videos for short-form content. Generate structured list scripts.

Return a JSON object with:
{
  "title": "video title",
  "items": [
    {
      "rank": number,
      "title": "item title",
      "description": "2-3 sentence narration about this item",
      "visualDescription": "what visual to show"
    }
  ]
}

Rules:
- Items ranked from ${count} down to 1
- Each item description is 10-15 seconds when read aloud
- Engaging and surprising picks
- Brief intro hook before list begins`,
      },
      { role: 'user', content: `Create a Top ${count} list about: ${topic}` },
    ],
    temperature: 0.7,
    max_tokens: 2000,
    response_format: { type: 'json_object' },
  })
  return JSON.parse(response.choices[0].message.content || '{}')
}

export async function generateMotivationalScript(theme: string): Promise<string> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: `You write powerful motivational speeches for short-form video content.

Rules:
- 150-250 words (45-75 seconds)
- Intense, emotional language
- Build from calm to powerful
- Use short punchy sentences
- End with a strong call to action
- No quotation marks or attributions
- Just raw speech text`,
      },
      { role: 'user', content: `Write a motivational speech about: ${theme}` },
    ],
    temperature: 0.9,
    max_tokens: 800,
  })
  return response.choices[0].message.content || ''
}

export async function detectEngagingClips(
  transcript: Array<{ start: number; end: number; text: string }>
): Promise<Array<{ title: string; startTime: number; endTime: number; score: number; reason: string }>> {
  const transcriptText = transcript
    .map((s) => `[${s.start.toFixed(1)}s - ${s.end.toFixed(1)}s] ${s.text}`)
    .join('\n')

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: `You analyze video transcripts to find the most engaging clips for short-form content.

Identify 3-8 clips that would perform well as standalone short videos.

Return a JSON object:
{
  "clips": [
    {
      "title": "clip title",
      "startTime": start_seconds,
      "endTime": end_seconds,
      "score": 0.0-1.0,
      "reason": "why this clip is engaging"
    }
  ]
}

Rules:
- Each clip should be 15-60 seconds
- Look for: strong hooks, surprising statements, emotional moments, funny moments, controversial takes
- Score based on viral potential
- Clips should be self-contained (make sense without context)`,
      },
      { role: 'user', content: `Analyze this transcript and find the best clips:\n\n${transcriptText}` },
    ],
    temperature: 0.5,
    max_tokens: 2000,
    response_format: { type: 'json_object' },
  })
  const result = JSON.parse(response.choices[0].message.content || '{"clips":[]}')
  return result.clips || []
}
