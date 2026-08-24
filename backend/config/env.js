import dotenv from 'dotenv';

dotenv.config();

const parseList = (value, fallback = []) => {
  if (!value) return fallback;
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
};

const parseNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseNumber(process.env.PORT, 5000),
  mongoUri: (process.env.MONGO_URI || process.env.MONGODB_URI || '').trim(),
  frontendUrl: process.env.FRONTEND_URL || process.env.CLIENT_URL || 'http://localhost:5173',
  corsOrigin: parseList(process.env.CORS_ORIGIN || process.env.CLIENT_URL || process.env.FRONTEND_URL || 'http://localhost:5173', ['http://localhost:5173']),
  corsMethods: parseList(process.env.CORS_METHODS || 'GET,POST,PUT,PATCH,DELETE,OPTIONS', ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']),
  corsCredentials: process.env.CORS_CREDENTIALS !== 'false',
  jwtSecret: process.env.JWT_SECRET || '',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || '',
  accessTokenExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  refreshTokenExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  cookieSameSite: process.env.COOKIE_SAMESITE || 'strict',
  appName: process.env.APP_NAME || 'Salon App',
  emailHost: process.env.EMAIL_HOST || '',
  emailPort: parseNumber(process.env.EMAIL_PORT, 587),
  emailUser: process.env.EMAIL_USER || '',
  emailPass: process.env.EMAIL_PASS || '',
  emailFromName: process.env.EMAIL_FROM_NAME || 'Salon App',
  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY || '',
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET || '',
  stripeSecretKey: process.env.STRIPE_SECRET_KEY || '',
  stripeCurrency: process.env.STRIPE_CURRENCY || 'inr',
  paymentMode: process.env.PAYMENT_MODE || 'test',
  defaultAppointmentName: process.env.DEFAULT_APPOINTMENT_NAME || 'Salon appointment',
  theMuseApiUrl: process.env.THE_MUSE_API_URL || 'https://www.themuse.com/api/public/jobs',
  externalJobCategory: process.env.EXTERNAL_JOB_CATEGORY || 'Personal Care and Services',
  externalJobKeywords: parseList(
    process.env.EXTERNAL_JOB_KEYWORDS || 'barber,hair,salon,beauty,stylist,cosmetology,cosmetologist,esthetician,aesthetician,spa',
    ['barber', 'hair', 'salon', 'beauty', 'stylist', 'cosmetology', 'cosmetologist', 'esthetician', 'aesthetician', 'spa']
  ),
  theMuseTimeoutMs: parseNumber(process.env.THE_MUSE_TIMEOUT_MS, 5000),
  mockJobBaseUrl: process.env.MOCK_JOB_BASE_URL || 'https://jobs.local',
};

export default env;
