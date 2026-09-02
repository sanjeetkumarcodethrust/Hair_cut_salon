import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';

import morgan from 'morgan';
import { createServer } from 'http';
import { Server } from 'socket.io';
import connectDB from './config/db.js';
import env from './config/env.js';
import authRoutes from './routes/authRoutes.js';
import salonRoutes from './routes/salonRoutes.js';
import barberRoutes from './routes/barberRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import favoriteRoutes from './routes/favoriteRoutes.js';
import jobRoutes from './routes/jobRoutes.js';
import applicationRoutes from './routes/applicationRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import { notFound, errorHandler } from './middlewares/errorMiddleware.js';
import startReminderJob from './jobs/reminderJob.js';
import { isDatabaseConnected } from './config/db.js';
const app = express();
const httpServer = createServer(app);
const normalizeOrigin = (value) => {
  if (!value) return '';
  try {
    return new URL(value).origin;
  } catch {
    return String(value).trim().replace(/\/+$/, '');
  }
};

const allowedOrigins = new Set(
  [
    ...(env.corsOrigin || []),
    env.frontendUrl,
    'https://hairbar.vercel.app',
  ]
    .map(normalizeOrigin)
    .filter(Boolean)
);

const isAllowedOrigin = (origin) => {
  if (!origin) return true;
  if (allowedOrigins.has('*') || (env.corsOrigin && env.corsOrigin.includes('*'))) return true;
  const normalizedOrigin = normalizeOrigin(origin);
  if (allowedOrigins.has(normalizedOrigin)) return true;
  try {
    const { hostname } = new URL(normalizedOrigin);
    return (
      hostname.endsWith('.vercel.app') ||
      hostname.endsWith('.onrender.com') ||
      hostname === 'localhost' ||
      hostname === '127.0.0.1'
    );
  } catch {
    return false;
  }
};

const corsOptions = {
  origin: (origin, callback) => {
    if (isAllowedOrigin(origin)) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  },
  credentials: env.corsCredentials,
  methods: env.corsMethods,
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'Access-Control-Request-Method',
    'Access-Control-Request-Headers',
  ],
  exposedHeaders: ['Set-Cookie'],
  maxAge: 86400,
};

const io = new Server(httpServer, {
  cors: corsOptions,
});

// Enable CORS middleware first before helmet & route handlers
app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));

// Security & Logger Middlewares
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);
if (env.nodeEnv === 'development') {
  app.use(morgan('dev'));
}
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Basic route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  const databaseConnected = isDatabaseConnected();
  res.status(databaseConnected ? 200 : 503).json({
    success: true,
    message: databaseConnected ? 'Salon API is ready' : 'Salon API is running without database access',
    database: databaseConnected ? 'connected' : 'disconnected',
  });
});

// Avoid letting Mongoose buffer requests while the database is unavailable.
app.use('/api', (req, res, next) => {
  if (isDatabaseConnected()) {
    return next();
  }

  return res.status(503).json({
    success: false,
    message: 'Database is unavailable. Check the MongoDB connection settings.',
  });
});

// Routes

// Rate Limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // Limit each IP to 100 requests per `window`
  standardHeaders: 'draft-7', // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: { success: false, message: 'Too many requests from this IP, please try again after 15 minutes' }
});

app.use('/api', apiLimiter);

app.use('/api/auth', authRoutes);
app.use('/api/salons', salonRoutes);
app.use('/api/barbers', barberRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Centralized Error Handling — must be after all routes
app.use(notFound);
app.use(errorHandler);

// Socket.io connection
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

process.on('uncaughtException', (err) => {
  console.error('[Uncaught Exception]:', err.message || err);
});

process.on('unhandledRejection', (reason) => {
  console.error('[Unhandled Rejection]:', reason);
});

const PORT = env.port;

connectDB();
startReminderJob();

httpServer.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`[Error] Port ${PORT} is already in use by another process.`);
    console.error(`[Fix] Kill the process using port ${PORT} or specify PORT=${PORT + 1} in backend/.env.`);
  } else {
    console.error('[Error] Server failed to start:', error.message);
  }
});


const gracefulShutdown = () => {
  console.log('Received shutdown signal. Closing HTTP server...');
  httpServer.close(() => {
    console.log('HTTP server closed.');
    mongoose.connection.close(false).then(() => {
      console.log('MongoDB connection closed.');
      process.exit(0);
    });
  });
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
