import { NextRequest, NextResponse } from "next/server";
import { SpeechClient } from "@google-cloud/speech";

// Define a type for the error with details
interface ErrorWithDetails extends Error {
  details?: string;
}

// Initialize the Google Cloud Speech client
const speechClient = new SpeechClient();

export async function POST(req: NextRequest) {
  try {
    // Check if the request is a FormData request
    const formData = await req.formData();
    const audioBlob = formData.get("audio") as Blob;

    if (!audioBlob) {
      return NextResponse.json(
        { error: "Audio file is required" },
        { status: 400 }
      );
    }

    // Create a file buffer from the blob
    const buffer = Buffer.from(await audioBlob.arrayBuffer());

    // Configure the audio settings for Google Cloud Speech-to-Text
    const audio = {
      content: buffer.toString("base64"),
    };

    const config = {
      encoding: "WEBM_OPUS" as const, // WebM audio encoding
      sampleRateHertz: 48000, // WebM typically uses 48kHz
      languageCode: "vi-VN", // Vietnamese language code
      alternativeLanguageCodes: ["en-US"], // Fallback to English
      enableAutomaticPunctuation: true,
      model: "latest_long" as const, // Use the latest long-form model
    };

    // Debug log to check audio content length
    console.log(`Audio content length: ${buffer.length} bytes`);

    if (buffer.length === 0) {
      return NextResponse.json(
        { error: "Empty audio buffer received" },
        { status: 400 }
      );
    }

    const request = {
      audio: audio,
      config: config,
    };

    // Send request to Google Cloud Speech-to-Text API
    const [response] = await speechClient.recognize(request);

    // Extract transcription from response
    const transcription =
      response.results
        ?.map((result) => result.alternatives?.[0]?.transcript)
        .join("\n") || "";

    if (!transcription) {
      return NextResponse.json(
        { error: "No speech detected in audio" },
        { status: 400 }
      );
    }

    return NextResponse.json({ text: transcription });
  } catch (error) {
    console.error("Google Cloud Speech-to-Text API error:", error);

    // Add more detailed error information
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorDetails =
      error instanceof Error && (error as ErrorWithDetails).details
        ? (error as ErrorWithDetails).details
        : "No additional details";

    return NextResponse.json(
      {
        error: "An error occurred during speech recognition",
        details: errorMessage,
        additionalInfo: errorDetails,
      },
      { status: 500 }
    );
  }
}
