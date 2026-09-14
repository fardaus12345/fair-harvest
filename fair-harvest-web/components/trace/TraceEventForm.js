"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addTraceEvent } from "../../lib/api.js";

const STAGES = [
  { value: "PLANTED", label: "Planted" },
  { value: "HARVESTED", label: "Harvested" },
  { value: "LAB_TESTED", label: "Lab tested" },
  { value: "PACKAGED", label: "Packaged" },
  { value: "SHIPPED", label: "Shipped" },
  { value: "LISTED", label: "Listed" }
];

export default function TraceEventForm({ productId }) {
  const router = useRouter();
  const [stage, setStage] = useState("HARVESTED");
  const [note, setNote] = useState("");
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus("loading");
    setError("");
    try {
      await addTraceEvent(productId, { stage, note: note || undefined });
      setStatus("done");
      setNote("");
      router.refresh();
      setTimeout(() => setStatus("idle"), 1500);
    } catch (err) {
      setStatus("error");
      setError(err.message || "Could not add trace event");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="traceEventForm">
      <label>
        Stage
        <select value={stage} onChange={(event) => setStage(event.target.value)}>
          {STAGES.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </label>
      <label>
        Note (optional)
        <input value={note} onChange={(event) => setNote(event.target.value)} placeholder="e.g. Cold storage at 4°C" maxLength={500} />
      </label>
      <button type="submit" disabled={status === "loading"}>
        {status === "loading" ? "Saving..." : status === "done" ? "Added" : "Add trace event"}
      </button>
      {error && <p className="formError">{error}</p>}
    </form>
  );
}
