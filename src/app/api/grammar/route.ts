import { OpenAI } from "openai";
import { NextRequest, NextResponse } from "next/server";

// Initialize the OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid text parameter" },
        { status: 400 }
      );
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a helpful English language assistant. Translate the provided Vietnamese text to English and explain the grammar rules used in the English translation. The response should include:
          1. Accurate English translation
          2. Explanation of grammar tenses, structures, or patterns used in the English translation.
          
          Format your response as JSON with the following structure:
          {
            "translation": "The English translation",
            "explanation": "Detailed grammar explanation"
          }`,
        },
        {
          role: "user",
          content: text,
        },
      ],
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message.content;

    if (!content) {
      return NextResponse.json(
        { error: "Failed to generate translation" },
        { status: 500 }
      );
    }

    try {
      // Parse the JSON response
      const parsedResponse = JSON.parse(content);
      return NextResponse.json(parsedResponse);
    } catch (error) {
      console.error("Error parsing response:", error);
      return NextResponse.json(
        { error: "Failed to parse response" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error processing grammar request:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
