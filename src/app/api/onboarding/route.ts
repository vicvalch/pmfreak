import { getAuthUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type OnboardingPayload = {
  workspace: string;
  role: string;
  projectType: string;
  problem: string;
  analysis: string;
  source: "onboarding";
  createdAt: string;
};

const normalize = (value: unknown) => (typeof value === "string" ? value.trim() : "");

export async function POST(request: Request) {
  const user = await getAuthUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let payload: Partial<OnboardingPayload>;

  try {
    payload = (await request.json()) as Partial<OnboardingPayload>;
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const workspace = normalize(payload.workspace);
  const role = normalize(payload.role);
  const projectType = normalize(payload.projectType);
  const problem = normalize(payload.problem);
  const analysis = normalize(payload.analysis);
  const source = payload.source;

  if (!workspace || !role || !projectType || !problem || !analysis || source !== "onboarding") {
    return Response.json({ error: "Missing required onboarding fields." }, { status: 400 });
  }

  const createdAt = normalize(payload.createdAt);
  const parsedCreatedAt = createdAt ? new Date(createdAt) : new Date();

  if (Number.isNaN(parsedCreatedAt.getTime())) {
    return Response.json({ error: "Invalid createdAt timestamp." }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.from("onboarding_analyses").insert({
    company_id: user.companyId,
    user_id: user.id,
    workspace,
    role,
    project_type: projectType,
    problem,
    analysis,
    source,
    created_at: parsedCreatedAt.toISOString(),
  });

  if (error) {
    return Response.json({ error: "Unable to save onboarding analysis." }, { status: 500 });
  }

  return Response.json({ ok: true });
}
