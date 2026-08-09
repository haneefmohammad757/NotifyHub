import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import apiRoutes from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';

// ─── Configuration ───────────────────────────────────────

const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// ─── Express App ─────────────────────────────────────────

const app = express();

// Middleware
app.use(cors({ origin: FRONTEND_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static('uploads'));

// API routes
app.use('/api', apiRoutes);

// Error handling
app.use(errorHandler);

// ─── Start ───────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`NotifyHub server running on http://localhost:${PORT}`);
});

export default app;
