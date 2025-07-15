-- Fix handle_new_user trigger function to match actual table structure
-- The function was trying to insert into non-existent columns (email, avatar_url)

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Insert minimal required data into app_user_profiles
  -- Note: email is not stored in profiles table, and avatar_url should be profile_image_url
  INSERT INTO public.app_user_profiles (
    id, 
    full_name, 
    profile_image_url,
    phone,
    company,
    role,
    is_active
  )
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    new.raw_user_meta_data->>'avatar_url', -- Map to profile_image_url if avatar_url exists
    new.raw_user_meta_data->>'phone',
    new.raw_user_meta_data->>'company',
    COALESCE((new.raw_user_meta_data->>'role')::app_user_role_enum, 'agent'),
    false -- Default to inactive until email verification
  )
  ON CONFLICT (id) DO UPDATE SET
    -- Update if profile already exists (for re-registration scenarios)
    full_name = COALESCE(EXCLUDED.full_name, app_user_profiles.full_name),
    phone = COALESCE(EXCLUDED.phone, app_user_profiles.phone),
    company = COALESCE(EXCLUDED.company, app_user_profiles.company),
    profile_image_url = COALESCE(EXCLUDED.profile_image_url, app_user_profiles.profile_image_url);
  
  RETURN new;
END;
$function$;

-- Ensure the trigger is properly attached
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created 
  AFTER INSERT ON auth.users 
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_new_user();