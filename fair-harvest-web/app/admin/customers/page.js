"use client";

import { useEffect, useState } from "react";
import { getAdminCustomers, updateAdminCustomer } from "../../../lib/api.js";

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    getAdminCustomers()
      .then((data) => setCustomers(data.customers || []))
      .catch(() => null)
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function toggleStatus(customer) {
    const next = customer.status === "active" ? "suspended" : "active";
    await updateAdminCustomer(customer.user_id, { status: next });
    load();
  }

  if (loading) return <div className="skeletonCard tall" />;

  return (
    <section className="toolPanel">
      <div className="dataTable">
        {customers.map((customer) => (
          <div key={customer.user_id}>
            <span>{customer.name}</span>
            <span>{customer.email}</span>
            <span>{new Date(customer.created_at).toLocaleDateString()}</span>
            <span>{customer.order_count} orders</span>
            <span className={customer.status === "active" ? "badge good" : "badge bad"}>{customer.status}</span>
            <button onClick={() => toggleStatus(customer)}>{customer.status === "active" ? "Suspend" : "Reinstate"}</button>
          </div>
        ))}
      </div>
    </section>
  );
}
