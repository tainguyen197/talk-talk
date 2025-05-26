import { OpenAI } from "openai";
import { NextRequest, NextResponse } from "next/server";

// Initialize the OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { explanation, originalText } = await request.json();

    if (!explanation) {
      return NextResponse.json(
        { error: "Missing explanation parameter" },
        { status: 400 }
      );
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a Vietnamese language assistant. Translate the provided English grammar explanation to Vietnamese. 
          Keep the explanation clear and educational. Maintain any formatting, including numbered points, bold text, etc. 
          
          Remember that this is a grammar explanation for a Vietnamese speaker learning English, so be sure to use appropriate Vietnamese grammar terminology.
          
          Format your response as JSON with the following structure:
          {
            "vietnameseExplanation": "The Vietnamese translation of the grammar explanation"
          }`,
        },
        {
          role: "user",
          content: `Original Vietnamese text: ${originalText || ""}
          
          English Grammar Explanation: ${explanation}
          
          Please translate this grammar explanation to Vietnamese.`,
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
    console.error("Error processing translation request:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
