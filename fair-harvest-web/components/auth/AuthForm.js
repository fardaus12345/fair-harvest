"use client";

import { useState } from "react";
import { login, register } from "../../lib/api.js";
import { saveSession } from "./useSession.js";

/**
 * Shared login/registration form used by the customer, farmer and admin sign-in
 * pages. The separation between those pages is a UI concern only: all three
 * post to the same POST /auth/login and POST /auth/register endpoints, and the
 * server remains the authority on role and permissions.
 *
 * expectedRole - the role this page is for ("consumer" | "farmer" | "admin").
 *                Used to reject a session of the wrong kind at the UI layer and
 *                to send the user to the right dashboard. It is never sent to
 *                the server as a claim about who the user is.
 * allowRegister - admins are provisioned, not self-registered.
 */
export default function AuthForm({
  expectedRole,
  redirectTo,
  allowRegister = true,
  registerRole,
  submitLabel = "Log in"
}) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const data =
        mode === "login"
          ? await login({ email: form.email, password: form.password })
          : await register({ ...form, role: registerRole || expectedRole });

      const user = data.user;

      // The account exists and the password was right, but this is the wrong
      // door for it. Do not save the session; point the user at the right page
      // instead of silently logging them in somewhere unexpected.
      if (user.role !== expectedRole) {
        setError(wrongDoorMessage(user.role, expectedRole));
        setLoading(false);
        return;
      }

      saveSession({ token: data.access_token || data.token, user });
      window.location.href = redirectTo;
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <form className="toolPanel authPanel" onSubmit={submit}>
      {mode === "register" ? (
        <label>
          Name
          <input
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
            required
            autoComplete="name"
          />
        </label>
      ) : null}

      <label>
        Email
        <input
          type="email"
          value={form.email}
          onChange={(event) => setForm({ ...form, email: event.target.value })}
          required
          autoComplete="email"
        />
      </label>

      <label>
        Password
        <input
          type="password"
          value={form.password}
          onChange={(event) => setForm({ ...form, password: event.target.value })}
          required
          autoComplete={mode === "login" ? "current-password" : "new-password"}
        />
      </label>

      {error ? <p className="errorText">{error}</p> : null}

      <div className="formActions">
        <button className="commandButton" type="submit" disabled={loading}>
          {loading ? "Working..." : mode === "login" ? submitLabel : "Create account"}
        </button>
        {allowRegister ? (
          <button
            className="ghostButton"
            type="button"
            onClick={() => {
              setMode(mode === "login" ? "register" : "login");
              setError("");
            }}
          >
            {mode === "login" ? "Create account" : "Back to login"}
          </button>
        ) : null}
      </div>
    </form>
  );
}

function wrongDoorMessage(actualRole, expectedRole) {
  const destination = {
    consumer: "the customer login at /auth/customer",
    farmer: "the farmer login at /auth/farmer",
    admin: "the admin login at /admin/login"
  };
  const readable = { consumer: "customer", farmer: "farmer", admin: "administrator" };
  return `This is a ${readable[actualRole] || actualRole} account. Please use ${
    destination[actualRole] || "the correct sign-in page"
  } instead of the ${readable[expectedRole]} login.`;
}
