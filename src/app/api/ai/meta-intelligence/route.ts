import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { canUseAdvancedAi } from "@/lib/feature-gates";
import { denyResponse } from "@/lib/security/deny-response";
import { metaIntelligencePromptV1 } from "@/lib/ai/prompts/meta-intelligence.v1";
import { resilientFetch } from "@/lib/ai/resilient-fetch";

// TODO(aoc-gateway): This route calls OpenAI directly and must be migrated
// behind the AI gateway once the gateway supports meta-intelligence as a
// registered module. Until then, auth and feature gating are enforced inline.

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
  const user = await getAuthUser();
  if (!user) {
    return denyResponse({
      status: 401,
      routeId: "/api/ai/meta-intelligence",
      message: "Unauthorized",
      reason: "unauthorized",
    });
  }

  const advancedAiAccess = await canUseAdvancedAi(user.id);
  if (!advancedAiAccess.ok) {
    return NextResponse.json(
      {
        error: advancedAiAccess.error,
        feature: advancedAiAccess.feature,
        requiredPlan: advancedAiAccess.requiredPlan,
      },
      { status: 402 },
    );
  }

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
    const fetchResult = await resilientFetch<{
      choices?: Array<{ message?: { content?: string } }>;
      error?: { message?: string };
    }>(
      "https://api.openai.com/v1/chat/completions",
      {
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
      },
      {
        timeoutMs: 15000,
        maxAttempts: 2,
        retryDelayMs: 800,
        operationName: "meta-intelligence",
        idempotencyKey: randomUUID(),
      }
    );

    if (!fetchResult.ok) {
      return NextResponse.json(
        { error: "Meta intelligence temporarily unavailable.", code: fetchResult.errorClass },
        { status: fetchResult.errorClass === "rate_limited" ? 429 : 502 }
      );
    }

    const body = fetchResult.data;
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
