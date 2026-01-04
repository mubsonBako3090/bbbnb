import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

/**
 * Generate PDF invoice for a bill
 * @param {Object} bill - Bill document
 * @param {Object} options - PDF options
 * @returns {Promise<Buffer>} - PDF buffer
 */
export async function generateInvoicePDF(bill, options = {}) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50,
        info: {
          Title: `Invoice ${bill.invoiceNumber}`,
          Author: 'Electric Utility Company',
          Subject: 'Electricity Bill',
        },
      });

      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });

      // Add company header
      doc.fontSize(20)
         .font('Helvetica-Bold')
         .text('ELECTRIC UTILITY COMPANY', { align: 'center' });
      
      doc.moveDown(0.5);
      doc.fontSize(10)
         .font('Helvetica')
         .text('123 Power Street, Energy City', { align: 'center' })
         .text('Phone: (01) 234-5678 | Email: billing@utility.com', { align: 'center' })
         .text('Website: www.utility.com', { align: 'center' });
      
      doc.moveDown(1);
      doc.moveTo(50, doc.y)
         .lineTo(550, doc.y)
         .stroke();
      doc.moveDown(1);

      // Invoice header
      doc.fontSize(24)
         .font('Helvetica-Bold')
         .text('INVOICE', { align: 'right' });
      
      doc.fontSize(12)
         .font('Helvetica')
         .text(`Invoice #: ${bill.invoiceNumber}`, { align: 'right' })
         .text(`Bill #: ${bill.billNumber}`, { align: 'right' })
         .text(`Date: ${new Date(bill.issueDate).toLocaleDateString()}`, { align: 'right' })
         .text(`Due Date: ${new Date(bill.dueDate).toLocaleDateString()}`, { align: 'right' });

      doc.moveDown(2);

      // Customer and Company info side by side
      const startY = doc.y;
      
      // Bill To
      doc.fontSize(12)
         .font('Helvetica-Bold')
         .text('BILL TO:', 50, startY);
      
      doc.fontSize(10)
         .font('Helvetica')
         .text(bill.customerName, 50, startY + 20)
         .text(bill.serviceAddress, 50, startY + 35)
         .text(`Account #: ${bill.accountNumber}`, 50, startY + 50)
         .text(`Meter #: ${bill.meterNumber}`, 50, startY + 65);

      // Billing Period
      doc.fontSize(12)
         .font('Helvetica-Bold')
         .text('BILLING PERIOD:', 300, startY);
      
      doc.fontSize(10)
         .font('Helvetica')
         .text(`${new Date(bill.billingPeriod.start).toLocaleDateString()} to ${new Date(bill.billingPeriod.end).toLocaleDateString()}`, 300, startY + 20);

      doc.moveDown(4);

      // Usage Summary
      doc.fontSize(14)
         .font('Helvetica-Bold')
         .text('USAGE SUMMARY');
      
      doc.moveDown(0.5);
      
      const usageY = doc.y;
      doc.fontSize(10)
         .font('Helvetica')
         .text('Previous Reading:', 50, usageY)
         .text(`${bill.meterReading.previous} kWh`, 200, usageY)
         
         .text('Current Reading:', 50, usageY + 20)
         .text(`${bill.meterReading.current} kWh`, 200, usageY + 20)
         
         .text('Consumption:', 50, usageY + 40)
         .text(`${bill.meterReading.consumption} kWh`, 200, usageY + 40)
         
         .text('Billing Days:', 50, usageY + 60)
         .text(`${Math.ceil((bill.billingPeriod.end - bill.billingPeriod.start) / (1000 * 60 * 60 * 24))} days`, 200, usageY + 60);

      doc.moveDown(5);

      // Charges Table
      doc.fontSize(14)
         .font('Helvetica-Bold')
         .text('CHARGES DETAIL');
      
      doc.moveDown(0.5);

      // Table Header
      const tableTop = doc.y;
      doc.fontSize(10)
         .font('Helvetica-Bold')
         .text('Description', 50, tableTop)
         .text('Units', 250, tableTop)
         .text('Rate (₦)', 320, tableTop)
         .text('Amount (₦)', 400, tableTop, { width: 150, align: 'right' });

      doc.moveTo(50, tableTop + 15)
         .lineTo(550, tableTop + 15)
         .stroke();

      // Table Rows
      let currentY = tableTop + 25;
      
      bill.charges.forEach((charge, index) => {
        doc.fontSize(10)
           .font('Helvetica')
           .text(charge.description, 50, currentY)
           .text(charge.units ? `${charge.units} ${charge.type === 'energy' ? 'kWh' : ''}` : '-', 250, currentY)
           .text(charge.rate ? `₦${charge.rate.toFixed(2)}` : '-', 320, currentY)
           .text(`₦${charge.amount.toFixed(2)}`, 400, currentY, { width: 150, align: 'right' });
        
        currentY += 20;
      });

      // Previous Balance
      if (bill.previousBalance > 0) {
        doc.fontSize(10)
           .font('Helvetica')
           .text('Previous Balance', 50, currentY)
           .text(`₦${bill.previousBalance.toFixed(2)}`, 400, currentY, { width: 150, align: 'right' });
        currentY += 20;
      }

      // Separator line
      doc.moveTo(300, currentY)
         .lineTo(550, currentY)
         .stroke();
      
      currentY += 10;

      // Totals
      doc.fontSize(11)
         .font('Helvetica-Bold')
         .text('Subtotal:', 300, currentY)
         .text(`₦${bill.subtotal.toFixed(2)}`, 400, currentY, { width: 150, align: 'right' });
      
      currentY += 20;
      
      doc.fontSize(11)
         .font('Helvetica')
         .text(`VAT (${(bill.taxRate * 100)}%):`, 300, currentY)
         .text(`₦${bill.taxAmount.toFixed(2)}`, 400, currentY, { width: 150, align: 'right' });
      
      currentY += 20;
      
      doc.fontSize(12)
         .font('Helvetica-Bold')
         .text('TOTAL:', 300, currentY)
         .text(`₦${bill.totalAmount.toFixed(2)}`, 400, currentY, { width: 150, align: 'right' });

      currentY += 30;

      // Amount Due
      doc.fontSize(14)
         .font('Helvetica-Bold')
         .fillColor('#d9534f')
         .text('AMOUNT DUE:', 300, currentY)
         .text(`₦${bill.amountDue.toFixed(2)}`, 400, currentY, { width: 150, align: 'right' })
         .fillColor('#000000');

      doc.moveDown(3);

      // Payment Instructions
      doc.fontSize(11)
         .font('Helvetica-Bold')
         .text('PAYMENT INSTRUCTIONS:');
      
      doc.fontSize(10)
         .font('Helvetica')
         .text('1. Online Payment: Login to your customer portal at portal.utility.com')
         .text('2. Bank Transfer: Account: 1234567890, Bank: Utility Bank, Name: Electric Utility Co.')
         .text('3. USSD: Dial *737*50*Amount*AccountNumber#')
         .text('4. In Person: Visit any of our offices with your bill number')
         .text('5. Auto-Debit: Set up automatic payments from your bank account');

      doc.moveDown(2);

      // Notes
      doc.fontSize(9)
         .font('Helvetica-Oblique')
         .text('Please pay before the due date to avoid disconnection and late fees.', { align: 'center' })
         .text('For any questions, contact our billing department at billing@utility.com or call (01) 234-5678.', { align: 'center' });

      // Footer
      const footerY = 750;
      doc.fontSize(8)
         .font('Helvetica')
         .text('Thank you for choosing Electric Utility Company', 50, footerY, { align: 'center', width: 500 })
         .text('This is an electronically generated invoice, no signature required.', 50, footerY + 15, { align: 'center', width: 500 });

      doc.end();

    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Generate invoice HTML for email
 * @param {Object} bill - Bill document
 * @returns {String} - HTML string
 */
export function generateInvoiceHTML(bill) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .invoice { max-width: 800px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #4a6fa5; padding-bottom: 20px; }
        .company-name { font-size: 24px; font-weight: bold; color: #4a6fa5; }
        .invoice-title { font-size: 28px; margin: 20px 0; }
        .details { display: flex; justify-content: space-between; margin-bottom: 30px; }
        .section { margin-bottom: 20px; }
        .section-title { font-weight: bold; margin-bottom: 10px; color: #4a6fa5; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background-color: #f8f9fa; font-weight: bold; }
        .total-row { font-weight: bold; background-color: #f8f9fa; }
        .amount-due { color: #d9534f; font-size: 18px; font-weight: bold; }
        .payment-info { background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin-top: 30px; }
        .footer { text-align: center; margin-top: 40px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="invoice">
        <div class="header">
          <div class="company-name">ELECTRIC UTILITY COMPANY</div>
          <div>123 Power Street, Energy City</div>
          <div>Phone: (01) 234-5678 | Email: billing@utility.com</div>
        </div>
        
        <div class="invoice-title">INVOICE</div>
        
        <div class="details">
          <div>
            <div class="section">
              <div class="section-title">BILL TO:</div>
              <div>${bill.customerName}</div>
              <div>${bill.serviceAddress}</div>
              <div>Account #: ${bill.accountNumber}</div>
              <div>Meter #: ${bill.meterNumber}</div>
            </div>
          </div>
          
          <div>
            <div class="section">
              <div class="section-title">INVOICE DETAILS:</div>
              <div>Invoice #: ${bill.invoiceNumber}</div>
              <div>Bill #: ${bill.billNumber}</div>
              <div>Date: ${new Date(bill.issueDate).toLocaleDateString()}</div>
              <div>Due Date: ${new Date(bill.dueDate).toLocaleDateString()}</div>
            </div>
          </div>
        </div>
        
        <div class="section">
          <div class="section-title">BILLING PERIOD:</div>
          <div>${new Date(bill.billingPeriod.start).toLocaleDateString()} to ${new Date(bill.billingPeriod.end).toLocaleDateString()}</div>
        </div>
        
        <div class="section">
          <div class="section-title">USAGE SUMMARY:</div>
          <div>Previous Reading: ${bill.meterReading.previous} kWh</div>
          <div>Current Reading: ${bill.meterReading.current} kWh</div>
          <div>Consumption: ${bill.meterReading.consumption} kWh</div>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>Description</th>
              <th>Units</th>
              <th>Rate (₦)</th>
              <th>Amount (₦)</th>
            </tr>
          </thead>
          <tbody>
            ${bill.charges.map(charge => `
              <tr>
                <td>${charge.description}</td>
                <td>${charge.units ? `${charge.units} ${charge.type === 'energy' ? 'kWh' : ''}` : '-'}</td>
                <td>${charge.rate ? `₦${charge.rate.toFixed(2)}` : '-'}</td>
                <td>₦${charge.amount.toFixed(2)}</td>
              </tr>
            `).join('')}
            ${bill.previousBalance > 0 ? `
              <tr>
                <td colspan="3">Previous Balance</td>
                <td>₦${bill.previousBalance.toFixed(2)}</td>
              </tr>
            ` : ''}
            <tr class="total-row">
              <td colspan="3">Subtotal</td>
              <td>₦${bill.subtotal.toFixed(2)}</td>
            </tr>
            <tr class="total-row">
              <td colspan="3">VAT (${(bill.taxRate * 100)}%)</td>
              <td>₦${bill.taxAmount.toFixed(2)}</td>
            </tr>
            <tr class="total-row">
              <td colspan="3">TOTAL</td>
              <td>₦${bill.totalAmount.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
        
        <div class="amount-due">
          AMOUNT DUE: ₦${bill.amountDue.toFixed(2)}
        </div>
        
        <div class="payment-info">
          <div class="section-title">PAYMENT INSTRUCTIONS:</div>
          <ol>
            <li>Online Payment: Login to your customer portal</li>
            <li>Bank Transfer: Account: 1234567890, Bank: Utility Bank</li>
            <li>USSD: Dial *737*50*Amount*AccountNumber#</li>
            <li>In Person: Visit any of our offices</li>
            <li>Auto-Debit: Set up automatic payments</li>
          </ol>
        </div>
        
        <div class="footer">
          <p>Please pay before the due date to avoid disconnection and late fees.</p>
          <p>For any questions, contact our billing department at billing@utility.com</p>
          <p>This is an electronically generated invoice, no signature required.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}