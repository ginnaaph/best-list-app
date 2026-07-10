import type { Session } from "@supabase/supabase-js";
import { useEffect, useState } from "react";

import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase";

/**
 * Tracks the current Supabase auth session.
 *
 * @returns The loading state and current session.
 */
export function useAuthSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    if (!isSupabaseConfigured) {
      setSession(null);
      setIsLoading(false);
      return;
    }

    const supabase = getSupabaseClient();

    supabase.auth.getSession().then(({ data }) => {
      if (!isMounted) {
        return;
      }

      setSession(data.session);
      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return { isLoading, session };
}
