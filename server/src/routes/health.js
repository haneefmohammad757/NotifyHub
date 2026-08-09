import { Router } from 'express';
import prisma from '../lib/prisma.js';

const router = Router();

/**
 * GET /api/health
 * Returns basic server health status.
 * Does NOT expose credentials or internal details.
 */
router.get('/', async (_req, res) => {
  try {
    // Verify database connectivity with a lightweight query
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', database: 'connected' });
  } catch {
    res.status(503).json({ status: 'error', database: 'disconnected' });
  }
});

export default router;
