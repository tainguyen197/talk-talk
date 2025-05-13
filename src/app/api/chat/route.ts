import { OpenAI } from 'openai';
import { NextRequest, NextResponse } from 'next/server';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function POST(req: NextRequest) {
  try {
    const { message, history } = await req.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Send chat completion request to OpenAI
    const chatCompletion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful English tutor. Your name is TalkTutor. Your primary goal is to help the user practice and improve their English skills through natural conversation. Provide corrections gently when appropriate, and encourage the user.'
        },
        ...history,
        { role: 'user', content: message }
      ],
      stream: true,
    });

    // Create a TransformStream for streaming the response
    const encoder = new TextEncoder();
    
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();

    // Process the chat completion stream
    (async () => {
      try {
        for await (const chunk of chatCompletion) {
          const content = chunk.choices[0]?.delta?.content || '';
          if (content) {
            await writer.write(encoder.encode(content));
          }
        }
      } catch (error) {
        console.error('Error processing stream:', error);
      } finally {
        await writer.close();
      }
    })();

    return new NextResponse(stream.readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
      },
    });
    
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'An error occurred during the conversation' },
      { status: 500 }
    );
  }
} 