import { AccessDeniedError } from "@/lib/security/access-guards";
import { denyFromAccessError } from "@/lib/security/deny-response";
import { requireAuthenticatedUser } from "@/lib/security/server-authorization";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { saveOperationalMemory, type OperationalDomain } from "@/lib/operational-memory";
import { resolveBootstrapRuntimeContext, transitionToGovernedRuntime } from "@/lib/runtime/bootstrap/runtime";

type TemplateInput = {
  domain: OperationalDomain;
  title: string;
  text: string;
};

type ActivationRequest = {
  form?: Record<string, string> & {
    storageStrategy?: "cloud" | "local" | "self_hosted";
  };
  templates?: TemplateInput[];
  loadDemo?: boolean;
};

type ActivationWarning = {
  type: "operational_memory_seed_failed";
  domain: OperationalDomain;
  message: string;
};

const demoTemplates: TemplateInput[] = [
  {
    domain: "risk_intelligence",
    title: "Escalation signal",
    text: "Risk name: Steering committee confidence erosion | Severity: high | Probability: high | Escalation needed: yes",
  },
  {
    domain: "team_health",
    title: "PM fatigue signal",
    text: "PM name: Jordan | Workload level: very high | After hours activity: sustained | Fatigue risk: high",
  },
  {
    domain: "pmo_governance",
    title: "Governance gap",
    text: "Reporting cadence: inconsistent | Approval rules: unclear | Escalation rules: missing",
  },
];

function normalizeActivationBody(payload: ActivationRequest) {
  const form = payload.form ?? {};
  const templates = Array.isArray(payload.templates) ? payload.templates : [];
  const loadDemo = payload.loadDemo === true;

  return {
    form,
    loadDemo,
    templates: loadDemo ? [...templates, ...demoTemplates] : templates,
  };
}

export async function POST(request: Request) {
  const { user } = await requireAuthenticatedUser();

  try {
    const bootstrap = await resolveBootstrapRuntimeContext(user);
    const workspaceId = bootstrap.workspaceId;

    let rawBody: ActivationRequest;
    try {
      rawBody = (await request.json()) as ActivationRequest;
    } catch {
      return Response.json(
        { ok: false, error: "Invalid activation payload.", phase: bootstrap.phase, workspaceId },
        { status: 400 },
      );
    }

    const body = normalizeActivationBody(rawBody);
    const supabase = await createSupabaseServerClient();

    const projectName = body.loadDemo
      ? "PMFreak Demo Launch Recovery"
      : body.form.projectName || "First Activated Project";

    const description = body.loadDemo
      ? "Seeded scenario with governance drift, PM overload, and escalation pressure."
      : `Sponsor: ${body.form.sponsor || "TBD"} | PM: ${body.form.pm || "TBD"} | Timeline: ${body.form.timeline || "TBD"}`;

    const { data: project, error: projectError } = await supabase
      .from("projects")
      .insert({
        user_id: user.id,
        workspace_id: workspaceId,
        name: projectName,
        description,
      })
      .select("id")
      .single<{ id: string }>();

    if (projectError || !project?.id) {
      console.error("[getting-started] project creation failed", {
        userId: user.id,
        workspaceId,
        error: projectError?.message ?? "unknown",
      });

      return Response.json(
        { ok: false, error: "Unable to create project.", phase: bootstrap.phase, workspaceId },
        { status: 500 },
      );
    }

    const warnings: ActivationWarning[] = [];

    for (const template of body.templates) {
      try {
        await saveOperationalMemory({
          companyId: user.companyId,
          projectId: project.id,
          domain: template.domain,
          title: template.title,
          text: template.text,
          sourceRef: body.loadDemo ? "activation-demo" : "activation",
        });
      } catch (error) {
        warnings.push({
          type: "operational_memory_seed_failed",
          domain: template.domain,
          message: String(error),
        });

        console.warn("[getting-started] memory seed warning", {
          userId: user.id,
          workspaceId,
          projectId: project.id,
          domain: template.domain,
          error: String(error),
        });
      }
    }

    const { error: metadataError } = await supabase.auth.updateUser({
      data: {
        onboarding_completed: true,
        company_name: body.form.companyName || user.companyName,
        storage_strategy: body.form.storageStrategy || "cloud",
      },
    });

    if (metadataError) {
      console.error("[getting-started] onboarding metadata update failed", {
        userId: user.id,
        workspaceId,
        projectId: project.id,
        error: metadataError.message,
      });

      return Response.json(
        {
          ok: false,
          error: "Project activated, but onboarding metadata update failed.",
          phase: "operational_context_activation",
          workspaceId,
          projectId: project.id,
          warnings,
        },
        { status: 500 },
      );
    }

    const transitioned = await transitionToGovernedRuntime(bootstrap);
    const next = `/command-center?from=onboarding&projectId=${project.id}`;

    return Response.json({
      ok: true,
      workspaceId,
      projectId: project.id,
      phase: transitioned.phase,
      next,
      warnings,
    });
  } catch (error) {
    if (error instanceof AccessDeniedError) {
      return denyFromAccessError(error, {
        status: 403,
        routeId: "/api/getting-started",
        message: "Invalid bootstrap activation context.",
        actorUserId: user.id,
        eventType: "workspace_scope_violation",
      });
    }

    console.error("[getting-started] unexpected activation failure", {
      userId: user.id,
      error: String(error),
    });

    return Response.json(
      { ok: false, error: "Unexpected activation failure.", phase: "authenticated_uninitialized" },
      { status: 500 },
    );
  }
}
