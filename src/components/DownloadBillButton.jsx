'use client';
import { useState } from "react";
import { jsPDF } from "jspdf";

export default function DownloadBillButton({ billId }) {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
      // Fetch bill JSON from API
      const res = await fetch(`/api/bills/${billId}/download`);
      const bill = await res.json();

      if (bill.error) {
        alert(bill.error);
        setLoading(false);
        return;
      }

      // Generate PDF using jsPDF
      const doc = new jsPDF();
      doc.setFontSize(22);
      doc.text("Electric Utility Provider", 105, 20, { align: "center" });
      doc.setFontSize(12);
      doc.text(`Bill Number: ${bill.billNumber}`, 20, 40);
      doc.text(`Customer: ${bill.user.firstName} ${bill.user.lastName}`, 20, 48);
      doc.text(`Email: ${bill.user.email}`, 20, 56);
      doc.text(`Account Number: ${bill.user.accountNumber}`, 20, 64);
      doc.text(`Amount Paid: $${bill.amountDue.toFixed(2)}`, 20, 72);
      doc.text(`Status: ${bill.status.toUpperCase()}`, 20, 80);
      doc.text(
        `Payment Date: ${bill.paidAt ? new Date(bill.paidAt).toLocaleDateString() : 'N/A'}`,
        20,
        88
      );

      // Save PDF
      doc.save(`Bill_${bill.billNumber}.pdf`);
    } catch (err) {
      console.error("Download bill error:", err);
      alert("Failed to download bill PDF");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      className="btn btn-success ms-2"
    >
      {loading ? "Downloading..." : "Download Bill"}
    </button>
  );
}
