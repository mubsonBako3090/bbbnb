// pages/api/payments/verify.js
import Paystack from "paystack-node";
import connectDB from "@/lib/database";
import Bill from "@/models/Bill";

const paystack = new Paystack(process.env.PAYSTACK_SECRET);

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end();

  await connectDB();

  const { reference, billId } = req.query;
  if (!reference || !billId) return res.status(400).json({ error: "Missing parameters" });

  try {
    // Verify payment with Paystack
    const verification = await paystack.transaction.verify({ reference });

    if (verification.status !== "success") {
      return res.status(400).json({ error: "Payment not successful" });
    }

    // Payment successful – update bill
    const amountPaid = verification.amount / 100; // convert kobo to naira
    const bill = await Bill.findById(billId);
    if (!bill) return res.status(404).json({ error: "Bill not found" });

    const newAmountDue = Math.max(bill.amountDue - amountPaid, 0);
    bill.amountDue = newAmountDue;
    bill.status = newAmountDue === 0 ? "paid" : "partial";
    await bill.save();

    // Redirect to frontend or return JSON
    return res.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/bills?paid=true`);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
