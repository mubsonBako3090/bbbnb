'use client';
import { useState, useEffect } from "react";
import styles from "@/styles/pages/Bills.module.css";

export default function PaymentForm({ bill, onClose, onSubmit }) {
  const [currentBill, setCurrentBill] = useState(null);
  const [method, setMethod] = useState("card");
  const [amountToPay, setAmountToPay] = useState(0);

  // Card
  const [cardNumber, setCardNumber] = useState("");
  const [cvv, setCvv] = useState("");
  const [exp, setExp] = useState("");

  // Bank
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");

  // Opay
  const [opayNumber, setOpayNumber] = useState("");
  const [opayValid, setOpayValid] = useState(true);

  // USSD
  const [ussdCode, setUssdCode] = useState("");

  // Success & loading
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  // ---------------------- Effects ----------------------
  useEffect(() => {
    if (bill && bill.id) {
      const amtDue = Number(bill.amountDue ?? 0);
      setCurrentBill({
        billNumber: bill.billNumber ?? "N/A",
        amountDue: amtDue,
        totalAmount: amtDue,
        id: bill.id,
      });
      setAmountToPay(amtDue);
    }
  }, [bill]);

  // ---------------------- Handlers ----------------------
  const handleCardChange = (e) => {
    let val = e.target.value.replace(/\D/g, "");
    val = val.match(/.{1,4}/g)?.join(" ") || val;
    setCardNumber(val);
  };
  const handleCvvChange = (e) => setCvv(e.target.value.replace(/\D/g, ""));
  const handleOpayChange = (e) => {
    const val = e.target.value.replace(/\D/g, "");
    setOpayNumber(val);
    setOpayValid(/^\d{10}$/.test(val));
  };
  const handleUssdChange = (e) => setUssdCode(e.target.value.startsWith("*") ? e.target.value : "*" + e.target.value);

  const handlePayment = async (e) => {
    e.preventDefault();

    if (!currentBill?.id) return alert("No bill selected.");
    if (amountToPay <= 0 || amountToPay > currentBill.amountDue) {
      return alert("Enter a valid payment amount.");
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/bills/${currentBill.id}/pay`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: amountToPay,
          method,
          card: { cardNumber, cvv, exp },
          bank: { bankName, accountNumber },
          opay: { opayNumber },
          ussd: { ussdCode },
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Payment failed");
        setLoading(false);
        return;
      }

      // Update bill locally
      const newAmountDue = data.bill.amountDue ?? 0;
      setCurrentBill((prev) => ({
        ...prev,
        amountDue: newAmountDue,
      }));
      setAmountToPay(newAmountDue);

      setSuccess(true);
      if (onSubmit) onSubmit(data.bill);

      setTimeout(() => {
        setSuccess(false);
        if (newAmountDue <= 0) onClose();
      }, 1800);
    } catch (error) {
      console.error(error);
      alert("Server error. Payment not processed.");
    } finally {
      setLoading(false);
    }
  };

  const progressPercentage = currentBill?.totalAmount
    ? ((currentBill.totalAmount - currentBill.amountDue) / currentBill.totalAmount) * 100
    : 0;

  // ---------------------- UI ----------------------
  if (!currentBill) return <p>Loading bill...</p>;

  return (
    <div className={styles.paymentModalOverlay}>
      <div className={styles.paymentModal}>
        <h3>Pay Bill #{currentBill.billNumber}</h3>
        <p><strong>Amount Due:</strong> ₦{currentBill.amountDue.toFixed(2)}</p>

        {/* Progress */}
        <div className={styles.progressBarContainer}>
          <div className={styles.progressBarFill} style={{ width: `${progressPercentage}%` }} />
        </div>
        <small>
          Paid: ₦{(currentBill.totalAmount - currentBill.amountDue).toFixed(2)} / ₦{currentBill.totalAmount.toFixed(2)}
        </small>

        {/* Amount to Pay */}
        <label className="form-label mt-3">Amount to Pay</label>
        <input
          type="number"
          className="form-control"
          value={amountToPay}
          onChange={(e) => setAmountToPay(Number(e.target.value))}
          min={1}
          max={currentBill.amountDue}
          required
          disabled={loading}
        />
        <small className="text-muted">
          You can pay partially. Max: ₦{currentBill.amountDue.toFixed(2)}
        </small>

        {/* Payment Method Selection */}
        <div className={styles.methodGrid}>
          {["card", "bank", "opay", "ussd"].map((m) => (
            <div
              key={m}
              className={`${styles.methodCard} ${method === m ? styles.active : ""}`}
              onClick={() => setMethod(m)}
            >
              {m === "card" && "💳 Card"}
              {m === "bank" && "🏦 Bank Transfer"}
              {m === "opay" && "🟩 Opay"}
              {m === "ussd" && "#️⃣ USSD"}
            </div>
          ))}
        </div>

        <form onSubmit={handlePayment}>
          {method === "card" && (
            <>
              <label className="form-label mt-3">Card Number</label>
              <input type="text" className="form-control" value={cardNumber} onChange={handleCardChange} maxLength={19} required disabled={loading} />

              <label className="form-label mt-3">CVV</label>
              <input type="password" className="form-control" value={cvv} onChange={handleCvvChange} maxLength={3} required disabled={loading} />

              <label className="form-label mt-3">Expiry Date</label>
              <input type="month" className="form-control" value={exp} onChange={(e) => setExp(e.target.value)} required disabled={loading} />
            </>
          )}

          {method === "bank" && (
            <>
              <label className="form-label mt-3">Bank Name</label>
              <select className="form-select" value={bankName} onChange={(e) => setBankName(e.target.value)} required disabled={loading}>
                <option value="">Select Bank</option>
                <option value="GTBank">GTBank</option>
                <option value="First Bank">First Bank</option>
                <option value="Access Bank">Access Bank</option>
                <option value="Zenith Bank">Zenith Bank</option>
              </select>

              <label className="form-label mt-3">Account Number</label>
              <input type="text" className="form-control" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} required disabled={loading} />
            </>
          )}

          {method === "opay" && (
            <>
              <label className="form-label mt-3">Opay Number</label>
              <input type="text" className={`form-control ${!opayValid ? styles.invalid : ""}`} value={opayNumber} onChange={handleOpayChange} placeholder="10-digit number" required disabled={loading} />
              {!opayValid && <small className="text-danger">Invalid Opay number</small>}
            </>
          )}

          {method === "ussd" && (
            <>
              <label className="form-label mt-3">USSD Code</label>
              <input type="text" className="form-control" value={ussdCode} onChange={handleUssdChange} placeholder="*737*2*Amount#" required disabled={loading} />
            </>
          )}

          <div className="d-flex justify-content-between mt-4">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Processing..." : "Pay Now"}
            </button>
          </div>
        </form>

        {success && (
          <div className={styles.successOverlay}>
            <div className={styles.checkmark}>✔</div>
            <p>Payment Successful!</p>
          </div>
        )}
      </div>
    </div>
  );
}
