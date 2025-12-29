// utils/generateBill.js
import jsPDF from "jspdf";

export function generateBillPDF(bill, paymentData, customer = {}) {
  const doc = new jsPDF();

  // ---------- Header ----------
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("Electric Utility Provider", 105, 20, { align: "center" });

  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text("123 Main Street, City, Country", 105, 28, { align: "center" });
  doc.text("Tel: +234 800 000 0000 | Email: info@eup.com", 105, 34, { align: "center" });

  doc.setLineWidth(0.5);
  doc.line(20, 38, 190, 38); // horizontal line

  // ---------- Customer Info ----------
  doc.setFont("helvetica", "bold");
  doc.text("Customer Information", 20, 50);

  doc.setFont("helvetica", "normal");
  doc.text(`Name: ${customer.name || "N/A"}`, 20, 58);
  doc.text(`Email: ${customer.email || "N/A"}`, 20, 64);

  // ---------- Bill Info ----------
  doc.setFont("helvetica", "bold");
  doc.text("Bill Details", 20, 80);

  doc.setFont("helvetica", "normal");
  doc.text(`Bill Number: ${bill.billNumber}`, 20, 88);
  doc.text(`Amount Paid: $${Number(bill.amountDue).toFixed(2)}`, 20, 94);
  doc.text(`Payment Method: ${paymentData.method.toUpperCase()}`, 20, 100);
  doc.text(`Payment Date: ${new Date().toLocaleDateString()}`, 20, 106);

  // ---------- Payment Method Details ----------
  doc.setFont("helvetica", "bold");
  doc.text("Payment Details", 20, 120);
  doc.setFont("helvetica", "normal");

  switch (paymentData.method) {
    case "card":
      doc.text(
        `Card Number: **** **** **** ${paymentData.card.cardNumber.slice(-4)}`,
        20,
        128
      );
      break;
    case "bank":
      doc.text(`Bank: ${paymentData.bank.bankName}`, 20, 128);
      doc.text(`Account Number: ${paymentData.bank.accountNumber}`, 20, 134);
      break;
    case "opay":
      doc.text(`Opay Account: ${paymentData.opay.opayNumber}`, 20, 128);
      break;
    case "ussd":
      doc.text(`USSD Code: ${paymentData.ussd.ussdCode}`, 20, 128);
      break;
  }

  // ---------- Footer ----------
  doc.setLineWidth(0.5);
  doc.line(20, 260, 190, 260); // horizontal line
  doc.setFont("helvetica", "italic");
  doc.setFontSize(10);
  doc.text(
    "Thank you for your payment. This is a computer-generated bill and does not require a signature.",
    105,
    270,
    { align: "center" }
  );

  // ---------- Save PDF ----------
  doc.save(`Bill_${bill.billNumber}.pdf`);
}
