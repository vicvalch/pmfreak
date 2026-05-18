import type { InferenceProvider, InferenceRequest, InferenceResponse } from "@/lib/ai/inference/types";
import { OpenAIProvider } from "@/lib/ai/providers/openai-provider";

const DEFAULT_AI_PROVIDER = process.env.DEFAULT_AI_PROVIDER ?? "openai";

const providers = new Map<string, InferenceProvider>();
providers.set("openai", new OpenAIProvider());

export function resolveInferenceProvider(request: InferenceRequest): InferenceProvider {
  const preferredProvider = (request.metadata?.provider as string | undefined) ?? DEFAULT_AI_PROVIDER;
  const provider = providers.get(preferredProvider);
  if (!provider) {
    throw new Error(`No inference provider registered for '${preferredProvider}'.`);
  }
  return provider;
}

export async function runProviderInference(request: InferenceRequest): Promise<InferenceResponse> {
  const provider = resolveInferenceProvider(request);
  return provider.complete(request);
}
