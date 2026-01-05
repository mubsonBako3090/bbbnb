'use client';
import { useState, useEffect, useRef } from "react";
import styles from "@/styles/pages/Bills.module.css";

export default function PaymentForm({ bill, onClose, onSubmit }) {
  const [currentBill, setCurrentBill] = useState(null);
  const [method, setMethod] = useState("card");
  const [amountToPay, setAmountToPay] = useState(0);

  const [cardNumber, setCardNumber] = useState("");
  const [cvv, setCvv] = useState("");
  const [exp, setExp] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [opayNumber, setOpayNumber] = useState("");
  const [opayValid, setOpayValid] = useState(true);
  const [ussdCode, setUssdCode] = useState("");

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState({});

  const modalRef = useRef(null);
  const closeButtonRef = useRef(null);
  const firstInputRef = useRef(null);
  const successAnnouncementRef = useRef(null);
  const errorAnnouncementRef = useRef(null);

  useEffect(() => {
    if (bill && bill._id) {
      const amtDue = Number(bill.amountDue ?? 0);
      setCurrentBill({ ...bill, amountDue: amtDue });
      setAmountToPay(amtDue);
    }
  }, [bill]);

  useEffect(() => {
    const handleEscape = e => {
      if (e.key === "Escape" && !loading) handleClose();
    };
    document.addEventListener("keydown", handleEscape);

    const handleFocusTrap = e => {
      if (!modalRef.current) return;
      const focusable = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstEl = focusable[0];
      const lastEl = focusable[focusable.length - 1];
      if (e.key === "Tab") {
        if (e.shiftKey && document.activeElement === firstEl) {
          e.preventDefault(); lastEl.focus();
        } else if (!e.shiftKey && document.activeElement === lastEl) {
          e.preventDefault(); firstEl.focus();
        }
      }
    };
    modalRef.current?.addEventListener("keydown", handleFocusTrap);

    firstInputRef.current?.focus();

    const mainContent = document.querySelector("main");
    if (mainContent) mainContent.setAttribute("aria-hidden", "true");

    return () => {
      document.removeEventListener("keydown", handleEscape);
      modalRef.current?.removeEventListener("keydown", handleFocusTrap);
      if (mainContent) mainContent.removeAttribute("aria-hidden");
    };
  }, []);

  const validateForm = () => {
    const newErrors = {};
    if (!amountToPay || amountToPay <= 0 || amountToPay > currentBill.amountDue) {
      newErrors.amountToPay = `Enter a valid amount between ₦1 and ₦${currentBill.amountDue.toFixed(2)}`;
    }
    if (method === "card") {
      if (!cardNumber.replace(/\s/g,'').match(/^\d{16}$/)) newErrors.cardNumber="Invalid card number";
      if (!cvv.match(/^\d{3,4}$/)) newErrors.cvv="Invalid CVV";
      if (!exp) newErrors.exp="Select expiry";
    }
    if (method === "bank") {
      if (!bankName) newErrors.bankName="Select bank";
      if (!accountNumber.match(/^\d{10}$/)) newErrors.accountNumber="Invalid account number";
    }
    if (method === "opay" && !opayValid) newErrors.opayNumber="Invalid Opay number";
    if (method === "ussd" && !ussdCode.match(/^\*.*\*.*\#$/)) newErrors.ussdCode="Invalid USSD code";

    setErrors(newErrors);
    return Object.keys(newErrors).length===0;
  };

  const handleClose = () => { if(!loading) onClose(); };

  const handlePayment = async e => {
    e.preventDefault();
    if (!currentBill?._id) return alert("No bill selected");
    if (!validateForm()) return;

    setLoading(true);
    setErrors({});

    try {
      // ------------------- PAYSTACK CARD PAYMENT -------------------
      if (method === "card") {
        const res = await fetch("/api/payments/initialize", {
          method:"POST",
          headers:{"Content-Type":"application/json"},
          body:JSON.stringify({
            billId: currentBill._id,
            amount: amountToPay,
            email: bill.customerEmail // optional
          })
        });
        const data = await res.json();
        if (!data.authorization_url) throw new Error("Payment initialization failed");

        // Open Paystack checkout in a new window
        window.location.href = data.authorization_url;
        return;
      }

      // ------------------- OTHER METHODS (Bank / Opay / USSD) -------------------
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/bills/${currentBill._id}/pay`, {
        method: "POST",
        headers: {"Content-Type":"application/json","Authorization":`Bearer ${token}`},
        body: JSON.stringify({
          amount: amountToPay,
          method,
          card:{cardNumber,cvv,exp},
          bank:{bankName,accountNumber},
          opay:{opayNumber},
          ussd:{ussdCode}
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Payment failed");

      // Update bill locally
setCurrentBill(prev => ({ 
  ...prev, 
  amountDue: data.bill.amountDue 
}));

setAmountToPay(data.bill.amountDue);
setSuccess(true);

if (successAnnouncementRef.current) {
  successAnnouncementRef.current.textContent =
    "Payment processed successfully";
}

onSubmit?.(data.bill);

setTimeout(() => {
  setSuccess(false);
  if (data.bill.amountDue <= 0) onClose();
}, 1800);


    } catch(err) {
      console.error(err);
      setErrors({submit: err.message});
    } finally { setLoading(false); }
  };

  if(!currentBill) return <p role="status">Loading bill...</p>;

  return (
    <>
      <div className={styles.paymentModalOverlay} onClick={handleClose} aria-hidden="true"/>
      <div ref={modalRef} className={styles.paymentModal} role="dialog" aria-modal="true">
        <div ref={successAnnouncementRef} className="visually-hidden" aria-live="assertive"/>
        <div ref={errorAnnouncementRef} className="visually-hidden" aria-live="assertive"/>
        <div className="d-flex justify-content-between align-items-start mb-3">
          <h3>Pay Bill #{currentBill.billNumber}</h3>
          <button ref={closeButtonRef} type="button" className="btn-close" onClick={handleClose} disabled={loading}/>
        </div>
        <p><strong>Amount Due:</strong> ₦{currentBill.amountDue.toFixed(2)}</p>

        <div className="mt-3">
          <label htmlFor="amountToPay">Amount to Pay (₦) *</label>
          <input type="number" id="amountToPay" value={amountToPay} onChange={e=>setAmountToPay(Number(e.target.value))} disabled={loading} min={1} max={currentBill.amountDue} className={`form-control ${errors.amountToPay?"is-invalid":""}`} />
          {errors.amountToPay && <div className="invalid-feedback">{errors.amountToPay}</div>}
        </div>

        <fieldset className="mt-3">
          <legend>Payment Method *</legend>
          {["card","bank","opay","ussd"].map(m=>(
            <button key={m} type="button" className={method===m?styles.active:""} onClick={()=>setMethod(m)} disabled={loading}>{m.toUpperCase()}</button>
          ))}
        </fieldset>

        <form onSubmit={handlePayment}>
          {method==="card" && <div className="mt-3">
            <input placeholder="Card Number" value={cardNumber} onChange={e=>setCardNumber(e.target.value)} disabled={loading}/>
            <input placeholder="CVV" value={cvv} onChange={e=>setCvv(e.target.value)} disabled={loading}/>
            <input type="month" value={exp} onChange={e=>setExp(e.target.value)} disabled={loading}/>
          </div>}

          {/* Keep other method fields as-is */}

          {errors.submit && <div className="alert alert-danger">{errors.submit}</div>}
          <div className="mt-3 d-flex justify-content-between">
            <button type="button" className="btn btn-secondary" onClick={handleClose} disabled={loading}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading?"Processing...":`Pay ₦${amountToPay.toFixed(2)}`}</button>
          </div>
        </form>

        {success && <div className={styles.successOverlay}>✔ Payment Successful!</div>}
      </div>
    </>
  );
}
