"use client";

import { useEffect, useState } from "react";
import { getAdminAuditLog } from "../../../lib/api.js";

export default function AdminAuditLogPage() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminAuditLog()
      .then((data) => setEntries(data.entries || []))
      .catch(() => null)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="skeletonCard tall" />;

  if (entries.length === 0) {
    return <div className="emptyState">No admin actions recorded yet.</div>;
  }

  return (
    <section className="toolPanel">
      <p className="muted">Most recent 200 admin actions — verification decisions, account status changes, and review moderation.</p>
      <div className="dataTable">
        {entries.map((entry) => (
          <div key={entry.id}>
            <span className="badge">{entry.action}</span>
            <span>{entry.target_type} · {entry.target_id.slice(0, 10)}...</span>
            <span className="muted">by {entry.actor_role.toLowerCase()} {entry.actor_id.slice(0, 8)}...</span>
            <span className="muted">{new Date(entry.created_at).toLocaleString()}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
