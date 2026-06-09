import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { isAirportCode, isIsoDate } from "@/lib/validators";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const date1 = params.get("date1");
  const date2 = params.get("date2");
  const orig = params.get("orig");
  const dest = params.get("dest");

  if (!isIsoDate(date1) || !isIsoDate(date2) || !isAirportCode(orig) || !isAirportCode(dest)) {
    return NextResponse.json({ error: "Use date1/date2 as YYYY-MM-DD and valid orig/dest ICAO codes." }, { status: 400 });
  }

  const start = new Date(`${date1}T00:00:00+12:00`);
  const end = new Date(`${date2}T23:59:59+12:00`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start > end) {
    return NextResponse.json({ error: "Invalid date range." }, { status: 400 });
  }

  const db = await getDb();
  const schedules = await db.collection("schedules")
    .find({
      "origin.code": orig,
      "destination.code": dest,
      departureUtc: { $gte: start, $lte: end }
    })
    .sort({ departureUtc: 1 })
    .toArray();

  return NextResponse.json({ schedules: schedules.map(s => ({ ...s, seatsLeft: s.capacity - (s.bookings?.length || 0) })) });
}
