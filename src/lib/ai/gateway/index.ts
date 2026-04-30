import type { AIResponseEnvelope } from "@/lib/ai/types";
import { resolveModuleHandler } from "@/lib/ai/gateway/modules";
import type { AIGatewayContext, AIModuleId } from "@/lib/ai/gateway/types";

export const executeAIModule = async (
  moduleId: AIModuleId,
  context?: AIGatewayContext,
): Promise<AIResponseEnvelope<unknown>> => {
  const handler = resolveModuleHandler(moduleId);

  return handler(context);
};

export { aiModuleRegistry } from "@/lib/ai/gateway/modules";
export type { AIGatewayContext, AIGatewayModuleConfig, AIModuleId } from "@/lib/ai/gateway/types";
