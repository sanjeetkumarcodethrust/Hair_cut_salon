import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import morgan from 'morgan';
import { createServer } from 'http';
import { Server } from 'socket.io';
import connectDB from './config/db.js';
import env from './config/env.js';
import authRoutes from './routes/authRoutes.js';
import salonRoutes from './routes/salonRoutes.js';
import barberRoutes from './routes/barberRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import favoriteRoutes from './routes/favoriteRoutes.js';
import jobRoutes from './routes/jobRoutes.js';
import applicationRoutes from './routes/applicationRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import { notFound, errorHandler } from './middlewares/errorMiddleware.js';
import { isDatabaseConnected } from './config/db.js';
const app = express();
const httpServer = createServer(app);
const allowedOrigins = new Set((env.corsOrigin || []).filter(Boolean));
const isAllowedOrigin = (origin) => {
  if (!origin) return true;
  if (allowedOrigins.has(origin)) return true;
  try {
    const { hostname } = new URL(origin);
    return hostname.endsWith('.vercel.app') || hostname === 'localhost' || hostname === '127.0.0.1';
  } catch {
    return false;
  }
};

const io = new Server(httpServer, {
  cors: {
    origin: env.corsOrigin,
    methods: env.corsMethods,
    credentials: env.corsCredentials,
  },
});

// Middlewares
app.use(helmet());
if (env.nodeEnv === 'development') {
  app.use(morgan('dev'));
}
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
  origin: (origin, callback) => {
    if (isAllowedOrigin(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error(`CORS not allowed for origin: ${origin}`));
  },
  credentials: env.corsCredentials,
  methods: env.corsMethods,
}));

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
app.use('/api/auth', authRoutes);
app.use('/api/salons', salonRoutes);
app.use('/api/barbers', barberRoutes);
app.use('/api/appointments', appointmentRoutes);
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

const PORT = env.port;

connectDB();

httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
