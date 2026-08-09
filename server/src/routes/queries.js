import { Router } from 'express';
import prisma from '../lib/prisma.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { logActivity } from '../lib/activityLogger.js';

const router = Router();

// ─── GET /api/queries ─────────────────────────────────────

router.get('/', requireAuth, async (req, res, next) => {
  try {
    const { id, role } = req.user;
    
    // Students only see their own non-deleted queries. Admins see all non-deleted queries for admin.
    const where = role === 'STUDENT' 
      ? { studentId: id, deletedByStudent: false } 
      : { deletedByAdmin: false };

    const queries = await prisma.query.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        student: { select: { name: true, email: true } },
        responder: { select: { name: true } }
      }
    });

    res.json(queries);
  } catch (err) {
    next(err);
  }
});

// ─── GET /api/queries/:id ─────────────────────────────────

router.get('/:id', requireAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role, id: userId } = req.user;

    const queryRecord = await prisma.query.findUnique({
      where: { id },
      include: {
        student: { select: { name: true, email: true } },
        responder: { select: { name: true } }
      }
    });

    if (!queryRecord) {
      return res.status(404).json({ error: 'Query not found.' });
    }

    if (role === 'STUDENT') {
      if (queryRecord.studentId !== userId || queryRecord.deletedByStudent) {
        return res.status(404).json({ error: 'Query not found.' });
      }
    } else if (role === 'ADMIN') {
      if (queryRecord.deletedByAdmin) {
        return res.status(404).json({ error: 'Query not found.' });
      }
    }

    res.json(queryRecord);
  } catch (err) {
    next(err);
  }
});

// ─── POST /api/queries ────────────────────────────────────

router.post('/', requireAuth, async (req, res, next) => {
  try {
    const { role, id: studentId } = req.user;
    const { subject, message } = req.body;

    if (!subject || !message) {
      return res.status(400).json({ error: 'Subject and message are required.' });
    }

    // Duplicate prevention: same subject and message within the last 24 hours
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const duplicate = await prisma.query.findFirst({
      where: {
        studentId,
        subject,
        message,
        createdAt: { gte: yesterday }
      }
    });

    if (duplicate) {
      return res.status(409).json({ error: 'An identical query was recently submitted.' });
    }

    const queryRecord = await prisma.query.create({
      data: {
        subject,
        message,
        studentId
      }
    });

    res.status(201).json(queryRecord);
  } catch (err) {
    next(err);
  }
});

// ─── PUT /api/queries/:id ─────────────────────────────────

router.put('/:id', requireAuth, requireRole('ADMIN'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, response } = req.body;
    const { id: adminId } = req.user;

    const existing = await prisma.query.findUnique({ where: { id } });
    if (!existing || existing.deletedByAdmin) {
      return res.status(404).json({ error: 'Query not found.' });
    }

    if (status && !['OPEN', 'IN_PROGRESS', 'RESOLVED'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status value.' });
    }

    const data = {};
    if (status) data.status = status;
    
    if (response !== undefined) {
      data.response = response;
      data.respondedBy = adminId;
      data.respondedAt = new Date();
    }

    const updated = await prisma.query.update({
      where: { id },
      data,
      include: {
        student: { select: { name: true, email: true } },
        responder: { select: { name: true } }
      }
    });

    if (response !== undefined && existing.response !== response) {
      await prisma.notification.create({
        data: {
          type: 'QUERY_RESPONSE',
          title: 'Your query has been answered',
          message: 'The administration has responded to your query.',
          userId: existing.studentId
        }
      });
      await logActivity(adminId, 'responded', 'Query', updated.id, updated.subject);
    } else if (status && status !== existing.status) {
      await logActivity(adminId, 'status_changed', 'Query', updated.id, `${updated.subject} (${status})`);
    }

    res.json(updated);
  } catch (err) {
    next(err);
  }
});

// ─── DELETE /api/queries/:id ──────────────────────────────
// Independent deletion: Student deletion hides for student only, Admin deletion hides for admin only.

router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { id: userId, role } = req.user;

    const existing = await prisma.query.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'Query not found.' });
    }

    if (role === 'ADMIN') {
      if (existing.deletedByAdmin) {
        return res.status(404).json({ error: 'Query not found.' });
      }
      // If student also already deleted it, hard delete from DB, else soft delete for admin
      if (existing.deletedByStudent) {
        await prisma.query.delete({ where: { id } });
      } else {
        await prisma.query.update({
          where: { id },
          data: { deletedByAdmin: true }
        });
      }
      await logActivity(userId, 'deleted', 'Query', id, existing.subject);
    } else {
      // Student deleting their query
      if (existing.studentId !== userId || existing.deletedByStudent) {
        return res.status(403).json({ error: 'Access denied.' });
      }
      // If admin also already deleted it, hard delete from DB, else soft delete for student
      if (existing.deletedByAdmin) {
        await prisma.query.delete({ where: { id } });
      } else {
        await prisma.query.update({
          where: { id },
          data: { deletedByStudent: true }
        });
      }
    }

    res.json({ message: 'Query deleted successfully.' });
  } catch (err) {
    next(err);
  }
});

export default router;
