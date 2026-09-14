"use client";

import { useEffect, useState } from "react";
import { getAdminVerificationQueue, approveFarmerVerification, rejectFarmerVerification } from "../../../lib/api.js";

export default function AdminVerificationPage() {
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    getAdminVerificationQueue()
      .then((data) => setFarmers(data.farmers || []))
      .catch(() => null)
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function approve(farmerId) {
    await approveFarmerVerification(farmerId);
    load();
  }

  async function reject(farmerId) {
    await rejectFarmerVerification(farmerId);
    load();
  }

  if (loading) return <div className="skeletonCard tall" />;

  if (farmers.length === 0) {
    return <div className="emptyState">No pending Farmer Card verifications.</div>;
  }

  return (
    <section className="toolPanel">
      <div className="dataTable">
        {farmers.map((farmer) => (
          <div key={farmer.farmer_id}>
            <span>{farmer.name}</span>
            <span>{farmer.email}</span>
            <span>{farmer.farmer_card_number_masked || "Not submitted"}</span>
            <span>{farmer.district || "—"}</span>
            <span className="badge warn">{farmer.verification_status}</span>
            <span className="actionRow">
              <button onClick={() => approve(farmer.farmer_id)}>Approve</button>
              <button className="ghostButton" onClick={() => reject(farmer.farmer_id)}>Reject</button>
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
