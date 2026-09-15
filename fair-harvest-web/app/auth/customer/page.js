"use client";

import { ShoppingBasket } from "lucide-react";
import AuthForm from "../../../components/auth/AuthForm.js";

export default function CustomerAuthPage() {
  return (
    <main className="authShell">
      <div className="authColumn">
        <header className="authHeading">
          <p className="eyebrow"><ShoppingBasket size={14} /> Customer</p>
          <h1>Shop verified produce</h1>
          <p className="muted">
            Sign in to browse the marketplace, track your orders and review what you have received.
          </p>
        </header>

        <AuthForm expectedRole="consumer" registerRole="consumer" redirectTo="/account" submitLabel="Log in" />

        <nav className="authSwitch">
          <a href="/auth/farmer">Are you a farmer? Log in as Farmer</a>
          <a href="/admin/login">Administrator sign-in</a>
        </nav>
      </div>
    </main>
  );
}
