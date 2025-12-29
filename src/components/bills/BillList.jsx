'use client';
import { useState } from "react";
import PaymentForm from "./PaymentForm";
import DownloadBillButton from "@/components/DownloadBillButton"; // client-side component
import styles from "@/styles/pages/Bills.module.css";
import Header from "@/components/ui/Header";

export default function BillList({ bills }) {
  const [selectedBill, setSelectedBill] = useState(null);
  const [showPayment, setShowPayment] = useState(false);

  const handlePayClick = (bill) => {
    if (bill && !isNaN(Number(bill.amountDue))) {
      setSelectedBill({ ...bill, amountDue: Number(bill.amountDue) });
      setShowPayment(true);
    } else {
      alert("Invalid bill data. Cannot pay this bill.");
    }
  };

  const handleClosePayment = () => {
    setShowPayment(false);
    setSelectedBill(null);
  };

  const handleSubmitPayment = (paymentData) => {
    console.log("Payment Submitted:", paymentData);
    // Call API here...
  };

  return (
    <div>
      <Header />
      <h2>Your Bills</h2>
      <ul className={styles.billList}>
        {bills.map((bill) => (
          <li key={bill._id} className={styles.billItem}>
            <span>Bill #{bill.billNumber}</span>
            <span>Amount Due: ${Number(bill.amountDue ?? 0).toFixed(2)}</span>
            <div>
              <button
                className="btn btn-primary"
                onClick={() => handlePayClick(bill)}
              >
                Pay
              </button>

              {/* Client-side Download PDF button */}
              {bill.status === "paid" && <DownloadBillButton billId={bill._id} />}
            </div>
          </li>
        ))}
      </ul>

      {showPayment && selectedBill && (
        <PaymentForm
          bill={selectedBill}
          onClose={handleClosePayment}
          onSubmit={handleSubmitPayment}
        />
      )}
    </div>
  );
}
