// pages/api/payments/initialize.js
import Paystack from "paystack-node";
import connectDB from "@/lib/database";
import Bill from "@/models/Bill";

const paystack = new Paystack(process.env.PAYSTACK_SECRET);

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  await connectDB();

  const { billId, amount, email } = req.body;
  const bill = await Bill.findById(billId);
  if (!bill) return res.status(404).json({ error: "Bill not found" });

  try {
    const response = await paystack.transaction.initialize({
      amount: Math.floor(amount * 100), // Paystack expects kobo
      email,
      callback_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/payments/verify?billId=${billId}`,
    });

    res.status(200).json(response.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
