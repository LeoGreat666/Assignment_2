"use client";

import { useState } from "react";
import CustomerSearch from "./CustomerSearch";
import { airportOptions } from "@/lib/airports";
import { formatLocal, formatMoney } from "@/lib/format";

type Schedule = {
  _id: string;
  flightNumber: string;
  aircraft: string;
  capacity: number;
  origin: { code: string; city: string; name: string };
  destination: { code: string; city: string; name: string };
  departureLocal: string;
  arrivalLocal: string;
  price: number;
  seatsLeft: number;
};

type Customer = { _id: string; title: string; firstName: string; lastName: string; email: string };

function today(offset = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
}

export default function FlightSearch() {
  const [orig, setOrig] = useState("NZNE");
  const [dest, setDest] = useState("YSSY");
  const [date1, setDate1] = useState(today());
  const [date2, setDate2] = useState(today(30));
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [message, setMessage] = useState("");
  const [bookingFor, setBookingFor] = useState<Schedule | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(false);

  async function searchFlights() {
    setMessage("");
    setBookingFor(null);
    setLoading(true);
    const res = await fetch(`/api/schedules?date1=${date1}&date2=${date2}&orig=${orig}&dest=${dest}`);
    const data = await res.json();
    if (!res.ok) setMessage(data.error || "Unable to search flights.");
    else {
      setSchedules(data.schedules || []);
      if (!data.schedules?.length) setMessage("No flights found. Try widening the date range because some routes are infrequent.");
    }
    setLoading(false);
  }

  async function makeBooking() {
    if (!bookingFor || !selectedCustomer) return;
    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scheduleId: bookingFor._id, customerId: selectedCustomer._id })
    });
    const data = await res.json();
    if (!res.ok) setMessage(data.error || "Booking failed.");
    else window.location.href = `/invoice/${data.reference}`;
  }

  return (
    <>
      <section className="panel">
        <h2>Search scheduled flights</h2>
        <div className="formGrid">
          <div className="field">
            <label>From</label>
            <select value={orig} onChange={e => setOrig(e.target.value)}>
              {airportOptions.map(a => <option key={a.code} value={a.code}>{a.code} — {a.city}</option>)}
            </select>
          </div>
          <div className="field">
            <label>To</label>
            <select value={dest} onChange={e => setDest(e.target.value)}>
              {airportOptions.map(a => <option key={a.code} value={a.code}>{a.code} — {a.city}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Earliest departure</label>
            <input type="date" value={date1} onChange={e => setDate1(e.target.value)} />
          </div>
          <div className="field">
            <label>Latest departure</label>
            <input type="date" value={date2} onChange={e => setDate2(e.target.value)} />
          </div>
          <button className="full" onClick={searchFlights} disabled={loading || orig === dest}>{loading ? "Searching..." : "Search flights"}</button>
        </div>
        {orig === dest && <p className="notice">Origin and destination must be different.</p>}
      </section>

      {message && <p className={`notice ${message.includes("failed") || message.includes("Unable") ? "error" : ""}`}>{message}</p>}

      <section className="results">
        {schedules.map(schedule => (
          <article className="card flightCard" key={schedule._id}>
            <div>
              <div className="routeLine">
                <span>{schedule.origin.code}</span><span className="arrow">→</span><span>{schedule.destination.code}</span>
              </div>
              <p>{schedule.origin.name} to {schedule.destination.name}</p>
              <div className="meta">
                <div className="stat"><span>Flight</span><strong>{schedule.flightNumber}</strong></div>
                <div className="stat"><span>Aircraft</span><strong>{schedule.aircraft}</strong></div>
                <div className="stat"><span>Departs</span><strong>{formatLocal(schedule.departureLocal)}</strong></div>
                <div className="stat"><span>Arrives</span><strong>{formatLocal(schedule.arrivalLocal)}</strong></div>
                <div className="stat"><span>Price</span><strong>{formatMoney(schedule.price)}</strong></div>
                <div className="stat"><span>Seats left</span><strong>{schedule.seatsLeft} of {schedule.capacity}</strong></div>
              </div>
            </div>
            <div className="sideAction">
              <button disabled={schedule.seatsLeft < 1} onClick={() => { setBookingFor(schedule); setSelectedCustomer(null); }}>
                {schedule.seatsLeft < 1 ? "Full" : "Select & book"}
              </button>
            </div>
          </article>
        ))}
      </section>

      {bookingFor && (
        <section className="panel">
          <h2>Book {bookingFor.flightNumber}</h2>
          <p>Select a passenger from the supplied customer list. The booking is for one seat.</p>
          <CustomerSearch onSelect={setSelectedCustomer} />
          {selectedCustomer && (
            <div className="notice success">
              Selected {selectedCustomer.title} {selectedCustomer.firstName} {selectedCustomer.lastName}. <button onClick={makeBooking}>Confirm booking</button>
            </div>
          )}
        </section>
      )}
    </>
  );
}
