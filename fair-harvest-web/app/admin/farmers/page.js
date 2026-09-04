"use client";

import { useEffect, useState } from "react";
import { getAdminFarmers, updateAdminFarmer } from "../../../lib/api.js";

export default function AdminFarmersPage() {
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    getAdminFarmers()
      .then((data) => setFarmers(data.farmers || []))
      .catch(() => null)
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function toggleStatus(farmer) {
    const next = farmer.account_status === "active" ? "suspended" : "active";
    await updateAdminFarmer(farmer.farmer_id, { account_status: next });
    load();
  }

  if (loading) return <div className="skeletonCard tall" />;

  return (
    <section className="toolPanel">
      <div className="dataTable">
        {farmers.map((farmer) => (
          <div key={farmer.farmer_id}>
            <span>{farmer.name}</span>
            <span>{farmer.email}</span>
            <span className={farmer.verification_status === "verified" ? "badge good" : "badge warn"}>{farmer.verification_status}</span>
            <span>{farmer.product_count} products</span>
            <span className={farmer.account_status === "active" ? "badge good" : "badge bad"}>{farmer.account_status}</span>
            <button onClick={() => toggleStatus(farmer)}>{farmer.account_status === "active" ? "Suspend" : "Reinstate"}</button>
          </div>
        ))}
      </div>
    </section>
  );
}
