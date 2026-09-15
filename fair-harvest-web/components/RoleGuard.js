"use client";

import { useEffect } from "react";
import { useSession } from "./auth/useSession.js";

// Client-side route protection. This is a user-experience guard only: it stops
// someone landing on a page that will not work for their role. Every protected
// operation is independently enforced on the server by requireUser,
// requireRole and requireOwnerOrRole, and that server check is what actually
// secures the data.
//
// role - a single role or an array of roles permitted on this route.
const SIGN_IN_FOR_ROLE = {
  consumer: "/auth/customer",
  farmer: "/auth/farmer",
  admin: "/admin/login"
};

// Where a signed-in user of the wrong role belongs instead.
const HOME_FOR_ROLE = {
  consumer: "/account",
  farmer: "/farmer/dashboard",
  admin: "/admin/dashboard"
};

export default function RoleGuard({ role, children }) {
  const { user, loading } = useSession();
  const allowed = Array.isArray(role) ? role : [role];
  const authorized = Boolean(user) && allowed.includes(user.role);

  useEffect(() => {
    if (loading || authorized) return;

    if (!user) {
      // Not signed in: send them to the sign-in page for the role this route needs.
      window.location.href = SIGN_IN_FOR_ROLE[allowed[0]] || "/auth";
      return;
    }

    // Signed in as the wrong role: send them to their own area rather than to a
    // login page they do not need.
    window.location.href = HOME_FOR_ROLE[user.role] || "/";
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, authorized, user]);

  if (loading || !authorized) {
    return <div className="skeletonCard tall" />;
  }

  return children;
}
