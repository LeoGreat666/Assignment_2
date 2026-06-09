import FlightSearch from "@/components/FlightSearch";

export default function Home() {
  return (
    <main className="page">
      <section className="hero">
        <div className="heroText">
          <h1>Luxury light jet routes from Dairy Flat.</h1>
          <p>Search the rolling weekly timetable by real calendar dates, reserve available seats, and receive an instant booking reference and invoice.</p>
          <div className="badges">
            <span className="badge">Sydney prestige service</span>
            <span className="badge">Rotorua weekday shuttle</span>
            <span className="badge">Great Barrier, Chathams & Tekapo</span>
          </div>
        </div>
        <FlightSearch />
      </section>
    </main>
  );
}
