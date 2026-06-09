"use client";

import { useState } from "react";

type Customer = { _id: string; title: string; firstName: string; lastName: string; email: string };

export default function CustomerSearch({ onSelect }: { onSelect: (customer: Customer) => void }) {
  const [search, setSearch] = useState("");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);

  async function findCustomers() {
    setLoading(true);
    const res = await fetch(`/api/customers?search=${encodeURIComponent(search)}`);
    const data = await res.json();
    setCustomers(data.customers || []);
    setLoading(false);
  }

  return (
    <div className="list">
      <div className="field">
        <label>Passenger name or email</label>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Start typing a passenger from the supplied customer list" />
      </div>
      <button type="button" className="secondary" onClick={findCustomers} disabled={loading}>{loading ? "Searching..." : "Find passenger"}</button>
      {customers.map(customer => (
        <button key={customer._id} type="button" className="secondary" onClick={() => onSelect(customer)}>
          {customer.title} {customer.firstName} {customer.lastName} — {customer.email}
        </button>
      ))}
    </div>
  );
}
