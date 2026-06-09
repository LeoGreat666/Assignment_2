# Dairy Flat Air - Online Booking System

A Next.js + MongoDB Atlas booking system for a fictitious airline operating out of Dairy Flat Airport. It implements flight search, passenger bookings, booking cancellation, invoice display, and passenger itinerary lookup.

## Main requirements covered

- Landing page as the application entry point.
- Flight search by origin, destination, and real calendar date range.
- Weekly timetable expanded into real scheduled-flight documents in MongoDB.
- Booking creation with unique booking references.
- Capacity protection: bookings are rejected when a flight is full.
- Booking cancellation by booking reference and passenger email.
- Passenger/customer lookup and itinerary display.
- Invoice page after booking.
- Styled responsive UI, not plain HTML.
- MongoDB Atlas-ready and Vercel-ready.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env.local` from `.env.example` and set your MongoDB Atlas values:

```bash
cp .env.example .env.local
```

3. Seed MongoDB with customers and more than one week of scheduled flights:

```bash
npm run seed
```

4. Run locally:

```bash
npm run dev
```

5. Deploy on Vercel:

- Push this folder to GitHub.
- Import the repository in Vercel.
- Add the same environment variables from `.env.local` to Vercel Project Settings.
- Run `npm run seed` locally against the Atlas database before final submission, or run it in a trusted environment with the same Atlas URI.

## API endpoints

- `GET /api/schedules?date1=YYYY-MM-DD&date2=YYYY-MM-DD&orig=NZNE&dest=YSSY`
- `POST /api/bookings`
- `GET /api/bookings/[reference]`
- `DELETE /api/bookings/[reference]?email=passenger@example.com`
- `GET /api/customers?search=name-or-email`
- `GET /api/customers/[id]/bookings`

## Collections

- `customers`
- `schedules`

Bookings are embedded inside each scheduled flight document because each flight has a small, fixed passenger capacity.
