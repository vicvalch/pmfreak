export type PMModule = {
  href: string;
  label: string;
  shortLabel: string;
  description: string;
  status: "Live" | "New";
};

export const PM_MODULES: PMModule[] = [
  { href: "/dashboard", label: "Dashboard", shortLabel: "Overview", description: "Portfolio pulse and delivery health.", status: "Live" },
  { href: "/projects", label: "Projects", shortLabel: "Projects", description: "Create and manage your project workspaces.", status: "Live" },
  { href: "/onboarding", label: "Onboarding", shortLabel: "Onboard", description: "Capture context and run your first PMFreak analysis.", status: "New" },
  { href: "/stakeholder-intel", label: "Stakeholder Intel", shortLabel: "Stakeholders", description: "Influence, stance, and relationship risk map.", status: "New" },
  { href: "/meetings", label: "Meetings", shortLabel: "Transcripts", description: "Decisions, actions, and sentiment shifts.", status: "New" },
  { href: "/political-risk", label: "Political Risk", shortLabel: "Risk Alerts", description: "Org dynamics and escalation threats.", status: "New" },
  { href: "/escalation-guide", label: "Escalation Guide", shortLabel: "Escalate", description: "Who, when, and how to escalate with confidence.", status: "New" },
  { href: "/message-nudges", label: "Message Nudges", shortLabel: "Comms", description: "Audience-aware message draft recommendations.", status: "New" },
  { href: "/project-memory", label: "Project Memory", shortLabel: "Memory", description: "Chronological decision and commitment timeline.", status: "New" },
  { href: "/copilot", label: "Copilot", shortLabel: "Assistant", description: "Cross-module PM copilot assistant.", status: "Live" },
];
