import { OpenAI } from "openai";
import { NextRequest, NextResponse } from "next/server";

// Initialize the OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { originalText, translation, explanation } = await request.json();

    if (!originalText || !translation || !explanation) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are a helpful English language assistant. 
          A user is learning English grammar and has received a translation and explanation.
          
          Original Vietnamese text: "${originalText}"
          English translation: "${translation}"
          Grammar explanation: "${explanation}"
          
          Generate 3 relevant follow-up questions that the learner might want to ask about this grammar point.
          The questions should be clear, concise, and focused on understanding this specific grammar structure better.
          
          Format your response as a JSON object with a "questions" array. Example:
          {
            "questions": ["Why is the past tense used here?", "Can I use present perfect instead?", "How would I make this negative?"]
          }`,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const content = response.choices[0]?.message.content;

    if (!content) {
      return NextResponse.json(
        { error: "Failed to generate suggestions" },
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
    console.error("Error generating question suggestions:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
