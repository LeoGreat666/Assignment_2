import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/db";

function reference() {
  return `DFA-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

export async function POST(request: NextRequest) {
  const { scheduleId, customerId } = await request.json();
  if (!ObjectId.isValid(scheduleId) || !ObjectId.isValid(customerId)) {
    return NextResponse.json({ error: "Valid scheduleId and customerId are required." }, { status: 400 });
  }

  const db = await getDb();
  const schedule = await db.collection("schedules").findOne({ _id: new ObjectId(scheduleId) });
  if (!schedule) return NextResponse.json({ error: "Scheduled flight not found." }, { status: 404 });
  if ((schedule.bookings?.length || 0) >= schedule.capacity) {
    return NextResponse.json({ error: "This scheduled flight is full." }, { status: 409 });
  }

  const customer = await db.collection("customers").findOne({ _id: new ObjectId(customerId) });
  if (!customer) return NextResponse.json({ error: "Customer not found." }, { status: 404 });

  const alreadyBooked = (schedule.bookings || []).some((b: any) => String(b.customerId) === String(customer._id));
  if (alreadyBooked) return NextResponse.json({ error: "This passenger is already booked on that flight." }, { status: 409 });

  const booking = {
    reference: reference(),
    customerId: customer._id,
    customerName: `${customer.title} ${customer.firstName} ${customer.lastName}`,
    customerEmail: customer.email,
    bookedAt: new Date()
  };

  const result = await db.collection("schedules").updateOne(
    { _id: schedule._id, $expr: { $lt: [{ $size: "$bookings" }, "$capacity"] } },
    { $push: { bookings: booking } }
  );

  if (!result.modifiedCount) return NextResponse.json({ error: "This scheduled flight has just become full." }, { status: 409 });
  return NextResponse.json({ reference: booking.reference }, { status: 201 });
}
