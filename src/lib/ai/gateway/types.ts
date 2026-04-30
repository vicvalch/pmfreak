import type { AIResponseEnvelope } from "@/lib/ai/types";

export type AIModuleId =
  | "message-nudges"
  | "meetings"
  | "stakeholder-intel"
  | "political-risk"
  | "escalation-guide"
  | "project-memory";

export type AIProvider = "mock" | "openai" | "supabase";

export type AIInputSchemaField = {
  name: string;
  type: "string" | "number" | "boolean" | "object" | "array";
  required: boolean;
  description: string;
};

export type AIInputSchema = {
  description: string;
  fields: AIInputSchemaField[];
};

export type AIGatewayModuleConfig = {
  moduleId: AIModuleId;
  endpointPath: string;
  promptVersion: string;
  inputSchema: AIInputSchema;
  outputEnvelopeType: string;
  provider: AIProvider;
};

export type AIGatewayContext = {
  input?: unknown;
};

export type AIGatewayHandler = (context?: AIGatewayContext) => Promise<AIResponseEnvelope<unknown>>;
