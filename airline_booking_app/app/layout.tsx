import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dairy Flat Air",
  description: "Online booking system for Dairy Flat Air"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="shell">
          <header className="topbar">
            <a className="brand" href="/">Dairy Flat Air</a>
            <nav>
              <a href="/">Search</a>
              <a href="/customer-bookings">Passenger trips</a>
              <a href="/cancel">Cancel booking</a>
            </nav>
          </header>
          {children}
          <footer className="footer">Specialised point-to-point light jet travel from Dairy Flat Airport.</footer>
        </div>
      </body>
    </html>
  );
}
