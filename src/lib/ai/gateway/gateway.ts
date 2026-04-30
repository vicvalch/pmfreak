import type { AIResponseEnvelope } from "@/lib/ai/types";
import { aiModuleRegistry } from "@/lib/ai/gateway/registry";
import type { AIModuleId, MemoryContext, RunAIModuleInput } from "@/lib/ai/gateway/types";
import { escalationGuidePromptPackV1 } from "@/lib/ai/prompts/escalation-guide.v1";
import { meetingsPromptPackV1 } from "@/lib/ai/prompts/meetings.v1";
import { messageNudgesPromptPackV1 } from "@/lib/ai/prompts/message-nudges.v1";
import { politicalRiskPromptPackV1 } from "@/lib/ai/prompts/political-risk.v1";
import { stakeholderIntelPromptPackV1 } from "@/lib/ai/prompts/stakeholder-intel.v1";

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
    // TODO: integrate OpenAI
    // TODO: add token usage tracking
    throw new Error(`OpenAI mode is not implemented for module: ${moduleId}`);
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
