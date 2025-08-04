import { OpenAI } from "openai";
import { NextRequest, NextResponse } from "next/server";

// Initialize the OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { context, conversationHistory, lastUserResponse } =
      await request.json();

    if (!context) {
      return NextResponse.json(
        { error: "Missing context parameter" },
        { status: 400 }
      );
    }

    let systemPrompt = "";
    let userPrompt = "";

    if (context === "starting_conversation") {
      systemPrompt = `You are an English conversation practice AI. Your role is to:
      1. Ask engaging, natural questions that encourage conversation
      2. Keep questions simple and appropriate for language learning
      3. Focus on everyday topics like daily activities, hobbies, work, food, travel, etc.
      4. Ask only ONE question at a time (What's time is it?, what are you doing?, what's your name?, what's your favorite food?, what's your favorite color?, what's your favorite animal?, what's your favorite book?, what's your favorite movie?, what's your favorite song?, what's your favorite game?, what's your favorite sport?, what's your favorite hobby?, what's your favorite book?, what's your favorite movie?, what's your favorite song?, what's your favorite game?, what's your favorite sport?, what's your favorite hobby?)
      
      Generate a friendly, natural conversation starter question.`;

      userPrompt =
        "Please generate a conversation starter question for English practice.";
    } else {
      // Continuing conversation
      const conversationContext = conversationHistory
        .map((msg: any) => `${msg.sender}: ${msg.text}`)
        .join("\n");

      systemPrompt = `You are an English conversation practice AI. Your role is to:
      1. Continue the conversation naturally based on what the user just said
      2. Ask follow-up questions that relate to their response
      3. Keep the conversation flowing and engaging
      4. Ask only ONE question at a time
      5. Encourage the user to elaborate or share more details
      6. Sometimes introduce related topics to keep the conversation interesting
      
      Based on the conversation history and the user's last response, generate an appropriate follow-up question.`;

      userPrompt = `Conversation so far:
${conversationContext}

The user just said: "${lastUserResponse}"

Please generate a natural follow-up question to continue the conversation.`;
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: userPrompt,
        },
      ],
      max_tokens: 100,
      temperature: 0.7,
    });

    const question = response.choices[0]?.message.content?.trim();

    if (!question) {
      return NextResponse.json(
        { error: "Failed to generate question" },
        { status: 500 }
      );
    }

    return NextResponse.json({ question });
  } catch (error) {
    console.error("Error generating question:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
