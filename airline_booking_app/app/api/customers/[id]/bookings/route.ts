import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/db";

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  if (!ObjectId.isValid(params.id)) return NextResponse.json({ error: "Invalid customer id." }, { status: 400 });
  const db = await getDb();
  const customerId = new ObjectId(params.id);
  const schedules = await db.collection("schedules")
    .find({ "bookings.customerId": customerId })
    .sort({ departureUtc: 1 })
    .toArray();
  const bookings = schedules.map(schedule => ({
    schedule,
    booking: schedule.bookings.find((b: any) => String(b.customerId) === String(customerId))
  }));
  return NextResponse.json({ bookings });
}
