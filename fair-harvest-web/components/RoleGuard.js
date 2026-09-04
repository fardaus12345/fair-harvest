"use client";

import { useEffect } from "react";
import { useSession } from "./auth/useSession.js";

export default function RoleGuard({ role, children }) {
  const { user, loading } = useSession();
  const authorized = user && user.role === role;

  useEffect(() => {
    if (loading) return;
    if (!authorized) window.location.href = "/auth";
  }, [loading, authorized]);

  if (loading || !authorized) {
    return <div className="skeletonCard tall" />;
  }

  return children;
}
