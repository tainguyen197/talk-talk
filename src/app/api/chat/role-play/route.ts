import { OpenAI } from "openai";
import { NextRequest, NextResponse } from "next/server";
import { ChatCompletionMessageParam } from "openai/resources/chat/completions";

// Initialize the OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { topic, userMessage, conversation } = await request.json();

    if (!topic || !userMessage || !conversation) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    // Format the conversation history for the API
    const messages: ChatCompletionMessageParam[] = [
      {
        role: "system",
        content: `You are a helpful AI assistant helping a non-native English speaker practice their speaking skills in a role-play scenario about "${topic.title}". 
        
        The scenario is: ${topic.description}
        
        Your role: Based on the topic, you should play the appropriate role (e.g., store clerk, restaurant server, interviewer, etc.).
        Use simple vocabulary and clear, grammatically correct sentences appropriate for an English learner.
        Keep responses short (1-3 sentences).
        Be encouraging and helpful, but also realistic for the scenario.
        Do not explicitly mention that this is a language practice session.
        Respond naturally as if this were a real conversation in the given scenario.`,
      },
    ];

    // Add the conversation history
    conversation.forEach((msg: { text: string; sender: string }) => {
      messages.push({
        role: msg.sender === "user" ? "user" : "assistant",
        content: msg.text,
      } as ChatCompletionMessageParam);
    });

    // Add the new user message
    messages.push({
      role: "user",
      content: userMessage,
    } as ChatCompletionMessageParam);

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: messages,
      max_tokens: 100,
      temperature: 0.7,
    });

    const content = response.choices[0]?.message.content;

    if (!content) {
      return NextResponse.json(
        { error: "Failed to generate response" },
        { status: 500 }
      );
    }

    return NextResponse.json({ response: content });
  } catch (error) {
    console.error("Error processing role play:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
