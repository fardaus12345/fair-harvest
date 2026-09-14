"use client";

import { useSession } from "../auth/useSession.js";
import TraceEventForm from "./TraceEventForm.js";

// Shown to any logged-in farmer; the backend still enforces that only the
// product's actual owning farmer (or an admin) can add an event, so this is
// just a UI convenience, not the real authorization boundary.
export default function FarmerTraceControls({ productId }) {
  const { user, loading } = useSession();
  if (loading || !user || (user.role !== "farmer" && user.role !== "admin")) return null;

  return (
    <article className="toolPanel">
      <h2>Add trace event</h2>
      <p className="muted">Only works if you are the farmer who owns this product.</p>
      <TraceEventForm productId={productId} />
    </article>
  );
}
