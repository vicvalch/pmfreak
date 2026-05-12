# PMFreak Access Control Matrix (Phase 4)

| Domain | Entity | Action | Required role | Primitive | Enforcement | AI-agent compatible | External-safe |
|---|---|---|---|---|---|---|---|
| Core tenancy | `workspaces` | read | any workspace role | `requireWorkspaceRole` | route + `workspace_memberships` (+ selective RLS) | no | yes |
| Core tenancy | `workspaces` | manage workspace settings | owner/admin | `requireGovernancePermission(manage_workspace)` | route enforced | no | no |
| Team governance | `workspace_memberships` | manage members | owner/admin | `requireGovernancePermission(manage_members)` | route + RLS | no | no |
| Project operations | `projects` | read/write/delete | contributor+/PM+/admin/owner | `requireProjectPermission` | route + membership chain + targeted RLS | yes (scoped grants) | write/delete no |
| Executive views | `executive dashboards` | view executive | executive_viewer+/PM+/admin/owner | `requireGovernancePermission(view_executive)` | route enforced | optional read-only | yes |
| Billing | `company_subscriptions` | manage billing | owner | `requireGovernancePermission(manage_billing)` | route enforced | no | no |
| AI governance | `ai_agent_permissions` | manage ai scopes | owner/admin | `requireGovernancePermission(manage_ai)` | route + RLS | n/a | no |
| Document ingestion | `project_memories` | upload docs | contributor+/PM+/admin/owner/ai_agent(scoped) | `requireProjectPermission(upload_documents)` + `requireAgentScope` | route + RLS + FK | yes | no |

## RLS Evolution Notes

- **DB-enforced now:** `ai_agent_permissions` membership/read and owner-admin writes via dedicated RLS policies.
- **DB-enforced already:** project/workspace row isolation through FK constraints and existing membership-related RLS.
- **Route-enforced remains:** high-level governance permissions (`manage_billing`, `manage_ai`, `view_executive`) while policy abstraction stabilizes.
- **Planned next:** policy-function-backed RLS checks once conditional governance DSL is introduced.
