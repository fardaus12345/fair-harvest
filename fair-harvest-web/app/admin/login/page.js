"use client";

import { ShieldCheck } from "lucide-react";
import AuthForm from "../../../components/auth/AuthForm.js";

export default function AdminLoginPage() {
  return (
    <main className="authShell">
      <div className="authColumn">
        <header className="authHeading">
          <p className="eyebrow"><ShieldCheck size={14} /> Administrator</p>
          <h1>Admin console sign-in</h1>
          <p className="muted">
            Restricted to platform administrators. Administrator accounts are provisioned directly and
            cannot be self-registered.
          </p>
        </header>

        <AuthForm expectedRole="admin" redirectTo="/admin/dashboard" allowRegister={false} submitLabel="Sign in" />

        <nav className="authSwitch">
          <a href="/auth/customer">Customer login</a>
          <a href="/auth/farmer">Farmer login</a>
        </nav>
      </div>
    </main>
  );
}
