import connectDB from "@/lib/database";
import Bills from "@/models/Bills"; // correct import
import { NextResponse } from "next/server";

export async function PATCH(req, { params }) {
  try {
    await connectDB();

    const { billId } = params;
    const { amount } = await req.json();

    const bill = await Bills.findById(billId); // ✅ use Bills here
    if (!bill) {
      return NextResponse.json({ error: "Bill not found" }, { status: 404 });
    }

    if (bill.status === "paid") {
      return NextResponse.json({ error: "Bill already paid" }, { status: 400 });
    }

    bill.amountDue = Math.max(0, bill.amountDue - amount);

    if (bill.amountDue === 0) {
      bill.status = "paid";
    }

    await bill.save();

    return NextResponse.json({ message: "Payment successful", bill });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
