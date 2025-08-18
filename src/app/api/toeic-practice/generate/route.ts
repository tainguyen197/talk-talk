import { OpenAI } from "openai";
import { NextRequest, NextResponse } from "next/server";

// Initialize the OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { level, questionCount } = await request.json();

    if (!level || !questionCount) {
      return NextResponse.json(
        { error: "Missing required parameters: level and questionCount" },
        { status: 400 }
      );
    }

    const systemPrompt = `You are an expert TOEIC test creator specialized in generating high-quality practice questions for B2 level English learners.

Create ${questionCount} multiple-choice TOEIC practice questions at exactly ${level} level difficulty. Focus on:

**Content Areas:**
- Grammar: verb tenses, conditionals, passive voice, modal verbs, relative clauses
- Vocabulary: business English, academic words, collocations, phrasal verbs  
- Sentence Structure: complex sentences, word order, connectors

**B2 Level Requirements:**
- Intermediate-advanced vocabulary (CEFR B2 level)
- Complex grammatical structures
- Business and professional contexts
- Academic and formal language
- Real-world scenarios

**Question Format:**
Each question must have:
- A clear, complete sentence with one blank or a grammar/vocabulary question
- Exactly 4 multiple choice options (A, B, C, D)
- Only ONE clearly correct answer
- Plausible distractors that test common mistakes
- A detailed explanation of why the correct answer is right and why others are wrong

**Categories:** Mix questions across these categories:
- "grammar" (50%)
- "vocabulary" (30%)  
- "sentence_structure" (20%)

Return a JSON object with this exact structure:
{
  "questions": [
    {
      "id": 1,
      "question": "Complete sentence with blank or question about grammar/vocab",
      "options": ["option A", "option B", "option C", "option D"],
      "correctAnswer": 0,
      "explanation": "Detailed explanation of the correct answer and why other options are incorrect",
      "category": "grammar"
    }
  ]
}

Make questions authentic, practical, and exactly at B2 difficulty level.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: `Generate ${questionCount} TOEIC practice questions at ${level} level. Ensure variety in topics and question types.`,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 4000,
    });

    const content = response.choices[0]?.message.content;

    if (!content) {
      return NextResponse.json(
        { error: "Failed to generate questions" },
        { status: 500 }
      );
    }

    try {
      // Parse the JSON response
      const parsedResponse = JSON.parse(content);

      // Validate the response structure
      if (
        !parsedResponse.questions ||
        !Array.isArray(parsedResponse.questions)
      ) {
        throw new Error("Invalid response structure");
      }

      // Validate each question has required fields
      const validatedQuestions = parsedResponse.questions.map(
        (q: any, index: number) => ({
          id: index + 1,
          question: q.question || "",
          options:
            Array.isArray(q.options) && q.options.length === 4
              ? q.options
              : ["Option A", "Option B", "Option C", "Option D"],
          correctAnswer:
            typeof q.correctAnswer === "number" &&
            q.correctAnswer >= 0 &&
            q.correctAnswer < 4
              ? q.correctAnswer
              : 0,
          explanation: q.explanation || "Explanation not provided.",
          category: ["grammar", "vocabulary", "sentence_structure"].includes(
            q.category
          )
            ? q.category
            : "grammar",
        })
      );

      return NextResponse.json({ questions: validatedQuestions });
    } catch (parseError) {
      console.error("Error parsing response:", parseError);

      // Return fallback questions if parsing fails
      const fallbackQuestions = generateFallbackQuestions();
      return NextResponse.json({ questions: fallbackQuestions });
    }
  } catch (error) {
    console.error("Error generating TOEIC questions:", error);

    // Return fallback questions in case of any error
    const fallbackQuestions = generateFallbackQuestions();
    return NextResponse.json({ questions: fallbackQuestions });
  }
}

function generateFallbackQuestions() {
  return [
    {
      id: 1,
      question:
        "The company's new policy will _______ all employees starting next month.",
      options: ["effect", "affect", "affects", "effects"],
      correctAnswer: 1,
      explanation:
        "'Affect' is a verb meaning to influence or make a change. 'Effect' is a noun meaning a result or consequence. Here we need a verb, so 'affect' is correct.",
      category: "vocabulary",
    },
    {
      id: 2,
      question:
        "If I _______ you yesterday, I would have told you about the meeting.",
      options: ["saw", "had seen", "have seen", "would see"],
      correctAnswer: 1,
      explanation:
        "This is a third conditional sentence expressing a hypothetical past situation. The structure is: If + past perfect, would have + past participle.",
      category: "grammar",
    },
    {
      id: 3,
      question:
        "The project must be completed _______ the deadline to avoid penalties.",
      options: ["until", "by", "during", "through"],
      correctAnswer: 1,
      explanation:
        "'By' indicates a deadline - something must happen before or at that time. 'Until' means continuing up to that point, 'during' means within a period, and 'through' means from beginning to end.",
      category: "vocabulary",
    },
    {
      id: 4,
      question:
        "_______ the weather was terrible, we decided to continue with our outdoor event.",
      options: ["Despite", "Although", "Because", "Since"],
      correctAnswer: 1,
      explanation:
        "'Although' introduces a contrast between two clauses. 'Despite' would need a noun/gerund, not a full clause. 'Because' and 'Since' show cause, not contrast.",
      category: "sentence_structure",
    },
    {
      id: 5,
      question:
        "The manager asked her assistant _______ the reports before the meeting.",
      options: ["prepare", "to prepare", "preparing", "prepared"],
      correctAnswer: 1,
      explanation:
        "After 'ask someone', we use the infinitive form 'to + base verb'. This is the standard pattern: ask + object + to + infinitive.",
      category: "grammar",
    },
    {
      id: 6,
      question:
        "Our sales figures have improved _______ since we launched the new marketing campaign.",
      options: ["dramatically", "dramatic", "drama", "dramatical"],
      correctAnswer: 0,
      explanation:
        "'Dramatically' is an adverb modifying the verb 'improved'. We need an adverb to describe how the improvement happened. 'Dramatic' is an adjective, and the other options are incorrect forms.",
      category: "vocabulary",
    },
    {
      id: 7,
      question:
        "The conference room _______ for the board meeting at 2 PM tomorrow.",
      options: [
        "will reserve",
        "is reserving",
        "has been reserved",
        "reserves",
      ],
      correctAnswer: 2,
      explanation:
        "We need the passive voice here because the room receives the action. 'Has been reserved' indicates the reservation was completed in the past with present relevance.",
      category: "grammar",
    },
    {
      id: 8,
      question:
        "_______ working overtime, she still couldn't finish the project on time.",
      options: ["Despite", "Although", "Because of", "In spite"],
      correctAnswer: 0,
      explanation:
        "'Despite' is followed by a gerund or noun phrase. 'Despite working' is correct. 'Although' needs a full clause, 'Because of' shows cause (not contrast), and 'In spite' needs 'of'.",
      category: "sentence_structure",
    },
    {
      id: 9,
      question:
        "The client expressed his _______ with the quality of our service.",
      options: ["satisfaction", "satisfactory", "satisfy", "satisfied"],
      correctAnswer: 0,
      explanation:
        "We need a noun after the possessive 'his'. 'Satisfaction' is the noun form. 'Satisfactory' is an adjective, 'satisfy' is a verb, and 'satisfied' is an adjective/past participle.",
      category: "vocabulary",
    },
    {
      id: 10,
      question:
        "_______ carefully you plan, unexpected problems may still arise.",
      options: ["However", "Whatever", "Wherever", "Whenever"],
      correctAnswer: 0,
      explanation:
        "'However' + adjective/adverb means 'no matter how'. The sentence means 'No matter how carefully you plan'. The other options don't fit grammatically or semantically.",
      category: "sentence_structure",
    },
  ];
}
