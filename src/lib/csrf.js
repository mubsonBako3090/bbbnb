import crypto from 'crypto';

export function generateCSRFToken() {
  return crypto.randomUUID();
}

export function verifyCSRFToken(request) {
  const csrfCookie = request.cookies.get('csrfToken')?.value;
  const csrfHeader = request.headers.get('x-csrf-token');

  if (!csrfCookie || !csrfHeader || csrfCookie !== csrfHeader) {
    const err = new Error('Invalid CSRF token');
    err.status = 403;
    throw err;
  }
}
