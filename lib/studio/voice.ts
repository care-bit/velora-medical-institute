const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY
const ELEVENLABS_BASE_URL = 'https://api.elevenlabs.io/v1'

// ElevenLabs voice ID mappings — verified against account 2026-03-12
const VOICE_ID_MAP: Record<string, string> = {
  adam: 'pNInz6obpgDQGcFmaJgB',       // Adam - Dominant, Firm
  bella: 'hpp4J3VqNfWAUOO0d1Us',       // Bella - Professional, Bright, Warm
  brian: 'nPczCjzI2devNBz1zQrb',       // Brian - Deep, Resonant and Comforting
  charlie: 'IKne3meq5aSn9XLyUdCD',     // Charlie - Deep, Confident, Energetic
  chris: 'iP95p4xoKVk53GoZ742B',       // Chris - Charming, Down-to-Earth
  daniel: 'onwK4e9ZLuTAKqWW03F9',      // Daniel - Steady Broadcaster
  george: 'JBFqnCBsd6RMkjVDRZzb',      // George - Warm, Captivating Storyteller
  liam: 'TX3LPaxmHKxFdv7VOQHJ',       // Liam - Energetic, Social Media Creator
  sarah: 'EXAVITQu4vr4xnSDxMaL',      // Sarah - Mature, Reassuring, Confident
}

export async function generateVoiceNarration(
  text: string,
  voiceId: string
): Promise<Buffer> {
  if (!ELEVENLABS_API_KEY) {
    throw new Error('ELEVENLABS_API_KEY is not configured')
  }

  const elevenLabsVoiceId = VOICE_ID_MAP[voiceId] || voiceId

  const response = await fetch(
    `${ELEVENLABS_BASE_URL}/text-to-speech/${elevenLabsVoiceId}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': ELEVENLABS_API_KEY,
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_flash_v2',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
          style: 0.5,
          use_speaker_boost: true,
        },
      }),
    }
  )

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`ElevenLabs API error: ${response.status} - ${error}`)
  }

  const arrayBuffer = await response.arrayBuffer()
  return Buffer.from(arrayBuffer)
}

export async function getAvailableVoices(): Promise<
  Array<{ voice_id: string; name: string; category: string }>
> {
  if (!ELEVENLABS_API_KEY) {
    throw new Error('ELEVENLABS_API_KEY is not configured')
  }

  const response = await fetch(`${ELEVENLABS_BASE_URL}/voices`, {
    headers: {
      'xi-api-key': ELEVENLABS_API_KEY,
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch voices: ${response.status}`)
  }

  const data = await response.json()
  return data.voices.map((v: { voice_id: string; name: string; category: string }) => ({
    voice_id: v.voice_id,
    name: v.name,
    category: v.category,
  }))
}
