import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFoundHandler';
import { healthRouter } from './routes/health';
import { authRouter } from './routes/auth';
import { plansRouter } from './routes/plans';
import { dashboardRouter } from './routes/dashboard';
import { apiProxyRouter } from './routes/api-proxy';
import { adminRouter } from './routes/admin';
import { webhooksRouter } from './routes/webhooks';

// Initialize services
import './config/database';
import './config/redis';
import './config/stripe';
import './config/supabase';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env['PORT'] || 3001;

// Security middleware
app.use(helmet());

// CORS configuration
const corsOptions = {
  origin: process.env['CORS_ORIGIN'] || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env['RATE_LIMIT_WINDOW_MS'] || '900000'), // 15 minutes
  max: parseInt(process.env['RATE_LIMIT_MAX_REQUESTS'] || '100'), // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Compression middleware
if (process.env['COMPRESSION_ENABLED'] !== 'false') {
  app.use(compression());
}

// Logging middleware
const morganFormat = process.env['MORGAN_FORMAT'] || 'combined';
app.use(morgan(morganFormat));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/api/health', healthRouter);
app.use('/api/auth', authRouter);
app.use('/api/plans', plansRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/data', apiProxyRouter); // Proxy to Golang API
app.use('/api/admin', adminRouter);
app.use('/api/webhooks', webhooksRouter);

// Root endpoint
app.get('/', (_req, res) => {
  res.json({
    message: 'API Gateway Backend',
    version: '2.0.0',
    status: 'running',
    database: 'Supabase PostgreSQL',
    features: [
      'User Authentication',
      'Subscription Management',
      'API Rate Limiting',
      'Request Logging',
      'Admin Dashboard',
      'Stripe Integration',
      'Supabase Integration'
    ],
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware (must be last)
app.use(notFoundHandler);
app.use(errorHandler);

// Only start the server if not in production (Vercel handles the server)
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 API Gateway Backend is running on port ${PORT}`);
    console.log(`📊 Environment: ${process.env['NODE_ENV'] || 'development'}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
    console.log(`🔐 Auth API: http://localhost:${PORT}/api/auth`);
    console.log(`📱 Plans API: http://localhost:${PORT}/api/plans`);
    console.log(`📊 Dashboard API: http://localhost:${PORT}/api/dashboard`);
    console.log(`🌐 Data Proxy: http://localhost:${PORT}/api/data`);
    console.log(`👑 Admin API: http://localhost:${PORT}/api/admin`);
    console.log(`🔔 Webhooks: http://localhost:${PORT}/api/webhooks`);
    console.log(`💾 Database: Supabase PostgreSQL`);
    console.log(`💳 Payments: Stripe`);
    console.log(`🚀 Supabase: ${process.env.SUPABASE_URL || 'Not configured'}`);
  });
}

export default app;
