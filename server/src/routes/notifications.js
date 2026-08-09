import { Router } from 'express';
import prisma from '../lib/prisma.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// ─── GET /api/notifications ──────────────────────────────

router.get('/', requireAuth, async (req, res, next) => {
  try {
    const { id: userId } = req.user;

    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    const unreadCount = notifications.filter(n => !n.read).length;

    res.json({
      notifications,
      unreadCount
    });
  } catch (err) {
    next(err);
  }
});

// ─── GET /api/notifications/:id ──────────────────────────

router.get('/:id', requireAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { id: userId } = req.user;

    const notification = await prisma.notification.findUnique({
      where: { id }
    });

    if (!notification || notification.userId !== userId) {
      return res.status(404).json({ error: 'Notification not found.' });
    }

    res.json(notification);
  } catch (err) {
    next(err);
  }
});

// ─── PUT /api/notifications/read-all ─────────────────────

router.put('/read-all', requireAuth, async (req, res, next) => {
  try {
    const { id: userId } = req.user;

    await prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true }
    });

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

// ─── PUT /api/notifications/:id/read ─────────────────────

router.put('/:id/read', requireAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { id: userId } = req.user;

    const existing = await prisma.notification.findUnique({ where: { id } });

    if (!existing || existing.userId !== userId) {
      return res.status(404).json({ error: 'Notification not found.' });
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: { read: true }
    });

    res.json(updated);
  } catch (err) {
    next(err);
  }
});

export default router;
