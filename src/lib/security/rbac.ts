export const WORKSPACE_ROLES = [
  "owner",
  "admin",
  "PM",
  "contributor",
  "executive_viewer",
  "external_stakeholder",
  "ai_agent",
] as const;

export type WorkspaceRole = (typeof WORKSPACE_ROLES)[number];

export const PERMISSIONS = [
  "read",
  "write",
  "delete",
  "manage_members",
  "manage_projects",
  "manage_workspace",
  "manage_ai",
  "manage_billing",
  "view_executive",
  "upload_documents",
] as const;

export type Permission = (typeof PERMISSIONS)[number];

export const ROLE_PERMISSION_MAP: Record<WorkspaceRole, ReadonlySet<Permission>> = {
  owner: new Set(PERMISSIONS),
  admin: new Set(["read", "write", "delete", "manage_members", "manage_projects", "manage_workspace", "manage_ai", "view_executive", "upload_documents"]),
  PM: new Set(["read", "write", "manage_projects", "view_executive", "upload_documents"]),
  contributor: new Set(["read", "write", "upload_documents"]),
  executive_viewer: new Set(["read", "view_executive"]),
  external_stakeholder: new Set(["read"]),
  ai_agent: new Set(["read", "write", "upload_documents"]),
};

export type GovernancePolicyContext = {
  workspaceRole: WorkspaceRole;
  requestedPermission: Permission;
  projectId?: string;
  actorType?: "user" | "ai_agent";
  scopePermissions?: Permission[];
};

export type GovernancePolicyEvaluator = (ctx: GovernancePolicyContext) => {
  allowed: boolean;
  reason?: string;
};

export const defaultGovernancePolicyEvaluator: GovernancePolicyEvaluator = (ctx) => {
  if (!ROLE_PERMISSION_MAP[ctx.workspaceRole]?.has(ctx.requestedPermission)) {
    return { allowed: false, reason: "role_missing_permission" };
  }

  if (ctx.actorType === "ai_agent" && ctx.scopePermissions && !ctx.scopePermissions.includes(ctx.requestedPermission)) {
    return { allowed: false, reason: "agent_scope_missing_permission" };
  }

  return { allowed: true };
};
