import connectDB from "@/lib/database";
import Bill from "@/models/Bills";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

export async function GET(request, { params }) {
  try {
    await connectDB();

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(params.billId)) {
      return NextResponse.json({ error: "Invalid bill ID" }, { status: 400 });
    }

    const bill = await Bill.findById(params.billId).populate(
      "user",
      "firstName lastName email accountNumber"
    );

    if (!bill) {
      return NextResponse.json({ error: "Bill not found" }, { status: 404 });
    }

    // Return JSON; PDF is generated on the client
    return NextResponse.json(bill);
  } catch (error) {
    console.error("Download bill error:", error);
    return NextResponse.json(
      { error: "Failed to fetch bill data" },
      { status: 500 }
    );
  }
}
