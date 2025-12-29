import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/database";
import Bills from "@/models/Bills";

export async function PATCH(req) {
  try {
    await connectDB();

    const body = await req.json();
    const { billId, amount, method } = body;

    if (!billId || !amount) {
      return NextResponse.json(
        { error: "Bill ID and amount are required" },
        { status: 400 }
      );
    }

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(billId)) {
      return NextResponse.json(
        { error: "Invalid Bill ID" },
        { status: 400 }
      );
    }

    const bill = await Bills.findById(billId);
    if (!bill) {
      return NextResponse.json(
        { error: "Bill not found" },
        { status: 404 }
      );
    }

    const amountNum = Number(amount);
    const amountDue = Number(bill.amountDue);

    if (amountNum <= 0) {
      return NextResponse.json(
        { error: "Invalid payment amount" },
        { status: 400 }
      );
    }

    if (amountNum > amountDue) {
      return NextResponse.json(
        { error: "Payment amount cannot exceed amount due" },
        { status: 400 }
      );
    }

    // Deduct payment
    bill.amountDue = amountDue - amountNum;

    // Status updates
    if (bill.amountDue === 0) {
      bill.status = "paid";
      bill.paidAt = new Date();
    } else {
      bill.status = "partially_paid";
    }

    // Add payment history
    bill.payments.push({
      amount: amountNum,
      method,
      paidAt: new Date()
    });

    await bill.save();

    return NextResponse.json({
      message: "Payment successful",
      bill
    });
  } catch (error) {
    console.error("Payment error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
