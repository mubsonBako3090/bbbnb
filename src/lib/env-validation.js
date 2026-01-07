// lib/env-validation.js
const requiredEnvVars = [
  'MONGODB_URI',
  'JWT_SECRET',
  'NEXTAUTH_SECRET',
  'PAYSTACK_SECRET_KEY'
];

export function validateEnv() {
  const missing = requiredEnvVars.filter(varName => !process.env[varName]);
  if (missing.length > 0) {
    throw new Error(`Missing environment variables: ${missing.join(', ')}`);
  }
}