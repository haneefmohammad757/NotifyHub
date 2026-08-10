import { Router } from 'express';
import prisma from '../lib/prisma.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { logActivity } from '../lib/activityLogger.js';
import multer from 'multer';

const router = Router();

// Memory storage — no disk writes
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPG, PNG, WEBP, and PDF are allowed.'));
    }
  }
});

// ─── GET /api/announcements ──────────────────────────────

router.get('/', requireAuth, async (req, res, next) => {
  try {
    const { role } = req.user;
    
    // Students only see published announcements
    const where = role === 'STUDENT' ? { status: 'PUBLISHED' } : {};

    const announcements = await prisma.announcement.findMany({
      where,
      orderBy: [
        { createdAt: 'desc' },
      ],
      include: {
        creator: {
          select: { name: true } // Include author name
        }
      }
    });

    const priorityOrder = { URGENT: 1, IMPORTANT: 2, NORMAL: 3 };
    
    const sorted = announcements.sort((a, b) => {
      if (a.priority !== b.priority) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      const aDate = a.publishedAt || a.createdAt;
      const bDate = b.publishedAt || b.createdAt;
      return new Date(bDate) - new Date(aDate);
    });

    // Ensure attachmentUrl is populated for announcements with attachments
    const sanitized = sorted.map(({ attachmentData, ...rest }) => ({
      ...rest,
      attachmentUrl: rest.attachmentUrl || (rest.attachmentName ? `/api/files/announcement/${rest.id}` : null),
    }));

    res.json(sanitized);
  } catch (err) {
    next(err);
  }
});

// ─── GET /api/announcements/:id ──────────────────────────

router.get('/:id', requireAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.user;

    const announcement = await prisma.announcement.findUnique({
      where: { id },
      include: { creator: { select: { name: true } } }
    });

    if (!announcement) {
      return res.status(404).json({ error: 'Announcement not found.' });
    }

    if (role === 'STUDENT' && announcement.status !== 'PUBLISHED') {
      return res.status(403).json({ error: 'Access denied.' });
    }

    // Strip raw base64 — clients fetch file via /api/files/announcement/:id
    const { attachmentData, ...safe } = announcement;
    safe.attachmentUrl = safe.attachmentUrl || (safe.attachmentName ? `/api/files/announcement/${safe.id}` : null);
    res.json(safe);
  } catch (err) {
    next(err);
  }
});

// ─── POST /api/announcements ─────────────────────────────

router.post('/', requireAuth, requireRole('ADMIN'), (req, res, next) => {
  upload.single('attachment')(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message });
    next();
  });
}, async (req, res, next) => {
  try {
    const { title, description, category, priority, status, deadline } = req.body;

    if (!title || !description || !category || !priority || !status) {
      return res.status(400).json({ error: 'Missing required fields.' });
    }

    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const duplicate = await prisma.announcement.findFirst({
      where: {
        title,
        category,
        createdAt: { gte: yesterday }
      }
    });

    if (duplicate) {
      return res.status(409).json({ error: 'A very similar announcement was posted recently.' });
    }

    const publishedAt = status === 'PUBLISHED' ? new Date() : null;
    
    // Build attachment data from buffer (memory storage)
    const attachmentFields = req.file ? {
      attachmentName: req.file.originalname,
      attachmentType: req.file.mimetype,
      attachmentSize: req.file.size,
      attachmentData: req.file.buffer.toString('base64'),
    } : {};

    let announcement = await prisma.announcement.create({
      data: {
        title,
        description,
        category,
        priority,
        status,
        deadline: deadline ? new Date(deadline) : null,
        publishedAt,
        createdBy: req.user.id,
        ...attachmentFields
      }
    });

    if (req.file) {
      const fileUrl = `/api/files/announcement/${announcement.id}`;
      announcement = await prisma.announcement.update({
        where: { id: announcement.id },
        data: { attachmentUrl: fileUrl }
      });
    }

    await logActivity(req.user.id, 'created', 'Announcement', announcement.id, title);
    if (status === 'PUBLISHED') {
      await logActivity(req.user.id, 'published', 'Announcement', announcement.id, title);
    }

    if (status === 'PUBLISHED') {
      const students = await prisma.user.findMany({ where: { role: 'STUDENT' }, select: { id: true } });
      if (students.length > 0) {
        await prisma.notification.createMany({
          data: students.map(student => ({
            type: 'ANNOUNCEMENT',
            title: `New Announcement: ${title}`,
            message: description.length > 100 ? description.substring(0, 97) + '...' : description,
            userId: student.id
          }))
        });
      }
    }

    // Return without raw base64
    const { attachmentData: _data, ...safe } = announcement;
    res.status(201).json(safe);
  } catch (err) {
    next(err);
  }
});

// ─── PUT /api/announcements/:id ──────────────────────────

router.put('/:id', requireAuth, requireRole('ADMIN'), (req, res, next) => {
  upload.single('attachment')(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message });
    next();
  });
}, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, category, priority, status, deadline, removeAttachment } = req.body;

    if (!title || !description || !category || !priority || !status) {
      return res.status(400).json({ error: 'Missing required fields.' });
    }

    const existing = await prisma.announcement.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'Announcement not found.' });
    }

    let publishedAt = existing.publishedAt;
    if (status === 'PUBLISHED' && existing.status !== 'PUBLISHED' && !publishedAt) {
      publishedAt = new Date();
    }

    let attachmentFields = {};
    if (req.file) {
      // New file uploaded — replace existing
      attachmentFields = {
        attachmentUrl: `/api/files/announcement/${id}`,
        attachmentName: req.file.originalname,
        attachmentType: req.file.mimetype,
        attachmentSize: req.file.size,
        attachmentData: req.file.buffer.toString('base64'),
      };
    } else if (removeAttachment === 'true') {
      // User requested removal
      attachmentFields = {
        attachmentUrl: null,
        attachmentName: null,
        attachmentType: null,
        attachmentSize: null,
        attachmentData: null,
      };
    }

    const updated = await prisma.announcement.update({
      where: { id },
      data: {
        title,
        description,
        category,
        priority,
        status,
        deadline: deadline ? new Date(deadline) : null,
        publishedAt,
        ...attachmentFields
      }
    });

    await logActivity(req.user.id, 'updated', 'Announcement', updated.id, title);
    if (status === 'PUBLISHED' && existing.status !== 'PUBLISHED') {
      await logActivity(req.user.id, 'published', 'Announcement', updated.id, title);
      
      const students = await prisma.user.findMany({ where: { role: 'STUDENT' }, select: { id: true } });
      if (students.length > 0) {
        await prisma.notification.createMany({
          data: students.map(student => ({
            type: 'ANNOUNCEMENT',
            title: `New Announcement: ${title}`,
            message: description.length > 100 ? description.substring(0, 97) + '...' : description,
            userId: student.id
          }))
        });
      }
    }

    const { attachmentData: _data, ...safe } = updated;
    res.json(safe);
  } catch (err) {
    next(err);
  }
});

// ─── DELETE /api/announcements/:id ───────────────────────

router.delete('/:id', requireAuth, requireRole('ADMIN'), async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const existing = await prisma.announcement.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'Announcement not found.' });
    }

    const archived = await prisma.announcement.update({
      where: { id },
      data: { status: 'ARCHIVED' }
    });

    await logActivity(req.user.id, 'archived', 'Announcement', id, existing.title);

    res.json(archived);
  } catch (err) {
    next(err);
  }
});

export default router;
