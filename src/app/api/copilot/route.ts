import { getAuthUser, type UserRole } from "@/lib/auth";
import { getCompanySubscription, type SubscriptionPlan } from "@/lib/billing";
import { canUseAdvancedAi, requireFeatureAccess } from "@/lib/feature-gates";
import { canUsePortfolioMemory } from "@/lib/plan-access";
import { readProjectMemory, type StoredProjectAnalysis } from "@/lib/project-memory";
import { getRuntimeAuthorityView } from "@/lib/aoc/runtime-observability";

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
  diagnosis?: string;
  immediateAction?: string;
  reinforcement?: string;
  nextStep?: string;
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

const safeList = (items: string[], limit = 8) => items.map((item) => item.trim()).filter(Boolean).slice(0, limit);
const hasRequiredSections = (answer: string) =>
  ["Situation", "Escalation logic", "Decision now", "Next 24h"].every((section) => answer.includes(section));

const buildStructuredAnswer = ({
  diagnosis,
  immediateAction,
  reinforcement,
  nextStep,
}: {
  diagnosis: string;
  immediateAction: string;
  reinforcement: string;
  nextStep: string;
}) =>
  `### Situation\n${diagnosis}\n\n### Escalation logic\n${reinforcement}\n\n### Decision now\n${immediateAction}\n\n### Next 24h\n${nextStep}`;

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

const createFallbackResponse = (_message: string, methodology: CopilotResponse["methodology"]): CopilotResponse => {
  return {
    answer: buildStructuredAnswer({
      diagnosis: "Signal is incomplete: objective, at-risk milestone, and dependency owners are missing.",
      reinforcement: "Without dependency ownership and escalation trigger, risk remains unmanaged and leadership will escalate on uncertainty.",
      immediateAction: "You: post a single checkpoint update today with milestone status, blocker owner, and escalation threshold by time.",
      nextStep: "Within 24 hours, lock dependency owners and confirm one decision owner for each unresolved risk.",
    }),
    cards: [
      {
        type: "Next Actions",
        title: "Operational minimum input",
        items: [
          "Define objective, phase, and at-risk milestone.",
          "List top dependencies with owner and due date.",
          "State escalation threshold (time or impact).",
          "Name decision owner for each open blocker.",
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

  const advancedAiAccess = await canUseAdvancedAi(user.id);
  if (!advancedAiAccess.ok) {
    return Response.json(
      { error: advancedAiAccess.error, feature: advancedAiAccess.feature, requiredPlan: advancedAiAccess.requiredPlan },
      { status: 402 },
    );
  }

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

  const analysisAccess = await requireFeatureAccess(user.companyId, "ai_analysis");
  if (!analysisAccess.ok) {
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return Response.json({ error: "Missing OPENAI_API_KEY on the server." }, { status: 500 });

  const runtimeContext = await getRuntimeAuthorityView({
    companyId: user.companyId,
    projectId: selectedProject?.id ?? null,
    sourceRef: `user:${user.id}`,
    domain: "operational_memory",
  });

  const contextSummary = allowedMemory
    .slice(0, 6)
    .map((p: StoredProjectAnalysis) => `Project: ${p.projectName}\nRisks: ${p.risks.join("; ") || "none"}\nDependencies: ${p.dependencies.join("; ") || "none"}`)
    .join("\n\n");

  const system = `You are PMFreak, an AI Project Manager with operational realism and delivery accountability.
Preserve PM-native operational tone: experienced, calm under pressure, politically aware, delivery-focused.
Do not sound like a template, startup guru, aggressive CEO, or verbose consultant.
Avoid motivational language.

Response shaping goals:
1) Preserve concise operational structure.
2) Keep deterministic reasoning and fact discipline.
3) Vary sentence rhythm and framing between responses.
4) Increase realism in delivery reasoning (dependencies, ownership, sequence, constraints).

Execution behavior:
- Identify the single highest-leverage execution issue first.
- Apply dynamic escalation framing: explain why escalation is or is not warranted now.
- Be dependency-aware: mention critical path or inter-team dependency when relevant.
- Modulate tone by stakeholder impact (team, sponsor, executive, client).
- Calibrate communication style by severity (low, medium, high, critical).
- Adapt phrasing to timeline pressure (same-day, this week, multi-week).
- Articulate tradeoffs concisely.
- Calibrate confidence: explicit confidence level based on evidence strength.

Hard rules:
- Never invent project facts.
- Never use cross-tenant data.
- If context is missing, state the missing input briefly and still issue one concrete decision.
- Avoid vague phrases such as "improve communication" or "optimize workflow."
- Every decision/action must include WHO, WHAT, and WHEN.
- Keep output compact and operational.

Output contract:
- Return compact JSON only.
- Return keys: answer, diagnosis, immediateAction, reinforcement, nextStep, facts, bestPractices, assumptions.
- "answer" must use this exact markdown section format:
  ### Situation
  ### Escalation logic
  ### Decision now
  ### Next 24h
- Each section: 1-2 short lines.
- "Escalation logic" should include severity, timeline pressure, and confidence in one tight statement.
- "Decision now" must include one decisive action.
- Also include arrays for "facts", "bestPractices", and "assumptions".

Methodology mode: ${methodology}. ${getMethodologyGuide(methodology)}`;

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
          content: `User role: ${payload.role ?? user.role}\nProject selected: ${payload.projectName ?? selectedProject?.projectName ?? "Not specified"}\nKnown project memory:\n${contextSummary || "No memory available."}\n\nAOC runtime authority context:\n${JSON.stringify(runtimeContext)}\n\nUser message: ${payload.message}`,
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
    answer:
      typeof parsed.answer === "string" && hasRequiredSections(parsed.answer)
        ? parsed.answer
        : buildStructuredAnswer({
            diagnosis:
              typeof parsed.diagnosis === "string"
                ? parsed.diagnosis
                : "You are missing a single execution owner, so decisions stall and delivery drifts.",
            immediateAction:
              typeof parsed.immediateAction === "string"
                ? parsed.immediateAction
                : "You: assign one accountable owner to the next deliverable today, publish the owner and due date in writing before end of day.",
            reinforcement:
              typeof parsed.reinforcement === "string"
                ? parsed.reinforcement
                : "If you don’t lock ownership now, the next deadline will slip for the same reason.",
            nextStep:
              typeof parsed.nextStep === "string"
                ? parsed.nextStep
                : "Within 24 hours, review active tasks and remove every shared owner.",
          }),
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

  return Response.json({ ...result, runtimeContext });
}
