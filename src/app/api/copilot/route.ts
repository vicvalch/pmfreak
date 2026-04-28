import { getAuthUser, type UserRole } from "@/lib/auth";
import { getCompanySubscription, type SubscriptionPlan } from "@/lib/billing";
import { canRunAiAnalysis, canUsePortfolioMemory } from "@/lib/plan-access";
import { readProjectMemory, type StoredProjectAnalysis } from "@/lib/project-memory";

type CopilotRequest = {
  message?: string;
  projectId?: string;
  projectName?: string;
  companyId?: string;
  role?: UserRole;
  methodology?: "PMI" | "Agile" | "Hybrid" | "General PMO";
};

type CopilotResponse = {
  answer: string;
  cards: Array<{ type: "Risks" | "Next Actions" | "Draft Email" | "RACI" | "Checklist"; title: string; items: string[] }>;
  facts: string[];
  bestPractices: string[];
  assumptions: string[];
  requiresMoreContext: boolean;
  contextGapQuestions: string[];
  plan: SubscriptionPlan;
  aiPowered: boolean;
  methodology: "PMI" | "Agile" | "Hybrid" | "General PMO";
};

const normalize = (v: string) => v.toLowerCase().trim();

const safeList = (items: string[], limit = 8) => items.map((item) => item.trim()).filter(Boolean).slice(0, limit);

const getMethodologyGuide = (methodology: CopilotResponse["methodology"]) => {
  switch (methodology) {
    case "PMI":
      return "Use predictive project controls, baselines, RAID log discipline, integrated change control, and formal stage gates.";
    case "Agile":
      return "Use iterative planning, backlog prioritization, sprint cadence, demos, retrospectives, and fast feedback loops.";
    case "General PMO":
      return "Use practical cross-industry PMO guidance with clear governance, stakeholder communication, and risk controls.";
    case "Hybrid":
    default:
      return "Blend predictive governance (RAID, baselines, change control) with adaptive delivery cadence and continuous reprioritization.";
  }
};

const createFallbackResponse = (message: string, methodology: CopilotResponse["methodology"]): CopilotResponse => {
  const lower = normalize(message);
  const wantsEmail = lower.includes("email") || lower.includes("follow-up") || lower.includes("follow up");

  return {
    answer: wantsEmail
      ? "I can draft a follow-up email, but I need project details first (client name, current status, requested action, and due date)."
      : "I can help step-by-step. Share project objective, timeline, key stakeholders, current blockers, and latest status so I can recommend the next actions.",
    cards: wantsEmail
      ? [
          {
            type: "Draft Email",
            title: "Client follow-up draft template",
            items: [
              "Subject: [Project Name] | Status Update and Next Steps",
              "Opening: Thank the client and confirm current milestone status.",
              "Body: Summarize progress, open items, and decisions needed.",
              "Close: Request confirmation by a specific date.",
            ],
          },
        ]
      : [
          {
            type: "Next Actions",
            title: "Immediate PMO next steps",
            items: [
              "Confirm scope baseline and acceptance criteria.",
              "Refresh RAID log with owners and due dates.",
              "Validate timeline assumptions and critical dependencies.",
              "Prepare stakeholder status note with asks/decisions.",
            ],
          },
        ],
    facts: ["No tenant project memory context was supplied in this prompt."],
    bestPractices: [getMethodologyGuide(methodology)],
    assumptions: ["General PMO template guidance only; project-specific facts are not yet available."],
    requiresMoreContext: true,
    contextGapQuestions: [
      "What is the exact project objective and current phase?",
      "Which milestone is currently at risk?",
      "What client decision or dependency is blocking progress?",
    ],
    plan: "free",
    aiPowered: false,
    methodology,
  };
};

export async function POST(request: Request) {
  const user = await getAuthUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  let payload: CopilotRequest;
  try {
    payload = (await request.json()) as CopilotRequest;
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!payload.message?.trim()) return Response.json({ error: "Message is required." }, { status: 400 });
  if (payload.companyId && payload.companyId !== user.companyId) {
    return Response.json({ error: "Tenant mismatch." }, { status: 403 });
  }

  const methodology = payload.methodology ?? "Hybrid";
  const subscription = await getCompanySubscription(user.companyId);

  const allMemory = await readProjectMemory(user.companyId);
  const selectedProject = allMemory.find((p) => p.id === payload.projectId) ?? allMemory.find((p) => p.projectName === payload.projectName);
  const allowedMemory = canUsePortfolioMemory(subscription.plan) ? allMemory : selectedProject ? [selectedProject] : [];

  if (!canRunAiAnalysis(subscription.plan)) {
    const fallback = createFallbackResponse(payload.message, methodology);
    return Response.json({ ...fallback, plan: subscription.plan, methodology });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return Response.json({ error: "Missing OPENAI_API_KEY on the server." }, { status: 500 });

  const contextSummary = allowedMemory
    .slice(0, 6)
    .map((p: StoredProjectAnalysis) => `Project: ${p.projectName}\nRisks: ${p.risks.join("; ") || "none"}\nDependencies: ${p.dependencies.join("; ") || "none"}`)
    .join("\n\n");

  const system = `You are ScopeGuard PMO Copilot, a senior PMO advisor.\nNever invent project facts.\nNever use cross-tenant data.\nIf context is missing, ask for it.\nAlways separate: Known Facts, PMO Best Practices, Assumptions.\nMethodology mode: ${methodology}. ${getMethodologyGuide(methodology)}\nReturn compact JSON only.`;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: "gpt-4.1-mini",
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        {
          role: "user",
          content: `User role: ${payload.role ?? user.role}\nProject selected: ${payload.projectName ?? selectedProject?.projectName ?? "Not specified"}\nKnown project memory:\n${contextSummary || "No memory available."}\n\nUser message: ${payload.message}`,
        },
      ],
    }),
  });

  const body = (await response.json()) as { choices?: Array<{ message?: { content?: string } }>; error?: { message?: string } };
  if (!response.ok) return Response.json({ error: body.error?.message ?? "Copilot failed." }, { status: 502 });

  const content = body.choices?.[0]?.message?.content;
  if (!content) return Response.json({ error: "OpenAI returned empty response." }, { status: 502 });

  let parsed: Partial<CopilotResponse> = {};
  try {
    parsed = JSON.parse(content) as Partial<CopilotResponse>;
  } catch {
    parsed = { answer: content };
  }

  const result: CopilotResponse = {
    answer: typeof parsed.answer === "string" ? parsed.answer : "I generated recommendations. Please clarify if you want a specific output format.",
    cards: Array.isArray(parsed.cards) ? parsed.cards.slice(0, 5) as CopilotResponse["cards"] : [],
    facts: safeList(Array.isArray(parsed.facts) ? parsed.facts : []),
    bestPractices: safeList(Array.isArray(parsed.bestPractices) ? parsed.bestPractices : []),
    assumptions: safeList(Array.isArray(parsed.assumptions) ? parsed.assumptions : []),
    requiresMoreContext: Boolean(parsed.requiresMoreContext),
    contextGapQuestions: safeList(Array.isArray(parsed.contextGapQuestions) ? parsed.contextGapQuestions : []),
    plan: subscription.plan,
    aiPowered: true,
    methodology,
  };

  return Response.json(result);
}
