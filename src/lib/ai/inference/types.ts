export type InferenceRole = "system" | "user" | "assistant" | "tool";

export interface InferenceMessage {
  role: InferenceRole;
  content: string;
}

export interface InferenceJsonSchema {
  name: string;
  schema: Record<string, unknown>;
  strict?: boolean;
}

export interface InferenceRequest {
  moduleId?: string;
  actor?: {
    actorType?: string;
    actorUserId?: string | null;
    actorAgentId?: string | null;
  };
  workspaceId?: string;
  projectId?: string;
  messages: InferenceMessage[];
  responseFormat?: {
    type: "json_schema" | "json_object" | "text";
    jsonSchema?: InferenceJsonSchema;
  };
  modelPreference?: string;
  temperature?: number;
  maxTokens?: number;
  timeoutMs?: number;
  metadata?: Record<string, unknown>;
}

export interface InferenceResponse {
  provider: string;
  model: string;
  content: string;
  parsedJson?: unknown;
  usage?: {
    inputTokens?: number;
    outputTokens?: number;
    totalTokens?: number;
  };
  finishReason?: string;
  latencyMs?: number;
  raw?: unknown;
}

export interface InferenceProvider {
  id: string;
  complete(request: InferenceRequest): Promise<InferenceResponse>;
}
