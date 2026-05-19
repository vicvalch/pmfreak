import crypto from "node:crypto";
import type { AuthUserContext } from "@/lib/auth";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/admin";
import { logFirstUserTelemetryEvent } from "@/lib/first-user-telemetry";

export type BootstrapRuntimePhase =
  | "authenticated_uninitialized"
  | "workspace_bootstrap"
  | "operational_context_activation"
  | "transitioning_to_governed_runtime"
  | "governed_runtime_ready";

export type BootstrapRuntimeContext = {
  userId: string;
  email: string | null;
  workspaceId: string;
  membershipId: string | null;
  phase: BootstrapRuntimePhase;
  createdWorkspace: boolean;
  repairedMembership: boolean;
  activationCompleted: boolean;
  runtimeBootstrapId: string;
};

// LIMITED_BOOTSTRAP_AUTHORITY:
// Service-role access is intentionally scoped to initial workspace/membership bootstrap.
// After bootstrap, normal governed runtime authorization must apply.
function bootstrapClient(input: {
  userId: string;
  operation: string;
  reason: string;
  workspaceId?: string;
}) {
  return createSupabaseServiceRoleClient({
    routeId: "runtime.bootstrap",
    operation: input.operation,
    reason: input.reason,
    systemActor: "system",
    actorUserId: input.userId,
    workspaceId: input.workspaceId,
  });
}

function createBootstrapBaseContext(user: AuthUserContext): BootstrapRuntimeContext {
  return {
    userId: user.id,
    email: user.email,
    workspaceId: "",
    membershipId: null,
    phase: "authenticated_uninitialized",
    createdWorkspace: false,
    repairedMembership: false,
    activationCompleted: false,
    runtimeBootstrapId: crypto.randomUUID(),
  };
}

async function emitBootstrapTelemetry(context: BootstrapRuntimeContext, bootstrapEvent: string) {
  try {
    await logFirstUserTelemetryEvent({
      eventType: "first_workspace_loaded",
      userId: context.userId,
      workspaceId: context.workspaceId,
      metadata: {
        bootstrapEvent,
        runtimeBootstrapId: context.runtimeBootstrapId,
        phase: context.phase,
        createdWorkspace: context.createdWorkspace,
        repairedMembership: context.repairedMembership,
      },
    });
  } catch (error) {
    console.warn("[bootstrap-runtime] telemetry skipped", {
      userId: context.userId,
      workspaceId: context.workspaceId,
      bootstrapEvent,
      error: String(error),
    });
  }
}

export function assertBootstrapAllowed(user: AuthUserContext) {
  if (!user.id) throw new Error("bootstrap_user_missing");
}

export async function ensureBootstrapWorkspace(
  context: BootstrapRuntimeContext,
): Promise<BootstrapRuntimeContext> {
  const supabase = bootstrapClient({
    userId: context.userId,
    operation: "bootstrap_workspace",
    reason: "bootstrap_runtime_workspace_resolution",
  });

  const { data: existingMembership, error: membershipError } = await supabase
    .from("workspace_memberships")
    .select("workspace_id,id")
    .eq("user_id", context.userId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle<{ workspace_id: string; id: string }>();

  if (membershipError) {
    throw new Error(`bootstrap_workspace_lookup_failed:${membershipError.message}`);
  }

  if (existingMembership?.workspace_id) {
    return {
      ...context,
      workspaceId: existingMembership.workspace_id,
      membershipId: existingMembership.id,
      phase: "workspace_bootstrap",
    };
  }

  const { data: createdWorkspace, error: createWorkspaceError } = await supabase
    .from("workspaces")
    .insert({ name: "Workspace", created_by_user_id: context.userId })
    .select("id")
    .single<{ id: string }>();

  if (createWorkspaceError || !createdWorkspace?.id) {
    throw new Error(`bootstrap_workspace_create_failed:${createWorkspaceError?.message ?? "unknown"}`);
  }

  return {
    ...context,
    workspaceId: createdWorkspace.id,
    phase: "workspace_bootstrap",
    createdWorkspace: true,
  };
}

export async function ensureBootstrapMembership(
  context: BootstrapRuntimeContext,
): Promise<BootstrapRuntimeContext> {
  const supabase = bootstrapClient({
    userId: context.userId,
    workspaceId: context.workspaceId,
    operation: "bootstrap_membership",
    reason: "bootstrap_runtime_membership_resolution",
  });

  const { data: existingMembership, error: membershipLookupError } = await supabase
    .from("workspace_memberships")
    .select("id")
    .eq("workspace_id", context.workspaceId)
    .eq("user_id", context.userId)
    .maybeSingle<{ id: string }>();

  if (membershipLookupError) {
    throw new Error(`bootstrap_membership_lookup_failed:${membershipLookupError.message}`);
  }

  if (existingMembership?.id) {
    return {
      ...context,
      membershipId: existingMembership.id,
      phase: "operational_context_activation",
    };
  }

  const { data: createdMembership, error: createMembershipError } = await supabase
    .from("workspace_memberships")
    .insert({
      workspace_id: context.workspaceId,
      user_id: context.userId,
      role: "owner",
    })
    .select("id")
    .single<{ id: string }>();

  if (createMembershipError || !createdMembership?.id) {
    throw new Error(`bootstrap_membership_create_failed:${createMembershipError?.message ?? "unknown"}`);
  }

  return {
    ...context,
    membershipId: createdMembership.id,
    phase: "operational_context_activation",
    repairedMembership: !context.createdWorkspace,
  };
}

export async function resolveBootstrapRuntimeContext(
  user: AuthUserContext,
): Promise<BootstrapRuntimeContext> {
  assertBootstrapAllowed(user);

  const baseContext = createBootstrapBaseContext(user);
  const workspaceContext = await ensureBootstrapWorkspace(baseContext);
  const resolvedContext = await ensureBootstrapMembership(workspaceContext);

  await emitBootstrapTelemetry(
    resolvedContext,
    resolvedContext.createdWorkspace ? "bootstrap_workspace_created" : "bootstrap_workspace_resolved",
  );

  if (resolvedContext.repairedMembership) {
    await emitBootstrapTelemetry(resolvedContext, "bootstrap_membership_repaired");
  }

  return resolvedContext;
}

export async function repairBootstrapWorkspace(
  user: AuthUserContext,
): Promise<BootstrapRuntimeContext> {
  assertBootstrapAllowed(user);

  const baseContext = createBootstrapBaseContext(user);
  const workspaceContext = await ensureBootstrapWorkspace(baseContext);
  const repairedContext = await ensureBootstrapMembership(workspaceContext);

  if (repairedContext.createdWorkspace) {
    await emitBootstrapTelemetry(repairedContext, "bootstrap_recovery_workspace_created");
  }

  if (repairedContext.repairedMembership) {
    await emitBootstrapTelemetry(repairedContext, "bootstrap_recovery_membership_repaired");
  }

  if (!repairedContext.createdWorkspace && !repairedContext.repairedMembership) {
    await emitBootstrapTelemetry(repairedContext, "bootstrap_recovery_noop");
  }

  return repairedContext;
}

export async function transitionToGovernedRuntime(
  context: BootstrapRuntimeContext,
): Promise<BootstrapRuntimeContext> {
  const transitioningContext: BootstrapRuntimeContext = {
    ...context,
    phase: "transitioning_to_governed_runtime",
  };

  try {
    await logFirstUserTelemetryEvent({
      eventType: "onboarding_completed",
      userId: context.userId,
      workspaceId: context.workspaceId,
      metadata: {
        bootstrapEvent: "bootstrap_transition_to_governed_runtime",
        runtimeBootstrapId: context.runtimeBootstrapId,
        phase: transitioningContext.phase,
      },
    });
  } catch (error) {
    console.warn("[bootstrap-runtime] transition telemetry skipped", {
      userId: context.userId,
      workspaceId: context.workspaceId,
      error: String(error),
    });
  }

  return {
    ...transitioningContext,
    phase: "governed_runtime_ready",
    activationCompleted: true,
  };
}
