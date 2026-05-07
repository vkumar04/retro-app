import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js"
import { NextResponse, type NextRequest } from "next/server"
import { z } from "zod"

const DEFAULT_VOICE_ID = "JBFqnCBsd6RMkjVDRZzb" // George

const bodySchema = z.object({
  text: z.string().min(1),
  voiceId: z.string().optional(),
  speed: z.number().min(0.5).max(2).optional(),
})

export async function POST(request: NextRequest) {
  const apiKey = process.env.ELEVENLABS_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { error: "ELEVENLABS_API_KEY not configured" },
      { status: 500 },
    )
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }
  const { text, voiceId = DEFAULT_VOICE_ID, speed = 0.9 } = parsed.data

  try {
    const elevenlabs = new ElevenLabsClient({ apiKey })
    const audioStream = await elevenlabs.textToSpeech.convert(voiceId, {
      text,
      modelId: "eleven_multilingual_v2",
      outputFormat: "mp3_44100_128",
      voiceSettings: {
        stability: 0.75,
        similarityBoost: 0.75,
        useSpeakerBoost: false,
        speed,
      },
    })

    return new Response(audioStream, {
      headers: { "Content-Type": "audio/mpeg" },
    })
  } catch (error) {
    console.error("ElevenLabs API error:", error)
    return NextResponse.json(
      { error: "Failed to generate speech" },
      { status: 500 },
    )
  }
}
