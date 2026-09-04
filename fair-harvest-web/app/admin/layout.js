"use client";

import RoleGuard from "../../components/RoleGuard.js";
import AdminNav from "../../components/admin/AdminNav.js";

export default function AdminLayout({ children }) {
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
