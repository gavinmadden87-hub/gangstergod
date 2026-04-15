import { NextRequest, NextResponse } from "next/server";
import { openai } from "@/lib/ai/client";
import { gangsterGodCorePrompt } from "@/lib/ai/prompts/gangsterGodCore";

export async function POST(req: NextRequest) {
  try {
    // Parse and validate request body
    let body: unknown;
    try {
      body = await req.json();
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    // Validate focus parameter
    const { focus } = body as { focus?: unknown };
    if (!focus || typeof focus !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid 'focus' parameter" },
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

    // Call OpenAI API
    let completion;
    try {
      completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }]
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown OpenAI API error";
      console.error("OpenAI API error:", errorMessage);
      return NextResponse.json(
        { error: "Failed to generate routine from OpenAI" },
        { status: 500 }
      );
    }

    // Parse response content
    const content = completion.choices[0]?.message.content;
    if (!content) {
      return NextResponse.json(
        { error: "No content in OpenAI response" },
        { status: 500 }
      );
    }

    // Parse JSON from completion
    let parsedContent;
    try {
      parsedContent = JSON.parse(content);
    } catch (error) {
      console.error("Failed to parse OpenAI response as JSON:", content);
      return NextResponse.json(
        { error: "OpenAI response was not valid JSON" },
        { status: 500 }
      );
    }

    return NextResponse.json(parsedContent);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("Unexpected error in routine handler:", errorMessage);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
