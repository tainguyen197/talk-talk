import { NextRequest, NextResponse } from "next/server";
import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();

    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    // Send request to OpenAI TTS API
    const mp3 = await openai.audio.speech.create({
      model: "tts-1",
      voice: "alloy",
      input: text,
    });

    // Convert the response to an ArrayBuffer
    const buffer = Buffer.from(await mp3.arrayBuffer());

    // Return the audio file
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": buffer.byteLength.toString(),
      },
    });
  } catch (error) {
    console.error("Text-to-speech API error:", error);
    return NextResponse.json(
      { error: "An error occurred during speech synthesis" },
      { status: 500 }
    );
  }
}
