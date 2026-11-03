import { createBrowserSupabaseClient } from "./supabase/browser";

export const isSupabaseConfigured = (): boolean => {
  return (
    !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    process.env.NEXT_PUBLIC_SUPABASE_URL !== "https://unconfigured.supabase.co"
  );
};

export interface DemoUser {
  id: string;
  email: string;
  display_name: string;
  is_demo: boolean;
}

export const DEMO_USER: DemoUser = {
  id: "00000000-0000-0000-0000-000000000001",
  email: "demo@subguard.local",
  display_name: "Demo Reviewer",
  is_demo: true,
};

export async function signInWithEmail(email: string, password: string) {
  if (!isSupabaseConfigured()) {
    throw new Error(
      "Supabase is not configured. Please enter demo mode or set up your Supabase project credentials."
    );
  }
  const supabase = createBrowserSupabaseClient();
  return await supabase.auth.signInWithPassword({ email, password });
}

export async function signUpWithEmail(
  email: string,
  password: string,
  displayName?: string
) {
  if (!isSupabaseConfigured()) {
    throw new Error(
      "Supabase is not configured. Please enter demo mode or set up your Supabase project credentials."
    );
  }
  const supabase = createBrowserSupabaseClient();
  return await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: displayName,
      },
    },
  });
}

export async function signOut() {
  if (isSupabaseConfigured()) {
    const supabase = createBrowserSupabaseClient();
    await supabase.auth.signOut();
  }
}
