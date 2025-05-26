import { NextRequest, NextResponse } from "next/server";
import { TextToSpeechClient } from "@google-cloud/text-to-speech";

// Initialize the Google Cloud Text-to-Speech client
const textToSpeechClient = new TextToSpeechClient();

// Map of language codes to appropriate voice models
const languageVoiceMap: Record<
  string,
  { languageCode: string; name: string; speed: number }
> = {
  "en-US": {
    languageCode: "en-US",
    name: "en-US-Chirp3-HD-Alnilam",
    speed: 1.0,
  },
  "vi-VN": {
    languageCode: "vi-VN",
    name: "vi-VN-Chirp3-HD-Aoede",
    speed: 1.2,
  },
};

export async function POST(req: NextRequest) {
  try {
    const { text, language = "en-US" } = await req.json();

    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    // Get the voice configuration for the requested language or fall back to English
    const voiceConfig = languageVoiceMap[language] || languageVoiceMap["en-US"];

    // Configure the voice request for Google Cloud Text-to-Speech
    const request = {
      input: { text },
      voice: {
        languageCode: voiceConfig.languageCode,
        ssmlGender: "NEUTRAL" as const,
        name: voiceConfig.name,
      },
      audioConfig: {
        audioEncoding: "MP3" as const,
        speakingRate: voiceConfig.speed, // Normal speed
        pitch: 0, // Default pitch
      },
    };

    // Send request to Google Cloud Text-to-Speech API
    const [response] = await textToSpeechClient.synthesizeSpeech(request);

    // Convert the response to a Buffer
    const audioContent = response.audioContent as Buffer;

    // Return the audio file
    return new NextResponse(audioContent, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": audioContent.byteLength.toString(),
      },
    });
  } catch (error) {
    console.error("Google Text-to-speech API error:", error);
    return NextResponse.json(
      { error: "An error occurred during speech synthesis" },
      { status: 500 }
    );
  }
}
