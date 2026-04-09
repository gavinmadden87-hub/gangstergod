import { NextRequest, NextResponse } from "next/server";
import { openai } from "@/lib/ai/client";
import { gangsterGodCorePrompt } from "@/lib/ai/prompts/gangsterGodCore";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { focus } = body;

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
    model: "gpt-4.1-mini",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" }
  });

  const content = completion.choices[0].message.content;
  return NextResponse.json(JSON.parse(content ?? "{}"));
}
