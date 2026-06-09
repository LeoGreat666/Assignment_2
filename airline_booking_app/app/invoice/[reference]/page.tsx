import { formatLocal, formatMoney } from "@/lib/format";

async function getInvoice(reference: string) {
  const base = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const res = await fetch(`${base}/api/bookings/${reference}`, { cache: "no-store" });
  if (!res.ok) return null;
  return res.json();
}

export default async function InvoicePage({ params }: { params: { reference: string } }) {
  const data = await getInvoice(params.reference);
  if (!data) return <main className="page"><section className="panel"><h1>Booking not found</h1><p>Check the booking reference and try again.</p></section></main>;
  const { booking, schedule } = data;
  return (
    <main className="page">
      <section className="card invoice">
        <p className="small">Booking confirmed</p>
        <div className="ref">{booking.reference}</div>
        <h1>Invoice</h1>
        <div className="meta">
          <div className="stat"><span>Passenger</span><strong>{booking.customerName}</strong></div>
          <div className="stat"><span>Email</span><strong>{booking.customerEmail}</strong></div>
          <div className="stat"><span>Flight</span><strong>{schedule.flightNumber}</strong></div>
          <div className="stat"><span>Aircraft</span><strong>{schedule.aircraft}</strong></div>
          <div className="stat"><span>From</span><strong>{schedule.origin.code} — {schedule.origin.city}</strong></div>
          <div className="stat"><span>To</span><strong>{schedule.destination.code} — {schedule.destination.city}</strong></div>
          <div className="stat"><span>Departure</span><strong>{formatLocal(schedule.departureLocal)}</strong></div>
          <div className="stat"><span>Arrival</span><strong>{formatLocal(schedule.arrivalLocal)}</strong></div>
          <div className="stat"><span>Total due</span><strong>{formatMoney(schedule.price)}</strong></div>
        </div>
        <p className="notice success">Keep this booking reference. It is required for cancellation.</p>
        <a className="button secondary" href="/">Book another flight</a>
      </section>
    </main>
  );
}
