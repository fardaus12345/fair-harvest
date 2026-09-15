"use client";

import { usePathname } from "next/navigation";
import RoleGuard from "../../components/RoleGuard.js";
import AdminNav from "../../components/admin/AdminNav.js";

export default function AdminLayout({ children }) {
  const pathname = usePathname();

  // /admin/login is the way in to the console, so it must render outside the
  // guard — guarding it would bounce an unauthenticated visitor to itself.
  if (pathname === "/admin/login") {
    return children;
  }

  return (
    <RoleGuard role="admin">
      <main className="appPage">
        <header className="pageHeader"><div><p className="eyebrow">Fair Harvest</p><h1>Admin console</h1></div></header>
        <AdminNav />
        <div style={{ marginTop: 20 }}>{children}</div>
      </main>
    </RoleGuard>
  );
}
