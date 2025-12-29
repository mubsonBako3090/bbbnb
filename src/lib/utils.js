// Format currency
export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

// Format date
export function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

// Format date with time
export function formatDateTime(date) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}
// 
export function generateAccountNumber() {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.random().toString(36).substr(2, 4).toUpperCase();
  return `ACC${timestamp}${random}`;
}

// Calculate due date (30 days from now)
export function calculateDueDate(fromDate = new Date()) {
  const dueDate = new Date(fromDate);
  dueDate.setDate(dueDate.getDate() + 30);
  return dueDate;
}

// Validate email
export function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// Validate phone number
export function validatePhone(phone) {
  const re = /^\+?[\d\s-()]{10,}$/;
  return re.test(phone);
}

// Calculate energy cost
export function calculateEnergyCost(usage, rate = 0.15) {
  return parseFloat((usage * rate).toFixed(2));
}

// Generate random meter number
export function generateMeterNumber() {
  return 'MTR' + Math.random().toString(36).substr(2, 8).toUpperCase();
}

// Sanitize user input
export function sanitizeInput(input) {
  if (typeof input !== 'string') return input;
  return input.trim().replace(/[<>]/g, '');
}

// Generate bill number
export function generateBillNumber() {
  const date = new Date();
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const random = Math.random().toString(36).substr(2, 6).toUpperCase();
  return `BL${year}${month}${random}`;
}

// Calculate days between dates
export function daysBetween(date1, date2) {
  const oneDay = 24 * 60 * 60 * 1000;
  const firstDate = new Date(date1);
  const secondDate = new Date(date2);
  return Math.round(Math.abs((firstDate - secondDate) / oneDay));
}

// Error handler
export function handleError(error) {
  console.error('Database Error:', error);
  
  if (error.name === 'ValidationError') {
    const errors = Object.values(error.errors).map(err => err.message);
    return { error: 'Validation failed', details: errors };
  }
  
  if (error.code === 11000) {
    const field = Object.keys(error.keyPattern)[0];
    return `{ error: ${field} already exists }`;
  }
  
  if (error.name === 'CastError') {
    return { error: 'Invalid ID format' };
  }
  
  return { error: 'Internal server error. Please try again.' };
}

// Success response formatter
export function successResponse(data, message = 'Success') {
  return {
    success: true,
    message,
    data
  };
}

// Error response formatter
export function errorResponse(message, details = null) {
  return {
    success: false,
    error: message,
    details
  };
}