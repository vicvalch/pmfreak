-- Restrict trust graph edge visibility to service role only.
-- The previous policy (using true) exposed the full trust domain topology
-- to any authenticated user. Edges are infrastructure-level data and must
-- only be read via privileged client calls, not direct RLS queries.

drop policy if exists "trust_graph_workspace_read" on public.capability_trust_graph_edges;
create policy "trust_graph_workspace_read" on public.capability_trust_graph_edges
  for select using (false);
