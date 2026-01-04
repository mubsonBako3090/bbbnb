'use client';

import { useState } from 'react';
import styles from '@/styles/components/BillList.module.css';

export default function BillList({ bills, onPayment, onInvoice, onDownload }) {
  const [expandedBill, setExpandedBill] = useState(null);

  const toggleExpand = (billId) => {
    setExpandedBill(expandedBill === billId ? null : billId);
  };

  const formatCurrency = (amount) => {
    return `₦${parseFloat(amount || 0).toFixed(2)}`;
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'paid':
        return 'bg-success';
      case 'overdue':
        return 'bg-danger';
      case 'partially_paid':
        return 'bg-warning';
      case 'generated':
        return 'bg-info';
      default:
        return 'bg-secondary';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className={styles.billList}>
      {bills.length === 0 ? (
        <div className="text-center py-5">
          <i className="bi bi-receipt display-1 text-muted"></i>
          <h5 className="mt-3">No bills found</h5>
          <p className="text-muted">You don't have any bills yet.</p>
        </div>
      ) : (
        <div className="list-group">
          {bills.map((bill) => (
            <div 
              key={bill._id} 
              className={`list-group-item list-group-item-action ${styles.billItem}`}
            >
              <div 
                className="d-flex w-100 justify-content-between align-items-center"
                onClick={() => toggleExpand(bill._id)}
                role="button"
                tabIndex={0}
                onKeyPress={(e) => e.key === 'Enter' && toggleExpand(bill._id)}
                aria-expanded={expandedBill === bill._id}
                aria-controls={`bill-details-${bill._id}`}
              >
                <div className="d-flex align-items-center">
                  <i className={`bi bi-receipt me-3 fs-4 ${styles.billIcon}`}></i>
                  <div>
                    <h6 className="mb-1">
                      Bill #{bill.billNumber}
                      {bill.invoiceNumber && (
                        <small className="text-muted ms-2">(Inv: {bill.invoiceNumber})</small>
                      )}
                    </h6>
                    <small className="text-muted">
                      {formatDate(bill.billingPeriod?.start)} - {formatDate(bill.billingPeriod?.end)}
                    </small>
                  </div>
                </div>
                
                <div className="d-flex align-items-center">
                  <div className="text-end me-3">
                    <h6 className="mb-0">{formatCurrency(bill.totalAmount)}</h6>
                    <small className="text-muted">
                      Due: {formatCurrency(bill.amountDue)}
                    </small>
                  </div>
                  <span className={`badge ${getStatusBadgeClass(bill.status)} me-3`}>
                    {bill.status}
                  </span>
                  <i 
                    className={`bi bi-chevron-${expandedBill === bill._id ? 'up' : 'down'} ${styles.expandIcon}`}
                    aria-hidden="true"
                  ></i>
                </div>
              </div>
              
              {expandedBill === bill._id && (
                <div id={`bill-details-${bill._id}`} className="mt-3">
                  <div className="row">
                    <div className="col-md-6">
                      <h6>Bill Details</h6>
                      <table className="table table-sm">
                        <tbody>
                          <tr>
                            <td><strong>Issue Date:</strong></td>
                            <td>{formatDate(bill.issueDate)}</td>
                          </tr>
                          <tr>
                            <td><strong>Due Date:</strong></td>
                            <td>{formatDate(bill.dueDate)}</td>
                          </tr>
                          <tr>
                            <td><strong>Total Amount:</strong></td>
                            <td>{formatCurrency(bill.totalAmount)}</td>
                          </tr>
                          <tr>
                            <td><strong>Amount Due:</strong></td>
                            <td className={bill.amountDue > 0 ? 'text-danger fw-bold' : 'text-success'}>
                              {formatCurrency(bill.amountDue)}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    
                    <div className="col-md-6">
                      <h6>Usage Information</h6>
                      {bill.meterReading ? (
                        <table className="table table-sm">
                          <tbody>
                            <tr>
                              <td><strong>Previous Reading:</strong></td>
                              <td>{bill.meterReading.previous} kWh</td>
                            </tr>
                            <tr>
                              <td><strong>Current Reading:</strong></td>
                              <td>{bill.meterReading.current} kWh</td>
                            </tr>
                            <tr>
                              <td><strong>Consumption:</strong></td>
                              <td>{bill.meterReading.consumption} kWh</td>
                            </tr>
                          </tbody>
                        </table>
                      ) : (
                        <p className="text-muted">No usage data available</p>
                      )}
                    </div>
                  </div>
                  
                  {bill.charges && bill.charges.length > 0 && (
                    <div className="mt-3">
                      <h6>Charges Breakdown</h6>
                      <div className="table-responsive">
                        <table className="table table-sm">
                          <thead>
                            <tr>
                              <th>Description</th>
                              <th className="text-end">Units</th>
                              <th className="text-end">Rate</th>
                              <th className="text-end">Amount</th>
                            </tr>
                          </thead>
                          <tbody>
                            {bill.charges.map((charge, index) => (
                              <tr key={index}>
                                <td>{charge.description}</td>
                                <td className="text-end">{charge.units || '-'}</td>
                                <td className="text-end">{charge.rate ? formatCurrency(charge.rate) : '-'}</td>
                                <td className="text-end">{formatCurrency(charge.amount)}</td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot>
                            <tr>
                              <td colSpan="3" className="text-end"><strong>Total:</strong></td>
                              <td className="text-end fw-bold">{formatCurrency(bill.totalAmount)}</td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    </div>
                  )}
                  
                  <div className="d-flex justify-content-end gap-2 mt-3">
                    {bill.amountDue > 0 && (
                      <button 
                        className="btn btn-primary btn-sm"
                        onClick={() => onPayment(bill)}
                        aria-label={`Pay bill ${bill.billNumber}`}
                      >
                        <i className="bi bi-credit-card me-1"></i> Pay Now
                      </button>
                    )}
                    <button 
                      className="btn btn-outline-secondary btn-sm"
                      onClick={() => onInvoice(bill)}
                      aria-label={`Generate invoice for bill ${bill.billNumber}`}
                    >
                      <i className="bi bi-file-earmark-text me-1"></i> Invoice
                    </button>
                    <button 
                      className="btn btn-outline-info btn-sm"
                      onClick={() => onDownload(bill._id)}
                      aria-label={`Download invoice for bill ${bill.billNumber}`}
                    >
                      <i className="bi bi-download me-1"></i> Download
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}