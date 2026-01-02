'use client';
import { useState, useEffect, useRef } from "react";
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
  const [errors, setErrors] = useState({});

  // Refs for accessibility
  const modalRef = useRef(null);
  const closeButtonRef = useRef(null);
  const firstInputRef = useRef(null);
  const successAnnouncementRef = useRef(null);
  const errorAnnouncementRef = useRef(null);

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

  // ---------------------- Accessibility Effects ----------------------
  useEffect(() => {
    // Handle Escape key
    const handleEscape = (e) => {
      if (e.key === 'Escape' && !loading) {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    
    // Focus trap
    const handleFocusTrap = (e) => {
      if (!modalRef.current) return;

      const focusableElements = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    modalRef.current?.addEventListener('keydown', handleFocusTrap);

    // Focus the first input when modal opens
    if (firstInputRef.current) {
      setTimeout(() => {
        firstInputRef.current.focus();
      }, 100);
    }

    // Hide background content from screen readers
    const mainContent = document.querySelector('main');
    if (mainContent) {
      mainContent.setAttribute('aria-hidden', 'true');
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      modalRef.current?.removeEventListener('keydown', handleFocusTrap);
      
      // Restore background content accessibility
      const mainContent = document.querySelector('main');
      if (mainContent) {
        mainContent.removeAttribute('aria-hidden');
      }
    };
  }, []);

  // ---------------------- Validation ----------------------
  const validateForm = () => {
    const newErrors = {};

    if (!amountToPay || amountToPay <= 0 || amountToPay > currentBill.amountDue) {
      newErrors.amountToPay = `Enter a valid amount between ₦1 and ₦${currentBill.amountDue.toFixed(2)}`;
    }

    if (method === "card") {
      if (!cardNumber.replace(/\s/g, '').match(/^\d{16}$/)) {
        newErrors.cardNumber = "Please enter a valid 16-digit card number";
      }
      if (!cvv.match(/^\d{3,4}$/)) {
        newErrors.cvv = "Please enter a valid CVV (3 or 4 digits)";
      }
      if (!exp) {
        newErrors.exp = "Please select expiry date";
      }
    }

    if (method === "bank") {
      if (!bankName) {
        newErrors.bankName = "Please select a bank";
      }
      if (!accountNumber.match(/^\d{10}$/)) {
        newErrors.accountNumber = "Please enter a valid 10-digit account number";
      }
    }

    if (method === "opay" && !opayValid) {
      newErrors.opayNumber = "Please enter a valid 10-digit Opay number";
    }

    if (method === "ussd" && !ussdCode.match(/^\*.*\*.*\#$/)) {
      newErrors.ussdCode = "Please enter a valid USSD code format (e.g., *737*2*Amount#)";
    }

    setErrors(newErrors);
    
    if (Object.keys(newErrors).length > 0) {
      // Announce errors to screen readers
      if (errorAnnouncementRef.current) {
        errorAnnouncementRef.current.textContent = "Please fix the form errors before submitting";
      }
    }
    
    return Object.keys(newErrors).length === 0;
  };

  // ---------------------- Handlers ----------------------
  const handleCardChange = (e) => {
    let val = e.target.value.replace(/\D/g, "");
    val = val.match(/.{1,4}/g)?.join(" ") || val;
    setCardNumber(val);
    if (errors.cardNumber) setErrors(prev => ({ ...prev, cardNumber: "" }));
  };

  const handleCvvChange = (e) => {
    setCvv(e.target.value.replace(/\D/g, ""));
    if (errors.cvv) setErrors(prev => ({ ...prev, cvv: "" }));
  };

  const handleOpayChange = (e) => {
    const val = e.target.value.replace(/\D/g, "");
    setOpayNumber(val);
    setOpayValid(/^\d{10}$/.test(val));
    if (errors.opayNumber) setErrors(prev => ({ ...prev, opayNumber: "" }));
  };

  const handleUssdChange = (e) => {
    const val = e.target.value.startsWith("*") ? e.target.value : "*" + e.target.value;
    setUssdCode(val);
    if (errors.ussdCode) setErrors(prev => ({ ...prev, ussdCode: "" }));
  };

  const handleMethodChange = (m) => {
    setMethod(m);
    // Clear errors when switching methods
    setErrors({});
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  const handlePayment = async (e) => {
    e.preventDefault();

    if (!currentBill?.id) {
      alert("No bill selected.");
      return;
    }

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});

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
        setErrors({ submit: data.error || "Payment failed" });
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
      
      // Announce success to screen readers
      if (successAnnouncementRef.current) {
        successAnnouncementRef.current.textContent = "Payment processed successfully";
      }
      
      if (onSubmit) onSubmit(data.bill);

      setTimeout(() => {
        setSuccess(false);
        if (newAmountDue <= 0) onClose();
      }, 1800);
    } catch (error) {
      console.error(error);
      setErrors({ submit: "Server error. Payment not processed." });
    } finally {
      setLoading(false);
    }
  };

  const progressPercentage = currentBill?.totalAmount
    ? ((currentBill.totalAmount - currentBill.amountDue) / currentBill.totalAmount) * 100
    : 0;

  // ---------------------- UI ----------------------
  if (!currentBill) return <p role="status">Loading bill...</p>;

  return (
    <>
      {/* Modal Overlay */}
      <div 
        className={styles.paymentModalOverlay}
        role="presentation"
        onClick={handleClose}
        aria-hidden="true"
      />
      
      {/* Modal Dialog */}
      <div 
        ref={modalRef}
        className={styles.paymentModal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="payment-dialog-title"
        aria-describedby="payment-dialog-description"
      >
        {/* Live announcements for screen readers */}
        <div 
          ref={successAnnouncementRef}
          className="visually-hidden"
          aria-live="assertive"
          aria-atomic="true"
        />
        <div 
          ref={errorAnnouncementRef}
          className="visually-hidden"
          aria-live="assertive"
          aria-atomic="true"
        />
        
        {/* Dialog Header */}
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div>
            <h3 id="payment-dialog-title">Pay Bill #{currentBill.billNumber}</h3>
            <p id="payment-dialog-description" className="visually-hidden">
              Make a payment for your electricity bill. Current amount due: ₦{currentBill.amountDue.toFixed(2)}.
              You can pay the full amount or a partial payment.
            </p>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            className="btn-close"
            onClick={handleClose}
            aria-label="Close payment form"
            disabled={loading}
          />
        </div>

        <p><strong>Amount Due:</strong> ₦{currentBill.amountDue.toFixed(2)}</p>

        {/* Progress Bar */}
        <div className={styles.progressBarContainer} role="progressbar" aria-valuenow={progressPercentage} aria-valuemin="0" aria-valuemax="100" aria-label="Payment progress">
          <div className={styles.progressBarFill} style={{ width: `${progressPercentage}%` }} />
        </div>
        <small>
          Paid: ₦{(currentBill.totalAmount - currentBill.amountDue).toFixed(2)} / ₦{currentBill.totalAmount.toFixed(2)}
        </small>

        {/* Amount to Pay */}
        <div className="mt-3">
          <label htmlFor="amountToPay" className="form-label">
            Amount to Pay (₦)
            <span className="text-danger"> *</span>
          </label>
          <div className="input-group">
            <span className="input-group-text">₦</span>
            <input
              ref={firstInputRef}
              id="amountToPay"
              type="number"
              className={`form-control ${errors.amountToPay ? 'is-invalid' : ''}`}
              value={amountToPay}
              onChange={(e) => {
                setAmountToPay(Number(e.target.value));
                if (errors.amountToPay) setErrors(prev => ({ ...prev, amountToPay: "" }));
              }}
              min={1}
              max={currentBill.amountDue}
              step="0.01"
              required
              disabled={loading}
              aria-required="true"
              aria-describedby={errors.amountToPay ? "amountError" : "amountHelp"}
              aria-invalid={!!errors.amountToPay}
            />
          </div>
          {errors.amountToPay ? (
            <div id="amountError" className="invalid-feedback" role="alert">
              {errors.amountToPay}
            </div>
          ) : (
            <div id="amountHelp" className="form-text">
              You can pay partially. Max: ₦{currentBill.amountDue.toFixed(2)}
            </div>
          )}
        </div>

        {/* Payment Method Selection */}
        <fieldset className="mt-3">
          <legend className="form-label">
            Payment Method
            <span className="text-danger"> *</span>
          </legend>
          <div className={styles.methodGrid}>
            {[
              { value: "card", label: "💳 Card", ariaLabel: "Credit or debit card payment" },
              { value: "bank", label: "🏦 Bank Transfer", ariaLabel: "Bank transfer payment" },
              { value: "opay", label: "🟩 Opay", ariaLabel: "Opay mobile money payment" },
              { value: "ussd", label: "#️⃣ USSD", ariaLabel: "USSD code payment" }
            ].map((m) => (
              <button
                key={m.value}
                type="button"
                className={`${styles.methodCard} ${method === m.value ? styles.active : ''}`}
                onClick={() => handleMethodChange(m.value)}
                disabled={loading}
                aria-label={m.ariaLabel}
                aria-pressed={method === m.value}
              >
                {m.label}
              </button>
            ))}
          </div>
        </fieldset>

        <form onSubmit={handlePayment} noValidate>
          {/* Card Payment Fields */}
          {method === "card" && (
            <div className="mt-3" role="group" aria-labelledby="card-details-heading">
              <h4 id="card-details-heading" className="h6">Card Details</h4>
              
              <div className="mb-3">
                <label htmlFor="cardNumber" className="form-label">
                  Card Number
                  <span className="text-danger"> *</span>
                </label>
                <input
                  id="cardNumber"
                  type="text"
                  className={`form-control ${errors.cardNumber ? 'is-invalid' : ''}`}
                  value={cardNumber}
                  onChange={handleCardChange}
                  maxLength={19}
                  placeholder="1234 5678 9012 3456"
                  required
                  disabled={loading}
                  aria-required="true"
                  aria-describedby={errors.cardNumber ? "cardNumberError" : "cardNumberHelp"}
                  aria-invalid={!!errors.cardNumber}
                />
                {errors.cardNumber ? (
                  <div id="cardNumberError" className="invalid-feedback" role="alert">
                    {errors.cardNumber}
                  </div>
                ) : (
                  <div id="cardNumberHelp" className="form-text">
                    Enter 16-digit card number without spaces
                  </div>
                )}
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label htmlFor="cvv" className="form-label">
                    CVV
                    <span className="text-danger"> *</span>
                  </label>
                  <input
                    id="cvv"
                    type="password"
                    className={`form-control ${errors.cvv ? 'is-invalid' : ''}`}
                    value={cvv}
                    onChange={handleCvvChange}
                    maxLength={4}
                    placeholder="123"
                    required
                    disabled={loading}
                    aria-required="true"
                    aria-describedby={errors.cvv ? "cvvError" : "cvvHelp"}
                    aria-invalid={!!errors.cvv}
                  />
                  {errors.cvv ? (
                    <div id="cvvError" className="invalid-feedback" role="alert">
                      {errors.cvv}
                    </div>
                  ) : (
                    <div id="cvvHelp" className="form-text">
                      3 or 4 digits on back of card
                    </div>
                  )}
                </div>
                <div className="col-md-6 mb-3">
                  <label htmlFor="exp" className="form-label">
                    Expiry Date
                    <span className="text-danger"> *</span>
                  </label>
                  <input
                    id="exp"
                    type="month"
                    className={`form-control ${errors.exp ? 'is-invalid' : ''}`}
                    value={exp}
                    onChange={(e) => {
                      setExp(e.target.value);
                      if (errors.exp) setErrors(prev => ({ ...prev, exp: "" }));
                    }}
                    required
                    disabled={loading}
                    aria-required="true"
                    aria-describedby={errors.exp ? "expError" : "expHelp"}
                    aria-invalid={!!errors.exp}
                  />
                  {errors.exp ? (
                    <div id="expError" className="invalid-feedback" role="alert">
                      {errors.exp}
                    </div>
                  ) : (
                    <div id="expHelp" className="form-text">
                      Month and year (e.g., 2025-12)
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Bank Payment Fields */}
          {method === "bank" && (
            <div className="mt-3" role="group" aria-labelledby="bank-details-heading">
              <h4 id="bank-details-heading" className="h6">Bank Transfer Details</h4>
              
              <div className="mb-3">
                <label htmlFor="bankName" className="form-label">
                  Bank Name
                  <span className="text-danger"> *</span>
                </label>
                <select
                  id="bankName"
                  className={`form-select ${errors.bankName ? 'is-invalid' : ''}`}
                  value={bankName}
                  onChange={(e) => {
                    setBankName(e.target.value);
                    if (errors.bankName) setErrors(prev => ({ ...prev, bankName: "" }));
                  }}
                  required
                  disabled={loading}
                  aria-required="true"
                  aria-describedby={errors.bankName ? "bankNameError" : undefined}
                  aria-invalid={!!errors.bankName}
                >
                  <option value="">Select Bank</option>
                  <option value="GTBank">GTBank</option>
                  <option value="First Bank">First Bank</option>
                  <option value="Access Bank">Access Bank</option>
                  <option value="Zenith Bank">Zenith Bank</option>
                </select>
                {errors.bankName && (
                  <div id="bankNameError" className="invalid-feedback" role="alert">
                    {errors.bankName}
                  </div>
                )}
              </div>

              <div className="mb-3">
                <label htmlFor="accountNumber" className="form-label">
                  Account Number
                  <span className="text-danger"> *</span>
                </label>
                <input
                  id="accountNumber"
                  type="text"
                  className={`form-control ${errors.accountNumber ? 'is-invalid' : ''}`}
                  value={accountNumber}
                  onChange={(e) => {
                    setAccountNumber(e.target.value);
                    if (errors.accountNumber) setErrors(prev => ({ ...prev, accountNumber: "" }));
                  }}
                  maxLength={10}
                  placeholder="1234567890"
                  required
                  disabled={loading}
                  aria-required="true"
                  aria-describedby={errors.accountNumber ? "accountNumberError" : "accountNumberHelp"}
                  aria-invalid={!!errors.accountNumber}
                />
                {errors.accountNumber ? (
                  <div id="accountNumberError" className="invalid-feedback" role="alert">
                    {errors.accountNumber}
                  </div>
                ) : (
                  <div id="accountNumberHelp" className="form-text">
                    10-digit account number
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Opay Payment Fields */}
          {method === "opay" && (
            <div className="mt-3" role="group" aria-labelledby="opay-details-heading">
              <h4 id="opay-details-heading" className="h6">Opay Details</h4>
              
              <div className="mb-3">
                <label htmlFor="opayNumber" className="form-label">
                  Opay Number
                  <span className="text-danger"> *</span>
                </label>
                <input
                  id="opayNumber"
                  type="text"
                  className={`form-control ${errors.opayNumber ? 'is-invalid' : ''}`}
                  value={opayNumber}
                  onChange={handleOpayChange}
                  maxLength={10}
                  placeholder="0801234567"
                  required
                  disabled={loading}
                  aria-required="true"
                  aria-describedby={errors.opayNumber ? "opayNumberError" : "opayNumberHelp"}
                  aria-invalid={!!errors.opayNumber || !opayValid}
                />
                {errors.opayNumber ? (
                  <div id="opayNumberError" className="invalid-feedback" role="alert">
                    {errors.opayNumber}
                  </div>
                ) : !opayValid ? (
                  <div className="text-danger" role="alert">
                    Please enter a valid 10-digit Opay number
                  </div>
                ) : (
                  <div id="opayNumberHelp" className="form-text">
                    10-digit mobile number
                  </div>
                )}
              </div>
            </div>
          )}

          {/* USSD Payment Fields */}
          {method === "ussd" && (
            <div className="mt-3" role="group" aria-labelledby="ussd-details-heading">
              <h4 id="ussd-details-heading" className="h6">USSD Code</h4>
              
              <div className="mb-3">
                <label htmlFor="ussdCode" className="form-label">
                  USSD Code
                  <span className="text-danger"> *</span>
                </label>
                <input
                  id="ussdCode"
                  type="text"
                  className={`form-control ${errors.ussdCode ? 'is-invalid' : ''}`}
                  value={ussdCode}
                  onChange={handleUssdChange}
                  placeholder="*737*2*Amount#"
                  required
                  disabled={loading}
                  aria-required="true"
                  aria-describedby={errors.ussdCode ? "ussdCodeError" : "ussdCodeHelp"}
                  aria-invalid={!!errors.ussdCode}
                />
                {errors.ussdCode ? (
                  <div id="ussdCodeError" className="invalid-feedback" role="alert">
                    {errors.ussdCode}
                  </div>
                ) : (
                  <div id="ussdCodeHelp" className="form-text">
                    Format: *737*2*Amount# (e.g., *737*2*5000#)
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Submit Error */}
          {errors.submit && (
            <div className="alert alert-danger mt-3" role="alert" aria-live="assertive">
              <i className="bi bi-exclamation-triangle-fill me-2" aria-hidden="true"></i>
              {errors.submit}
            </div>
          )}

          {/* Form Actions */}
          <div className="d-flex justify-content-between mt-4">
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={handleClose} 
              disabled={loading}
              aria-label="Cancel payment"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={loading}
              aria-busy={loading}
              aria-label={loading ? "Processing payment" : `Pay ₦${amountToPay.toFixed(2)}`}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Processing...
                </>
              ) : (
                `Pay ₦${amountToPay.toFixed(2)}`
              )}
            </button>
          </div>
        </form>

        {success && (
          <div 
            className={styles.successOverlay}
            role="alert"
            aria-live="assertive"
            aria-atomic="true"
          >
            <div className={styles.checkmark} aria-hidden="true">✔</div>
            <p>Payment Successful!</p>
          </div>
        )}
      </div>
    </>
  );
}