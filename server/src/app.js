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

// CORS
app.use(
  cors({
    origin: FRONTEND_URL,
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