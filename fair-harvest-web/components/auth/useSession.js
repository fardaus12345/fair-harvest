"use client";

import { useEffect, useState } from "react";

const TOKEN_KEY = "fairHarvestToken";
const USER_KEY = "fairHarvestUser";

export function useSession() {
  const [session, setSession] = useState({ user: null, token: null, loading: true });

  useEffect(() => {
    refreshSession();
    window.addEventListener("fairharvest:session", refreshSession);
    return () => window.removeEventListener("fairharvest:session", refreshSession);

    function refreshSession() {
      const token = window.localStorage.getItem(TOKEN_KEY);
      const raw = window.localStorage.getItem(USER_KEY);
      let user = null;
      try {
        user = raw ? JSON.parse(raw) : null;
      } catch {
        user = null;
      }
      setSession({ user, token, loading: false });
    }
  }, []);

  return session;
}

export function saveSession({ token, user }) {
  window.localStorage.setItem(TOKEN_KEY, token);
  window.localStorage.setItem(USER_KEY, JSON.stringify(user));
  window.dispatchEvent(new Event("fairharvest:session"));
}

export function clearSession() {
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(USER_KEY);
  window.dispatchEvent(new Event("fairharvest:session"));
}
