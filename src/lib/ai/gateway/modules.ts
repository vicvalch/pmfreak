import {
  escalationGuideEnvelope,
  meetingsEnvelope,
  messageNudgesEnvelope,
  politicalRiskEnvelope,
  projectMemoryEnvelope,
  stakeholderIntelEnvelope,
} from "@/lib/ai/mock-data";
import type {
  AIGatewayHandler,
  AIGatewayModuleConfig,
  AIModuleId,
  AIProvider,
} from "@/lib/ai/gateway/types";

const createModuleHandler = (moduleId: AIModuleId): AIGatewayHandler => async () => {
  switch (moduleId) {
    case "message-nudges":
      return messageNudgesEnvelope;
    case "meetings":
      return meetingsEnvelope;
    case "stakeholder-intel":
      return stakeholderIntelEnvelope;
    case "political-risk":
      return politicalRiskEnvelope;
    case "escalation-guide":
      return escalationGuideEnvelope;
    case "project-memory":
      return projectMemoryEnvelope;
  }
};

const createProviderAdapters = () => ({
  mock: createModuleHandler,
  // Future insertion point: swap in OpenAI-backed resolvers per module.
  openai: createModuleHandler,
  // Future insertion point: swap in Supabase-backed resolvers per module.
  supabase: createModuleHandler,
});

const providerAdapters: Record<AIProvider, (moduleId: AIModuleId) => AIGatewayHandler> = createProviderAdapters();

const getInputSchema = (moduleId: AIModuleId) => ({
  description: `${moduleId} request payload schema`,
  fields: [
    {
      name: "context",
      type: "object" as const,
      required: false,
      description: "Optional contextual payload for real provider integrations.",
    },
  ],
});

const MODULE_CONFIGS: AIGatewayModuleConfig[] = [
  {
    moduleId: "message-nudges",
    endpointPath: "/api/ai/message-nudges",
    promptVersion: "v1",
    inputSchema: getInputSchema("message-nudges"),
    outputEnvelopeType: "AIResponseEnvelope<AIResponseCard[]>",
    provider: "mock",
  },
  {
    moduleId: "meetings",
    endpointPath: "/api/ai/meetings",
    promptVersion: "v1",
    inputSchema: getInputSchema("meetings"),
    outputEnvelopeType: "AIResponseEnvelope<AIResponseCard[]>",
    provider: "mock",
  },
  {
    moduleId: "stakeholder-intel",
    endpointPath: "/api/ai/stakeholder-intel",
    promptVersion: "v1",
    inputSchema: getInputSchema("stakeholder-intel"),
    outputEnvelopeType: "AIResponseEnvelope<AIResponseCard[]>",
    provider: "mock",
  },
  {
    moduleId: "political-risk",
    endpointPath: "/api/ai/political-risk",
    promptVersion: "v1",
    inputSchema: getInputSchema("political-risk"),
    outputEnvelopeType: "AIResponseEnvelope<AIResponseCard[]>",
    provider: "mock",
  },
  {
    moduleId: "escalation-guide",
    endpointPath: "/api/ai/escalation-guide",
    promptVersion: "v1",
    inputSchema: getInputSchema("escalation-guide"),
    outputEnvelopeType: "AIResponseEnvelope<AIResponseCard[]>",
    provider: "mock",
  },
  {
    moduleId: "project-memory",
    endpointPath: "/api/ai/project-memory",
    promptVersion: "v1",
    inputSchema: getInputSchema("project-memory"),
    outputEnvelopeType: "AIResponseEnvelope<MemoryEvent[]>",
    provider: "mock",
  },
];

export const aiModuleRegistry = new Map<AIModuleId, AIGatewayModuleConfig>(
  MODULE_CONFIGS.map((moduleConfig) => [moduleConfig.moduleId, moduleConfig]),
);

export const resolveModuleHandler = (moduleId: AIModuleId): AIGatewayHandler => {
  const moduleConfig = aiModuleRegistry.get(moduleId);

  if (!moduleConfig) {
    throw new Error(`No AI gateway module config found for module: ${moduleId}`);
  }

  return providerAdapters[moduleConfig.provider](moduleId);
};
