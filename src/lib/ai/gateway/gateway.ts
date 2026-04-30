import type { AIResponseEnvelope } from "@/lib/ai/types";
import { aiModuleRegistry } from "@/lib/ai/gateway/registry";
import type { AIModuleId, MemoryContext, RunAIModuleInput } from "@/lib/ai/gateway/types";
import { escalationGuidePromptPackV1 } from "@/lib/ai/prompts/escalation-guide.v1";
import { meetingsPromptPackV1 } from "@/lib/ai/prompts/meetings.v1";
import { messageNudgesPromptPackV1 } from "@/lib/ai/prompts/message-nudges.v1";
import { politicalRiskPromptPackV1 } from "@/lib/ai/prompts/political-risk.v1";
import { stakeholderIntelPromptPackV1 } from "@/lib/ai/prompts/stakeholder-intel.v1";
import type { MessageNudgesInputSchema, MessageNudgesOutputSchema } from "@/lib/ai/prompts/message-nudges.v1";

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
          { role: "user", content: `Audience: ${audience}\nRaw message: ${rawMessage}` },
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

    return {
      module: moduleId,
      generatedAt: new Date().toISOString(),
      confidence: output.confidence,
      summary: output.rewriteSuggestion,
      data: output,
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
