"use client";

import RoleGuard from "../../components/RoleGuard.js";

// Everything under /farmer is farmer-only. A signed-in customer or admin who
// lands here is redirected to their own area; the API enforces the same rule
// independently on every farmer endpoint.
export default function FarmerLayout({ children }) {
  return <RoleGuard role="farmer">{children}</RoleGuard>;
}
