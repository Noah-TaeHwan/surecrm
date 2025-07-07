-- This migration fixes remaining RLS policy issues identified by the linter.

-- Step 1: Drop the specific old policies for app_client_details that were missed in the previous migration.
DROP POLICY IF EXISTS "Users can insert own client details" ON public.app_client_details;
DROP POLICY IF EXISTS "Users can update own client details" ON public.app_client_details;
DROP POLICY IF EXISTS "Users can delete own client details" ON public.app_client_details;
DROP POLICY IF EXISTS "Users can view own client details" ON public.app_client_details;


-- Step 2: Drop and recreate policies for other tables flagged in the new lint report.

-- For app_client_data_access_logs
DROP POLICY IF EXISTS "Team admins can view data access logs" ON public.app_client_data_access_logs;
DROP POLICY IF EXISTS "Optimized: Team admins can view data access logs" ON public.app_client_data_access_logs; -- Drop the previously wrong one
CREATE POLICY "Optimized: Team admins can view data access logs" ON public.app_client_data_access_logs
  FOR SELECT USING (
    client_id IN (
      SELECT id FROM public.app_client_profiles
      WHERE team_id IN (
        SELECT team_id FROM public.app_user_profiles 
        WHERE id = (SELECT auth.uid()) AND role = 'team_admin'
      )
    )
  );

-- For app_client_data_backups
DROP POLICY IF EXISTS "System admins can manage data backups" ON public.app_client_data_backups;
CREATE POLICY "Optimized: System admins can manage data backups" ON public.app_client_data_backups
  FOR ALL USING (public.is_system_admin());

-- For app_client_stage_history
DROP POLICY IF EXISTS "Users can view accessible stage history" ON public.app_client_stage_history;
CREATE POLICY "Optimized: Users can view accessible stage history" ON public.app_client_stage_history
  FOR SELECT USING (
    client_id IN (
      SELECT id FROM public.app_client_profiles 
      WHERE agent_id = (SELECT auth.uid())
      OR team_id IN (
        SELECT team_id FROM public.app_user_profiles 
        WHERE id = (SELECT auth.uid())
      )
    )
  );

-- Also, let's properly drop the policies from app-client-details-rls.sql
-- The previous migration might not have run before this file was sourced.
-- This ensures they are removed.
DROP POLICY IF EXISTS "Users can view own client details" ON public.app_client_details;
DROP POLICY IF EXISTS "Users can insert own client details" ON public.app_client_details;
DROP POLICY IF EXISTS "Users can update own client details" ON public.app_client_details;
DROP POLICY IF EXISTS "Users can delete own client details" ON public.app_client_details; 