import { OpenAI } from "openai";
import { NextRequest, NextResponse } from "next/server";

// Initialize the OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { originalText, translation, question } = await request.json();

    if (!originalText || !translation || !question) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a helpful English language assistant specialized in grammar explanations. 
          A user has translated a Vietnamese sentence to English and now has a follow-up question about the grammar.
          
          Original Vietnamese text: "${originalText}"
          English translation: "${translation}"
          
          Please provide a clear, concise explanation that answers their grammar question.`,
        },
        {
          role: "user",
          content: question,
        },
      ],
    });

    const content = response.choices[0]?.message.content;

    if (!content) {
      return NextResponse.json(
        { error: "Failed to generate response" },
        { status: 500 }
      );
    }

    return NextResponse.json({ answer: content });
  } catch (error) {
    console.error("Error processing follow-up question:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
