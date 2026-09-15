"use client";

import { useState } from "react";
import { BadgeCheck } from "lucide-react";
import { useSession, saveSession } from "../../../components/auth/useSession.js";
import { getMe, verifyFarmerCard } from "../../../lib/api.js";

export default function FarmerVerifyPage() {
  const { user, loading } = useSession();
  const [form, setForm] = useState({ farmer_card_number: "", nid_number: "", name: user?.name || "" });
  const [status, setStatus] = useState("idle");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  async function submit(event) {
    event.preventDefault();
    if (!user?.farmer_profile_id) return;
    setStatus("loading");
    setError("");
    try {
      const data = await verifyFarmerCard(user.farmer_profile_id, {
        ...form,
        name: form.name || user.name
      });
      setResult(data);
      const me = await getMe().catch(() => null);
      if (me?.user) saveSession({ token: window.localStorage.getItem("fairHarvestToken"), user: me.user });
      setStatus("done");
    } catch (err) {
      setError(err.message);
      setStatus("error");
    }
  }

  if (loading) return null;

  if (!user) {
    return (
      <main className="appPage">
        <div className="toolPanel">
          <p className="muted">Log in as a farmer to verify your Farmer Card.</p>
          <a className="commandButton" href="/auth/farmer">Go to login</a>
        </div>
      </main>
    );
  }

  if (user.farmer_verification_status === "verified") {
    return (
      <main className="appPage">
        <div className="toolPanel">
          <p className="badge good"><BadgeCheck size={14} /> Verified</p>
          <p className="muted">Your Farmer Card is already verified.</p>
          <a className="commandButton" href="/farmer/dashboard">Go to dashboard</a>
        </div>
      </main>
    );
  }

  return (
    <main className="appPage">
      <header className="pageHeader">
        <div>
          <p className="eyebrow">Farmer verification</p>
          <h1>Verify your Government Farmer Card</h1>
        </div>
      </header>

      <div className="formGrid">
        <form className="toolPanel" onSubmit={submit}>
          <h2><BadgeCheck size={20} /> Farmer Card details</h2>
          <label>Full name (as on card)
            <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
          </label>
          <label>Farmer Card number
            <input value={form.farmer_card_number} onChange={(event) => setForm({ ...form, farmer_card_number: event.target.value })} placeholder="BD-FARM-0001" required />
          </label>
          <label>National ID (NID) number
            <input value={form.nid_number} onChange={(event) => setForm({ ...form, nid_number: event.target.value })} required />
          </label>
          {error ? <p className="errorText">{error}</p> : null}
          <div className="formActions">
            <button className="commandButton" type="submit" disabled={status === "loading"}>
              {status === "loading" ? "Verifying..." : "Verify Farmer Card"}
            </button>
          </div>
        </form>

        <div className="toolPanel">
          {!result ? (
            <p className="muted">
              We check your Farmer Card number and NID against the demo Government Farmer
              Card registry. If it matches, you are verified instantly. If not, an admin
              will review it manually.
            </p>
          ) : result.data.matched ? (
            <div className="resultStack">
              <span className="badge good"><BadgeCheck size={14} /> Verified instantly</span>
              <p className="strong">{result.data.farmer.name}</p>
              <p className="muted">{result.data.farmer.district}</p>
              <a className="commandButton" href="/farmer/dashboard">Go to dashboard</a>
            </div>
          ) : (
            <div className="resultStack">
              <span className="badge warn">Pending manual review</span>
              <p className="muted">
                We could not confirm an automatic match. Your submission has been queued for an
                admin to review manually.
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
