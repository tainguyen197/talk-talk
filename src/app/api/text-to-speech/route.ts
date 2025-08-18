import { NextRequest, NextResponse } from "next/server";

// Map of language codes to appropriate OpenAI voices
const languageVoiceMap: Record<
  string,
  { voice: string; speed: number; instructions: string }
> = {
  "en-US": {
    voice: "nova",
    speed: 1.0,
    instructions:
      "Voice: Clear, authoritative, and composed, projecting confidence and professionalism.\n\nTone: Neutral and informative, maintaining a balance between formality and approachability.\n\nPunctuation: Structured with commas and pauses for clarity, ensuring information is digestible and well-paced.\n\nDelivery: Steady and measured, with slight emphasis on key figures and deadlines to highlight critical points.",
  },
  "vi-VN": {
    voice: "nova",
    speed: 1.0,
    instructions:
      "Voice: Clear, authoritative, and composed, projecting confidence and professionalism.\n\nTone: Neutral and informative, maintaining a balance between formality and approachability.\n\nPunctuation: Structured with commas and pauses for clarity, ensuring information is digestible and well-paced.\n\nDelivery: Steady and measured, with slight emphasis on key figures and deadlines to highlight critical points.",
  },
};

export async function POST(req: NextRequest) {
  try {
    const { text, language = "en-US", voice, speed } = await req.json();

    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    // Get the voice configuration for the requested language or fall back to English
    const voiceConfig = languageVoiceMap[language] || languageVoiceMap["en-US"];

    // Make request to OpenAI Text-to-Speech API
    const response = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "tts-1-hd",
        input: text,
        voice: voice ?? voiceConfig.voice,
        response_format: "mp3",
        speed:
          typeof speed === "number" && speed > 0
            ? speed
            : Math.min(1.15, voiceConfig.speed + 0.15),
        instructions: voiceConfig.instructions,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("OpenAI TTS API error:", errorData);
      return NextResponse.json(
        { error: "Failed to generate speech" },
        { status: response.status }
      );
    }

    // Get the audio buffer
    const audioBuffer = await response.arrayBuffer();

    // Return the audio file
    return new NextResponse(audioBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": audioBuffer.byteLength.toString(),
      },
    });
  } catch (error) {
    console.error("OpenAI Text-to-speech API error:", error);
    return NextResponse.json(
      { error: "An error occurred during speech synthesis" },
      { status: 500 }
    );
  }
}
