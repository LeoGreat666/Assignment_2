import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(request: NextRequest) {
  const search = (request.nextUrl.searchParams.get("search") || "").trim();
  const db = await getDb();
  const query = search
    ? { $or: [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } }
      ] }
    : {};
  const customers = await db.collection("customers")
    .find(query)
    .sort({ lastName: 1, firstName: 1 })
    .limit(20)
    .toArray();
  return NextResponse.json({ customers });
}
