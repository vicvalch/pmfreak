import {
  enrichWithPortfolioIntelligence,
  readProjectMemory,
  type StoredProjectAnalysis,
  writeProjectMemory,
} from "@/lib/project-memory";

const ANALYSIS_JSON_SCHEMA = {
  name: "scopeguard_ai_analysis",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      executive_summary: { type: "string" },
      functional_requirements: {
        type: "array",
        items: { type: "string" },
      },
      non_functional_requirements: {
        type: "array",
        items: { type: "string" },
      },
      risks: {
        type: "array",
        items: { type: "string" },
      },
      dependencies: {
        type: "array",
        items: { type: "string" },
      },
      ambiguities: {
        type: "array",
        items: { type: "string" },
      },
      missing_information: {
        type: "array",
        items: { type: "string" },
      },
      client_questions: {
        type: "array",
        items: { type: "string" },
      },
      suggested_next_steps: {
        type: "array",
        items: { type: "string" },
      },
      complexity: {
        type: "string",
        enum: ["Low", "Medium", "High"],
      },
    },
    required: [
      "executive_summary",
      "functional_requirements",
      "non_functional_requirements",
      "risks",
      "dependencies",
      "ambiguities",
      "missing_information",
      "client_questions",
      "suggested_next_steps",
      "complexity",
    ],
  },
};

type AnalyzeRequestPayload = {
  projectName?: string;
  extractedScopeText?: string;
  sourceFileNames?: string[];
};

type AIAnalysisResult = {
  executive_summary: string;
  functional_requirements: string[];
  non_functional_requirements: string[];
  risks: string[];
  dependencies: string[];
  ambiguities: string[];
  missing_information: string[];
  client_questions: string[];
  suggested_next_steps: string[];
  complexity: "Low" | "Medium" | "High";
};

type AIAnalysisResponse = AIAnalysisResult & {
  similar_projects: string[];
  historical_risks: string[];
  estimated_relative_complexity: string;
};

const normalizeStringArray = (value: unknown) => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter((item) => item.length > 0)
    .slice(0, 12);
};

const coerceAnalysisResult = (value: unknown): AIAnalysisResult | null => {
  if (!value || typeof value !== "object") {
    return null;
  }

  const candidate = value as Partial<AIAnalysisResult>;
  const complexity =
    candidate.complexity === "Low" || candidate.complexity === "Medium" || candidate.complexity === "High"
      ? candidate.complexity
      : null;

  if (!complexity || typeof candidate.executive_summary !== "string") {
    return null;
  }

  return {
    executive_summary: candidate.executive_summary.trim(),
    functional_requirements: normalizeStringArray(candidate.functional_requirements),
    non_functional_requirements: normalizeStringArray(candidate.non_functional_requirements),
    risks: normalizeStringArray(candidate.risks),
    dependencies: normalizeStringArray(candidate.dependencies),
    ambiguities: normalizeStringArray(candidate.ambiguities),
    missing_information: normalizeStringArray(candidate.missing_information),
    client_questions: normalizeStringArray(candidate.client_questions),
    suggested_next_steps: normalizeStringArray(candidate.suggested_next_steps),
    complexity,
  };
};

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return Response.json({ error: "Missing OPENAI_API_KEY on the server." }, { status: 500 });
  }

  let payload: AnalyzeRequestPayload;

  try {
    payload = (await request.json()) as AnalyzeRequestPayload;
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const projectName = payload.projectName?.trim() ?? "";
  const extractedScopeText = payload.extractedScopeText?.trim() ?? "";
  const sourceFileNames = normalizeStringArray(payload.sourceFileNames);

  if (!projectName) {
    return Response.json({ error: "Project name is required." }, { status: 400 });
  }

  if (!extractedScopeText) {
    return Response.json({ error: "Extracted scope text is required." }, { status: 400 });
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        temperature: 0.2,
        response_format: {
          type: "json_schema",
          json_schema: ANALYSIS_JSON_SCHEMA,
        },
        messages: [
          {
            role: "system",
            content:
              "You are ScopeGuard AI. Return only valid JSON that matches the provided schema. Keep bullets practical and concise.",
          },
          {
            role: "user",
            content: `Analyze this project scope and produce a complete structured assessment.\n\nProject Name: ${projectName}\n\nExtracted Scope Text:\n${extractedScopeText.slice(0, 16000)}`,
          },
        ],
      }),
    });

    const body = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
      error?: { message?: string };
    };

    if (!response.ok) {
      return Response.json(
        {
          error:
            body.error?.message ||
            "OpenAI API request failed. Please retry or use the Sprint 4 fallback analysis.",
        },
        { status: 502 },
      );
    }

    const content = body.choices?.[0]?.message?.content;

    if (!content) {
      return Response.json({ error: "OpenAI API returned an empty response." }, { status: 502 });
    }

    const parsed = JSON.parse(content) as unknown;
    const analysis = coerceAnalysisResult(parsed);

    if (!analysis) {
      return Response.json({ error: "OpenAI response could not be validated." }, { status: 502 });
    }

    const previousProjects = await readProjectMemory();

    const recordBase: Omit<
      StoredProjectAnalysis,
      "similarProjects" | "historicalRisks" | "estimatedRelativeComplexity"
    > = {
      id: crypto.randomUUID(),
      projectName,
      uploadDate: new Date().toISOString(),
      executiveSummary: analysis.executive_summary,
      requirements: [...analysis.functional_requirements, ...analysis.non_functional_requirements],
      risks: analysis.risks,
      dependencies: analysis.dependencies,
      ambiguities: analysis.ambiguities,
      complexity: analysis.complexity,
      sourceFileNames,
    };

    const intelligence = enrichWithPortfolioIntelligence(recordBase, previousProjects);

    await writeProjectMemory([
      {
        ...recordBase,
        ...intelligence,
      },
      ...previousProjects,
    ]);

    const enrichedResponse: AIAnalysisResponse = {
      ...analysis,
      similar_projects: intelligence.similarProjects,
      historical_risks: intelligence.historicalRisks,
      estimated_relative_complexity: intelligence.estimatedRelativeComplexity,
    };

    return Response.json(enrichedResponse);
  } catch {
    return Response.json(
      {
        error: "Unable to run AI analysis right now. Please retry shortly.",
      },
      { status: 502 },
    );
  }
}
