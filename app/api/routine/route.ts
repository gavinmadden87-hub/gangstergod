import { NextRequest, NextResponse } from "next/server";
import { openai } from "@/lib/ai/client";
import { gangsterGodCorePrompt } from "@/lib/ai/prompts/gangsterGodCore";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { focus } = body;

    // Validate input
    if (!focus || typeof focus !== "string" || focus.trim().length === 0) {
      return NextResponse.json(
        { error: "Invalid input: focus must be a non-empty string" },
        { status: 400 }
      );
    }

    const prompt = `
${gangsterGodCorePrompt}

Task:
Generate a Gangster God daily routine for focus: ${focus}.

Return JSON:
{
  "summary": string,
  "morning": string[],
  "day": string[],
  "night": string[],
  "nonNegotiables": string[]
}
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }]
    });

    // Validate response structure
    if (!completion.choices || completion.choices.length === 0) {
      return NextResponse.json(
        { error: "Invalid API response: no choices returned" },
        { status: 500 }
      );
    }

    const message = completion.choices[0]?.message;
    if (!message) {
      return NextResponse.json(
        { error: "Invalid API response: no message in choice" },
        { status: 500 }
      );
    }

    const content = message.content;
    if (!content) {
      return NextResponse.json(
        { error: "Invalid API response: no content in message" },
        { status: 500 }
      );
    }

    return NextResponse.json(JSON.parse(content));
  } catch (error) {
    console.error("Error in routine generation:", error);
    
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Invalid JSON response from AI model" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Failed to generate routine" },
      { status: 500 }
    );
  }
}
