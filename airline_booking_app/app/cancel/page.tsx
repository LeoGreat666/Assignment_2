"use client";

import { useState } from "react";

export default function CancelPage() {
  const [reference, setReference] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [ok, setOk] = useState(false);

  async function cancelBooking() {
    setMessage("");
    setOk(false);
    const res = await fetch(`/api/bookings/${encodeURIComponent(reference)}?email=${encodeURIComponent(email)}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) setMessage(data.error || "Cancellation failed.");
    else { setOk(true); setMessage("Booking cancelled successfully. The seat is now available again."); }
  }

  return (
    <main className="page">
      <section className="panel">
        <h1>Cancel a booking</h1>
        <p>Enter the booking reference and the passenger email address used for that booking.</p>
        <div className="formGrid">
          <div className="field"><label>Booking reference</label><input value={reference} onChange={e => setReference(e.target.value)} placeholder="DFA-..." /></div>
          <div className="field"><label>Passenger email</label><input value={email} onChange={e => setEmail(e.target.value)} placeholder="passenger@example.com" /></div>
          <button className="danger full" onClick={cancelBooking} disabled={!reference || !email}>Cancel booking</button>
        </div>
        {message && <p className={`notice ${ok ? "success" : "error"}`}>{message}</p>}
      </section>
    </main>
  );
}
