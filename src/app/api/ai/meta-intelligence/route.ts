import { NextResponse } from "next/server";
import { metaIntelligencePromptV1 } from "@/lib/ai/prompts/meta-intelligence.v1";

type MetaIntelligenceRequest = {
  userInput?: string;
};

export async function GET() {
  return NextResponse.json(
    { error: "Use POST with { userInput }." },
    { status: 405 },
  );
}

export async function POST(request: Request) {
  let payload: MetaIntelligenceRequest;

  try {
    payload = (await request.json()) as MetaIntelligenceRequest;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const userInput = payload.userInput?.trim();
  if (!userInput) {
    return NextResponse.json(
      { error: "Missing required field: userInput." },
      { status: 400 },
    );
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Missing OPENAI_API_KEY on server." },
      { status: 500 },
    );
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_META_INTELLIGENCE_MODEL ?? "gpt-4.1-mini",
        temperature: 0.1,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: metaIntelligencePromptV1.systemPrompt },
          { role: "user", content: userInput },
        ],
      }),
    });

    const body = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
      error?: { message?: string };
    };

    if (!response.ok) {
      return NextResponse.json(
        { error: body.error?.message ?? "Meta intelligence request failed." },
        { status: 502 },
      );
    }

    const content = body.choices?.[0]?.message?.content;
    if (!content) {
      return NextResponse.json(
        { error: "Meta intelligence returned empty response." },
        { status: 502 },
      );
    }

    const parsed = JSON.parse(content) as unknown;
    return NextResponse.json(parsed);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected server error.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
