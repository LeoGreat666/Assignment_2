"use client";

import { useState } from "react";
import CustomerSearch from "@/components/CustomerSearch";
import { formatLocal, formatMoney } from "@/lib/format";

type Customer = { _id: string; title: string; firstName: string; lastName: string; email: string };

type BookingRow = {
  booking: { reference: string; customerName: string; customerEmail: string };
  schedule: {
    flightNumber: string;
    aircraft: string;
    origin: { code: string; city: string };
    destination: { code: string; city: string };
    departureLocal: string;
    arrivalLocal: string;
    price: number;
  };
};

export default function CustomerBookingsPage() {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [message, setMessage] = useState("");

  async function loadBookings(selected: Customer) {
    setCustomer(selected);
    setMessage("");
    const res = await fetch(`/api/customers/${selected._id}/bookings`);
    const data = await res.json();
    if (!res.ok) setMessage(data.error || "Could not load bookings.");
    else {
      setBookings(data.bookings || []);
      if (!data.bookings?.length) setMessage("This passenger does not currently have any booked flights.");
    }
  }

  return (
    <main className="page grid2">
      <section className="panel">
        <h1>Passenger trips</h1>
        <p>Find a passenger from the supplied customer list and display all scheduled flights they are booked on.</p>
        <CustomerSearch onSelect={loadBookings} />
      </section>
      <section className="panel">
        <h2>{customer ? `${customer.firstName} ${customer.lastName}` : "Selected passenger"}</h2>
        {message && <p className="notice">{message}</p>}
        <div className="list">
          {bookings.map(row => (
            <article className="card flightCard" key={row.booking.reference}>
              <div>
                <div className="routeLine"><span>{row.schedule.origin.code}</span><span className="arrow">→</span><span>{row.schedule.destination.code}</span></div>
                <p>{row.schedule.origin.city} to {row.schedule.destination.city}</p>
                <div className="meta">
                  <div className="stat"><span>Reference</span><strong>{row.booking.reference}</strong></div>
                  <div className="stat"><span>Flight</span><strong>{row.schedule.flightNumber}</strong></div>
                  <div className="stat"><span>Departs</span><strong>{formatLocal(row.schedule.departureLocal)}</strong></div>
                  <div className="stat"><span>Arrives</span><strong>{formatLocal(row.schedule.arrivalLocal)}</strong></div>
                  <div className="stat"><span>Price</span><strong>{formatMoney(row.schedule.price)}</strong></div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
