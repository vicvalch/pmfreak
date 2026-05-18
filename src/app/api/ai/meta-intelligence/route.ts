import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { canUseAdvancedAi } from "@/lib/feature-gates";
import { denyResponse } from "@/lib/security/deny-response";
import { metaIntelligencePromptV1 } from "@/lib/ai/prompts/meta-intelligence.v1";
import { runInferenceGateway } from "@/lib/ai/gateway/inference-gateway";

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

  try {
    const inference = await runInferenceGateway({
      moduleId: "meta-intelligence",
      actor: { actorType: "user", actorUserId: user.id },
      messages: [
        { role: "system", content: metaIntelligencePromptV1.systemPrompt },
        { role: "user", content: userInput },
      ],
      responseFormat: { type: "json_object" },
      temperature: 0.1,
      timeoutMs: 15000,
      modelPreference: process.env.OPENAI_META_INTELLIGENCE_MODEL,
      metadata: { estimatedSensitivity: "internal", dataClasses: ["user_prompt"], moduleId: "meta-intelligence" },
    });

    const content = inference.content;
    if (!content) {
      return NextResponse.json(
        { error: "Meta intelligence returned empty response." },
        { status: 502 },
      );
    }

    const parsed = (inference.parsedJson ?? JSON.parse(content)) as unknown;
    return NextResponse.json(parsed);
  } catch {
    return NextResponse.json({ error: "Meta intelligence temporarily unavailable." }, { status: 502 });
  }
}
