import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import apiRoutes from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';

// Configuration
const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Express App
const app = express();

// Trust reverse proxy (required for Render / Vercel HTTPS cookies)
app.set('trust proxy', 1);

// Allowed origins helper
const allowedOrigins = [
  FRONTEND_URL.replace(/\/+$/, ''),
  'http://localhost:5173',
  'http://localhost:3000'
];

// CORS setup
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);

      const cleanOrigin = origin.replace(/\/+$/, '');
      if (
        allowedOrigins.includes(cleanOrigin) ||
        cleanOrigin.endsWith('.vercel.app') ||
        process.env.NODE_ENV !== 'production'
      ) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);

// Body parsing
app.use(express.json());

// Cookies
app.use(cookieParser());

// Uploaded files
app.use('/uploads', express.static('uploads'));

// API routes
app.use('/api', apiRoutes);

// Error handling
app.use(errorHandler);

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`NotifyHub server running on port ${PORT}`);
});

export default app;