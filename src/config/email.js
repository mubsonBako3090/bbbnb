export const EMAIL_HOST = process.env.EMAIL_HOST || 'smtp.gmail.com';
export const EMAIL_PORT = process.env.EMAIL_PORT ? Number(process.env.EMAIL_PORT) : 465;
export const EMAIL_USER = process.env.EMAIL_USER || 'youremail@gmail.com';
export const EMAIL_PASS = process.env.EMAIL_PASS || 'yourapppassword';
