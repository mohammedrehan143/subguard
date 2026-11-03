"use client";

import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";
import { DEMO_USER, isSupabaseConfigured } from "@/lib/auth";

export interface AuthState {
  user: User | null;
  demoUser: typeof DEMO_USER | null;
  isDemo: boolean;
  isConfigured: boolean;
  isLoading: boolean;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    demoUser: null,
    isDemo: false,
    isConfigured: false,
    isLoading: true,
  });

  useEffect(() => {
    const configured = isSupabaseConfigured();

    if (!configured) {
      // In unconfigured environment, automatically enable clear demo user access
      setAuthState({
        user: null,
        demoUser: DEMO_USER,
        isDemo: true,
        isConfigured: false,
        isLoading: false,
      });
      return;
    }

    const supabase = createBrowserSupabaseClient();

    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setAuthState({
          user: session.user,
          demoUser: null,
          isDemo: false,
          isConfigured: true,
          isLoading: false,
        });
      } else {
        setAuthState({
          user: null,
          demoUser: null,
          isDemo: false,
          isConfigured: true,
          isLoading: false,
        });
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthState({
        user: session?.user ?? null,
        demoUser: session?.user ? null : DEMO_USER,
        isDemo: !session?.user,
        isConfigured: true,
        isLoading: false,
      });
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loginAsDemo = () => {
    setAuthState({
      user: null,
      demoUser: DEMO_USER,
      isDemo: true,
      isConfigured: authState.isConfigured,
      isLoading: false,
    });
  };

  return {
    ...authState,
    loginAsDemo,
  };
}
