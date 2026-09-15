"use client";

import { Sprout } from "lucide-react";
import AuthForm from "../../../components/auth/AuthForm.js";

export default function FarmerAuthPage() {
  return (
    <main className="authShell">
      <div className="authColumn">
        <header className="authHeading">
          <p className="eyebrow"><Sprout size={14} /> Farmer</p>
          <h1>Sell your harvest</h1>
          <p className="muted">
            Sign in to manage listings, orders and traceability. New farmers must verify a Government
            Farmer Card before they can list products.
          </p>
        </header>

        <AuthForm expectedRole="farmer" registerRole="farmer" redirectTo="/farmer/dashboard" submitLabel="Log in" />

        <nav className="authSwitch">
          <a href="/auth/customer">Are you a customer? Log in as Customer</a>
          <a href="/farmer/verify">Farmer Card verification</a>
        </nav>
      </div>
    </main>
  );
}
