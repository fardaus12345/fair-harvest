"use client";

import RoleGuard from "../../components/RoleGuard.js";

// The customer dashboard is for consumer accounts. Farmers have
// /farmer/dashboard and admins have /admin/dashboard.
export default function AccountLayout({ children }) {
  return <RoleGuard role="consumer">{children}</RoleGuard>;
}
