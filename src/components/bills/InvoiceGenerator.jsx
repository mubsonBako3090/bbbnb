'use client';

import { useState } from 'react';
import styles from '@/styles/components/InvoiceGenerator.module.css';

export default function InvoiceGenerator({ bill, onClose, onDownload }) {
  const [format, setFormat] = useState('pdf');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      await onDownload(bill._id);
      onClose();
    } catch (error) {
      console.error('Failed to generate invoice:', error);
      alert('Failed to generate invoice');
    } finally {
      setLoading(false);
    }
  };

  if (!bill) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h5>Generate Invoice</h5>
          <button 
            type="button" 
            className="btn-close" 
            onClick={onClose}
            aria-label="Close"
          ></button>
        </div>
        
        <div className={styles.modalBody}>
          <div className="mb-4">
            <h6>Bill Information</h6>
            <div className="card">
              <div className="card-body">
                <p><strong>Bill #:</strong> {bill.billNumber}</p>
                <p><strong>Amount:</strong> ₦{bill.totalAmount?.toFixed(2)}</p>
                <p><strong>Status:</strong> {bill.status}</p>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <h6>Invoice Format</h6>
            <div className="btn-group w-100" role="group">
              <button
                type="button"
                className={`btn ${format === 'pdf' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setFormat('pdf')}
              >
                <i className="bi bi-file-pdf me-2"></i> PDF
              </button>
              <button
                type="button"
                className={`btn ${format === 'html' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setFormat('html')}
              >
                <i className="bi bi-file-earmark-text me-2"></i> HTML
              </button>
              <button
                type="button"
                className={`btn ${format === 'print' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setFormat('print')}
              >
                <i className="bi bi-printer me-2"></i> Print
              </button>
            </div>
          </div>

          <div className="mb-4">
            <h6>Options</h6>
            <div className="form-check mb-2">
              <input 
                className="form-check-input" 
                type="checkbox" 
                id="includeDetails"
                defaultChecked
              />
              <label className="form-check-label" htmlFor="includeDetails">
                Include detailed charges
              </label>
            </div>
            <div className="form-check mb-2">
              <input 
                className="form-check-input" 
                type="checkbox" 
                id="includePaymentInstructions"
                defaultChecked
              />
              <label className="form-check-label" htmlFor="includePaymentInstructions">
                Include payment instructions
              </label>
            </div>
            <div className="form-check">
              <input 
                className="form-check-input" 
                type="checkbox" 
                id="watermark"
              />
              <label className="form-check-label" htmlFor="watermark">
                Add "Copy" watermark
              </label>
            </div>
          </div>
        </div>

        <div className={styles.modalFooter}>
          <button 
            type="button" 
            className="btn btn-secondary" 
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button 
            type="button" 
            className="btn btn-primary"
            onClick={handleGenerate}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Generating...
              </>
            ) : (
              <>
                <i className="bi bi-download me-2"></i>
                {format === 'print' ? 'Print Invoice' : `Download ${format.toUpperCase()}`}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}