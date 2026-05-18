import { randomUUID } from "node:crypto";
import { resilientFetch } from "@/lib/ai/resilient-fetch";
import type { InferenceProvider, InferenceRequest, InferenceResponse } from "@/lib/ai/inference/types";

const OPENAI_CHAT_COMPLETIONS_URL = "https://api.openai.com/v1/chat/completions";
const DEFAULT_OPENAI_MODEL = process.env.DEFAULT_AI_MODEL ?? "gpt-4.1-mini";

export class OpenAIProvider implements InferenceProvider {
  id = "openai";

  async complete(request: InferenceRequest): Promise<InferenceResponse> {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("AI provider unavailable.");
    }

    const fetchResult = await resilientFetch<{
      choices?: Array<{ message?: { content?: string }; finish_reason?: string }>;
      usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number };
      model?: string;
    }>(
      OPENAI_CHAT_COMPLETIONS_URL,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: request.modelPreference ?? DEFAULT_OPENAI_MODEL,
          temperature: request.temperature ?? 0.2,
          max_tokens: request.maxTokens,
          response_format:
            request.responseFormat?.type === "json_schema"
              ? { type: "json_schema", json_schema: request.responseFormat.jsonSchema }
              : request.responseFormat?.type === "json_object"
                ? { type: "json_object" }
                : undefined,
          messages: request.messages,
        }),
      },
      {
        timeoutMs: request.timeoutMs ?? 20000,
        maxAttempts: 3,
        retryDelayMs: 500,
        operationName: request.moduleId ?? "inference",
        idempotencyKey: randomUUID(),
      }
    );

    if (!fetchResult.ok) {
      throw new Error(`AI provider request failed: ${fetchResult.errorClass}`);
    }

    const content = fetchResult.data.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error("AI provider returned empty response.");
    }

    return {
      provider: this.id,
      model: fetchResult.data.model ?? request.modelPreference ?? DEFAULT_OPENAI_MODEL,
      content,
      parsedJson: this.parseMaybeJson(content),
      usage: {
        inputTokens: fetchResult.data.usage?.prompt_tokens,
        outputTokens: fetchResult.data.usage?.completion_tokens,
        totalTokens: fetchResult.data.usage?.total_tokens,
      },
      finishReason: fetchResult.data.choices?.[0]?.finish_reason,
      latencyMs: fetchResult.durationMs,
      raw: fetchResult.data,
    };
  }

  private parseMaybeJson(content: string): unknown {
    try {
      return JSON.parse(content);
    } catch {
      return undefined;
    }
  }
}
