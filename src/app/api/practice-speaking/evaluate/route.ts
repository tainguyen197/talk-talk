import { OpenAI } from "openai";
import { NextRequest, NextResponse } from "next/server";

// Initialize the OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { userResponse, conversationHistory } = await request.json();

    if (!userResponse || typeof userResponse !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid userResponse parameter" },
        { status: 400 }
      );
    }

    // Get the last AI question for context
    const lastAiMessage = conversationHistory
      ?.reverse()
      .find((msg: any) => msg.sender === "ai");

    const contextQuestion = lastAiMessage ? lastAiMessage.text : "";

    const systemPrompt = `You are an expert English language teacher providing feedback on a student's spoken/written response. Your task is to:

1. **Grammar Analysis**: Identify any grammar mistakes, tense errors, or structural issues
2. **Natural Phrasing**: Evaluate if the response sounds natural and suggest improvements
3. **Context Appropriateness**: Check if the response appropriately answers the question
4. **Constructive Feedback**: Provide encouraging, helpful corrections and tips

**Important Guidelines**:
- Be encouraging and positive
- Focus on 1-3 main issues (don't overwhelm with too many corrections)
- Provide clear explanations for corrections
- Suggest alternative phrasings when helpful
- If the response is good, acknowledge it positively
- Give practical tips for improvement

**Response Format**: Return a JSON object with this exact structure:
{
  "feedback": {
    "corrections": [
      {
        "original": "exact phrase that needs correction",
        "corrected": "the corrected version",
        "explanation": "why this is better"
      }
    ],
    "tips": [
      "helpful tip 1",
      "helpful tip 2"
    ],
    "overall": "overall encouraging feedback summary"
  }
}

If there are no major issues, corrections array can be empty but still provide positive feedback and maybe one small tip.`;

    const userPrompt = `Question context: "${contextQuestion}"

Student's response: "${userResponse}"

Please evaluate this response and provide helpful feedback.`;

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
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    const content = response.choices[0]?.message.content;

    if (!content) {
      return NextResponse.json(
        { error: "Failed to generate evaluation" },
        { status: 500 }
      );
    }

    try {
      const parsedResponse = JSON.parse(content);
      return NextResponse.json(parsedResponse);
    } catch (error) {
      console.error("Error parsing evaluation response:", error);
      return NextResponse.json(
        { error: "Failed to parse evaluation response" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error evaluating response:", error);
    return NextResponse.json(
      { error: "Failed to process evaluation request" },
      { status: 500 }
    );
  }
}
