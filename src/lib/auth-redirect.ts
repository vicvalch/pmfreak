import type { SupabaseClient, User } from "@supabase/supabase-js";

const isOnboardingComplete = (user: User | null) => user?.user_metadata?.onboarding_completed === true;

export const getPostAuthRedirectPath = (user: User | null) => {
  return isOnboardingComplete(user) ? "/projects" : "/getting-started";
};

export const resolvePostAuthRedirectPath = async (supabase: SupabaseClient) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return getPostAuthRedirectPath(user);
};
