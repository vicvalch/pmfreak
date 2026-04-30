import type { AIResponseEnvelope } from "@/lib/ai/types";
import { aiModuleRegistry } from "@/lib/ai/gateway/registry";
import type { AIModuleId, MemoryContext, RunAIModuleInput } from "@/lib/ai/gateway/types";
import { escalationGuidePromptPackV1 } from "@/lib/ai/prompts/escalation-guide.v1";
import { meetingsPromptPackV1 } from "@/lib/ai/prompts/meetings.v1";
import { messageNudgesPromptPackV1 } from "@/lib/ai/prompts/message-nudges.v1";
import { politicalRiskPromptPackV1 } from "@/lib/ai/prompts/political-risk.v1";
import { stakeholderIntelPromptPackV1 } from "@/lib/ai/prompts/stakeholder-intel.v1";
import type { MessageNudgesInputSchema, MessageNudgesOutputSchema } from "@/lib/ai/prompts/message-nudges.v1";

type MessageNudgesContext = {
  projectMemory: string[];
  recentEvents: string[];
  stakeholderSignals: string[];
};

type MessageNudgesDecision = NonNullable<MessageNudgesOutputSchema["decision"]>;

const messageNudgesEventStore: Array<{ at: string; input: MessageNudgesInputSchema; decision: MessageNudgesDecision }> = [];

const getMessageNudgesContext = (): MessageNudgesContext => ({
  projectMemory: [
    "Sponsor prefers neutral, facts-first status language.",
    "Prior escalations were delayed when messages implied personal fault.",
  ],
  recentEvents: [
    "Recovery-plan ask requested in latest SteerCo follow-up.",
    "Dependency slip discussed with executive visibility.",
  ],
  stakeholderSignals: [
    "Ops VP responds best to collaborative framing.",
    "Chief of Staff flagged tone sensitivity in sponsor updates.",
  ],
});

const clampScore = (value: number) => Math.max(0, Math.min(1, value));

const scoreToneRisk = (message: string): number => {
  const lowered = message.toLowerCase();
  const hardTriggers = ["missed", "failed", "unacceptable", "why didn't", "you need to"];
  const softeners = ["we", "align", "please", "could", "let's"];
  const hardHits = hardTriggers.filter((phrase) => lowered.includes(phrase)).length;
  const softerHits = softeners.filter((phrase) => lowered.includes(phrase)).length;
  return clampScore(0.35 + hardHits * 0.14 - softerHits * 0.05);
};

const scoreBlame = (message: string): number => {
  const lowered = message.toLowerCase();
  const secondPersonCount = (lowered.match(/\byou\b/g) ?? []).length;
  const directBlamePhrases = ["your fault", "you missed", "you failed", "you caused"];
  const blameHits = directBlamePhrases.filter((phrase) => lowered.includes(phrase)).length;
  return clampScore(0.2 + secondPersonCount * 0.12 + blameHits * 0.25);
};

const scoreAmbiguity = (message: string): number => {
  const lowered = message.toLowerCase();
  const hasTimeAnchor = /\b(today|tomorrow|eod|by\s+\w+day|\d{1,2}[:/]\d{1,2})\b/.test(lowered);
  const hasConcreteAsk = /\b(please|need|request|confirm|share|send|align)\b/.test(lowered);
  const hasOutcome = /\b(plan|timeline|owner|decision|next step|update)\b/.test(lowered);
  const ambiguityBase = 0.72;
  const reductions = (hasTimeAnchor ? 0.2 : 0) + (hasConcreteAsk ? 0.18 : 0) + (hasOutcome ? 0.18 : 0);
  return clampScore(ambiguityBase - reductions);
};

const toLevel = (score: number): "low" | "medium" | "high" => {
  if (score >= 0.7) {
    return "high";
  }
  if (score >= 0.4) {
    return "medium";
  }
  return "low";
};

const promptPacks: Partial<Record<AIModuleId, unknown>> = {
  "stakeholder-intel": stakeholderIntelPromptPackV1,
  meetings: meetingsPromptPackV1,
  "political-risk": politicalRiskPromptPackV1,
  "escalation-guide": escalationGuidePromptPackV1,
  "message-nudges": messageNudgesPromptPackV1,
};

export const getProjectContext = async (projectId?: string): Promise<MemoryContext> => {
  void projectId;
  // TODO: integrate Supabase memory
  return {
    stakeholders: [],
    recentEvents: [],
    risks: [],
  };
};

export async function runAIModule({
  moduleId,
  input,
  context,
}: RunAIModuleInput): Promise<AIResponseEnvelope<unknown>> {
  const moduleConfig = aiModuleRegistry.get(moduleId);

  if (!moduleConfig) {
    throw new Error(`Unknown AI module: ${moduleId}`);
  }

  const promptPack = promptPacks[moduleId];
  void promptPack;

  const memoryContext = await getProjectContext(context?.projectId);

  if (moduleConfig.mode === "openai") {
    if (moduleId !== "message-nudges") {
      throw new Error(`OpenAI mode is not implemented for module: ${moduleId}`);
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("Missing OPENAI_API_KEY on the server.");
    }

    const payload = input as Partial<MessageNudgesInputSchema>;
    const rawMessage = payload.rawMessage?.trim() ?? "";
    const audience = payload.audience?.trim() ?? "";
    if (!rawMessage || !audience) {
      throw new Error("message-nudges requires rawMessage and audience.");
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MESSAGE_NUDGES_MODEL ?? "gpt-4.1-mini",
        temperature: 0.2,
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "message_nudges_v1",
            strict: true,
            schema: {
              type: "object",
              additionalProperties: false,
              properties: {
                toneRisk: { type: "string", enum: ["low", "medium", "high"] },
                rewriteSuggestion: { type: "string" },
                improvedVersion: { type: "string" },
                confidence: { type: "string", enum: ["low", "medium", "high", "very-high"] },
                rationale: { type: "string" },
              },
              required: ["toneRisk", "rewriteSuggestion", "improvedVersion", "confidence", "rationale"],
            },
          },
        },
        messages: [
          { role: "system", content: messageNudgesPromptPackV1.systemPrompt },
          {
            role: "user",
            content: [
              `Audience: ${audience}`,
              `Raw message: ${rawMessage}`,
              "Context for better organizational fit:",
              ...getMessageNudgesContext().projectMemory.map((item) => `- Project memory: ${item}`),
              ...getMessageNudgesContext().recentEvents.map((item) => `- Recent event: ${item}`),
              ...getMessageNudgesContext().stakeholderSignals.map((item) => `- Stakeholder signal: ${item}`),
            ].join("\n"),
          },
        ],
      }),
    });

    const body = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
      error?: { message?: string };
    };

    if (!response.ok) {
      throw new Error(body.error?.message ?? "OpenAI API request failed for message-nudges.");
    }

    const content = body.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error("OpenAI returned empty response for message-nudges.");
    }

    const output = JSON.parse(content) as MessageNudgesOutputSchema;
    const toneScore = scoreToneRisk(rawMessage);
    const blameScore = scoreBlame(rawMessage);
    const ambiguityScore = scoreAmbiguity(rawMessage);
    const overallRisk = clampScore(toneScore * 0.45 + blameScore * 0.35 + ambiguityScore * 0.2);

    const recommendation =
      overallRisk >= 0.7
        ? "Rewrite with neutral facts, shared accountability, and a concrete ask before sending."
        : overallRisk >= 0.4
          ? "Tighten language with clearer ask and less direct attribution."
          : "Message is mostly safe; apply minor clarity polish.";

    const decision: MessageNudgesDecision = {
      risk: {
        tone: Number(toneScore.toFixed(2)),
        blame: Number(blameScore.toFixed(2)),
        ambiguity: Number(ambiguityScore.toFixed(2)),
        overall: Number(overallRisk.toFixed(2)),
      },
      recommendation: {
        primaryAction: recommendation,
        reason: `Tone=${toLevel(toneScore)}, Blame=${toLevel(blameScore)}, Ambiguity=${toLevel(ambiguityScore)} from heuristic analysis.`,
      },
      alternatives: [
        "Use a neutral fact + recovery-plan framing.",
        "Convert 'you' statements into joint ownership language.",
        "Add explicit timeline and owner request.",
      ],
      confidence: Number((0.55 + overallRisk * 0.35).toFixed(2)),
    };

    const enrichedOutput: MessageNudgesOutputSchema = {
      ...output,
      toneRisk: toLevel(Math.max(toneScore, overallRisk)),
      confidence:
        decision.confidence >= 0.86
          ? "very-high"
          : decision.confidence >= 0.72
            ? "high"
            : decision.confidence >= 0.52
              ? "medium"
              : "low",
      decision,
    };

    messageNudgesEventStore.unshift({
      at: new Date().toISOString(),
      input: { rawMessage, audience },
      decision,
    });
    messageNudgesEventStore.splice(30);

    return {
      module: moduleId,
      generatedAt: new Date().toISOString(),
      confidence: enrichedOutput.confidence,
      summary: enrichedOutput.rewriteSuggestion,
      data: enrichedOutput,
    };
  }

  if (moduleConfig.mode === "hybrid") {
    // TODO: integrate OpenAI
    // TODO: integrate Supabase memory
    throw new Error(`Hybrid mode is not implemented for module: ${moduleId}`);
  }

  // TODO: add tracing / logging
  return moduleConfig.handler({
    input,
    context,
    memory: memoryContext,
  });
}
