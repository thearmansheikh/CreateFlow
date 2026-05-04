-- Fix infinite recursion in workspace_members RLS policy.
--
-- The original "Workspace members access" policy had two problems:
--   1. It JOIN'd to `workspaces`, whose own SELECT policy reads `workspace_members`
--      back — Postgres detects this cycle and throws 42P17.
--   2. It also self-referenced `workspace_members` inside its own USING clause,
--      which is direct self-recursion regardless of the workspaces side.
--
-- Symptoms in the app:
--   - Saving a generation 500'd with "infinite recursion detected in policy
--     for relation \"workspaces\""
--   - Browser GETs to /rest/v1/brand_profiles 500'd for the same reason
--     (the brand_profiles policy joins workspace_members)
--
-- Fix: scope workspace_members SELECT to the row the user owns. Peer
-- visibility (seeing co-members of a workspace) is dropped here and can be
-- re-added later via a SECURITY DEFINER function if the team UI needs it,
-- which is a much narrower attack surface than a recursive policy.

DROP POLICY IF EXISTS "Workspace members access" ON workspace_members;

CREATE POLICY "Own membership rows" ON workspace_members
  FOR SELECT USING (user_id = auth.uid());
