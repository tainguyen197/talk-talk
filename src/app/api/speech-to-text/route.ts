import { NextRequest, NextResponse } from 'next/server';
import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function POST(req: NextRequest) {
  try {
    // Check if the request is a FormData request
    const formData = await req.formData();
    const audioBlob = formData.get('audio') as Blob;

    if (!audioBlob) {
      return NextResponse.json(
        { error: 'Audio file is required' },
        { status: 400 }
      );
    }

    // Create a file buffer from the blob
    const buffer = Buffer.from(await audioBlob.arrayBuffer());
    
    // Convert Buffer to File object required by OpenAI
    const file = new File([buffer], 'audio.webm', { type: 'audio/webm' });

    // Send request to OpenAI Whisper API
    const transcription = await openai.audio.transcriptions.create({
      file,
      model: 'whisper-1',
      language: 'en',
    });

    return NextResponse.json({ text: transcription.text });
    
  } catch (error) {
    console.error('Speech-to-text API error:', error);
    return NextResponse.json(
      { error: 'An error occurred during speech recognition' },
      { status: 500 }
    );
  }
} 