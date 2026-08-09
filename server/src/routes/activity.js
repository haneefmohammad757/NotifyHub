import { Router } from 'express';
import prisma from '../lib/prisma.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

// ─── GET /api/activity ───────────────────────────────────

router.get('/', requireAuth, requireRole('ADMIN'), async (req, res, next) => {
  try {
    const { type, page = 1, limit = 50 } = req.query;
    
    // Only admins can see this route (enforced by requireRole)
    
    // Build where clause based on optional type filter
    const where = {};
    if (type && type !== 'All') {
      where.entityType = type;
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const take = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * take;

    const [logs, total] = await Promise.all([
      prisma.activityLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take,
        skip,
        include: {
          admin: {
            select: { name: true }
          }
        }
      }),
      prisma.activityLog.count({ where })
    ]);

    res.json({
      data: logs,
      meta: {
        total,
        page: pageNum,
        limit: take,
        totalPages: Math.ceil(total / take)
      }
    });
  } catch (err) {
    next(err);
  }
});

export default router;
