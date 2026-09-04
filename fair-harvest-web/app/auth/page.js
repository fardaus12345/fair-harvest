"use client";

import { useState } from "react";
import { login, register } from "../../lib/api.js";
import { saveSession } from "../../components/auth/useSession.js";

export default function AuthPage() {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "demo@fairharvest.com", password: "FairHarvest123", role: "consumer" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = mode === "login" ? await login({ email: form.email, password: form.password }) : await register(form);
      const token = data.access_token || data.token;
      saveSession({ token, user: data.user });
      window.location.href = data.user.role === "farmer" ? "/farmer/dashboard" : "/";
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="authShell">
      <form className="toolPanel authPanel" onSubmit={submit}>
        <p className="eyebrow">Account</p>
        <h1>{mode === "login" ? "Welcome back" : "Create account"}</h1>
        {mode === "register" ? <label>Name<input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label> : null}
        <label>Email<input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></label>
        <label>Password<input type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} /></label>
        {mode === "register" ? <div className="tabs"><button type="button" className={form.role === "consumer" ? "active" : ""} onClick={() => setForm({ ...form, role: "consumer" })}>Consumer</button><button type="button" className={form.role === "farmer" ? "active" : ""} onClick={() => setForm({ ...form, role: "farmer" })}>Farmer</button></div> : null}
        {error ? <p className="errorText">{error}</p> : null}
        <div className="formActions">
          <button className="commandButton" type="submit">{loading ? "Working..." : mode === "login" ? "Log in" : "Register"}</button>
          <button className="ghostButton" type="button" onClick={() => setMode(mode === "login" ? "register" : "login")}>{mode === "login" ? "Create account" : "Use login"}</button>
        </div>
      </form>
    </main>
  );
}
