import { NextRequest, NextResponse } from "next/server";
import { TextToSpeechClient } from "@google-cloud/text-to-speech";

// Initialize the Google Cloud Text-to-Speech client
const textToSpeechClient = new TextToSpeechClient();

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();

    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    // Configure the voice request for Google Cloud Text-to-Speech
    const request = {
      input: { text },
      voice: {
        languageCode: "en-US",
        ssmlGender: "NEUTRAL" as const,
        name: "en-US-Chirp3-HD-Alnilam",
      },
      audioConfig: {
        audioEncoding: "MP3" as const,
        speakingRate: 1.0, // Normal speed
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
