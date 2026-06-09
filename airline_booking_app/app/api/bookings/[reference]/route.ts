import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(_request: NextRequest, { params }: { params: { reference: string } }) {

  const db = await getDb();

  const schedule = await db.collection("schedules").findOne({ "bookings.reference": params.reference });

  if (!schedule) {
    return NextResponse.json(
      { error: "Booking not found." }, 
      { status: 404 }
    );
  }
  
  const booking = schedule.bookings.find((b: any) => b.reference === params.reference);
  return NextResponse.json({ booking, schedule: { ...schedule, seatsLeft: schedule.capacity - schedule.bookings.length } });
}

export async function DELETE(request: NextRequest, { params }: { params: { reference: string } }) {
  const email = (request.nextUrl.searchParams.get("email") || "").trim().toLowerCase();

  if (!email) {
    return NextResponse.json(
      { error: "Passenger email is required for cancellation." },
      { status: 400 }
    );
  }

  const db = await getDb();

  const filter = {
    "bookings.reference": params.reference,
    "bookings.customerEmail": email
  };

  const update: any = {
    $pull: {
      bookings: {
        reference: params.reference,
        customerEmail: email
      }
    }
  };

  const result = await db.collection("schedules").updateOne(filter, update);

  if (!result.modifiedCount) {
    return NextResponse.json(
      { error: "No matching booking reference and email were found." },
      { status: 404 }
    );
  }

  return NextResponse.json({ ok: true });
}