export type MessageNudgesInputSchema = {
  message?: string;
  audience?: string;
};

export type MessageNudgesOutputSchema = {
  nudges: Array<{ id: string; rewriteHint: string }>;
};

export const messageNudgesPromptPackV1 = {
  systemPrompt:
    "Evaluate message tone and suggest executive-safe rewrites while preserving intent.",
  inputSchema: {} as MessageNudgesInputSchema,
  outputSchema: {} as MessageNudgesOutputSchema,
  examples: [
    {
      input: { message: "You missed the deadline.", audience: "Ops VP" },
      output: { nudges: [{ id: "tone", rewriteHint: "Use neutral fact + request framing" }] },
    },
  ],
  version: "v1",
};
