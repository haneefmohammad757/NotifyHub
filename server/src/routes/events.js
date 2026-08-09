import { Router } from 'express';
import prisma from '../lib/prisma.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { logActivity } from '../lib/activityLogger.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
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

// ─── GET /api/events ──────────────────────────────────────

router.get('/', requireAuth, async (req, res, next) => {
  try {
    const { role } = req.user;
    
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    // Students only see upcoming events (or from today onwards)
    const today = new Date();
    // Use UTC midnight to match how Prisma stores dates from input type="date"
    const startOfTodayUTC = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));

    const where = role === 'STUDENT' ? { date: { gte: startOfTodayUTC } } : {};

    const events = await prisma.event.findMany({
      where,
      orderBy: { date: 'asc' }, // Upcoming first
      include: {
        creator: {
          select: { name: true } // Include author name
        }
      }
    });

    res.json(events);
  } catch (err) {
    next(err);
  }
});

// ─── GET /api/events/:id ──────────────────────────────────

router.get('/:id', requireAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const event = await prisma.event.findUnique({
      where: { id },
      include: { creator: { select: { name: true } } }
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found.' });
    }

    res.json(event);
  } catch (err) {
    next(err);
  }
});

// ─── POST /api/events ─────────────────────────────────────

router.post('/', requireAuth, requireRole('ADMIN'), upload.single('attachment'), async (req, res, next) => {
  try {
    const { title, description, date, startTime, endTime, venue } = req.body;

    if (!title || !description || !date || !venue) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: 'Title, description, date, and venue are required.' });
    }

    const eventDate = new Date(date);
    if (isNaN(eventDate.valueOf())) {
      return res.status(400).json({ error: 'Invalid event date.' });
    }

    // Duplicate prevention: same title, date, and venue
    // We check within the same day since date typically has time as 00:00:00 for simple dates
    const startOfDay = new Date(eventDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(eventDate);
    endOfDay.setHours(23, 59, 59, 999);

    const duplicate = await prisma.event.findFirst({
      where: {
        title,
        venue,
        date: {
          gte: startOfDay,
          lte: endOfDay
        }
      }
    });

    if (duplicate) {
      return res.status(409).json({ error: 'An identical event with this title, date, and venue already exists.' });
    }

    const data = {
      title,
      description,
      date: eventDate,
      startTime,
      endTime,
      venue,
      createdBy: req.user.id
    };

    if (req.file) {
      data.attachmentUrl = `/uploads/${req.file.filename}`;
      data.attachmentName = req.file.originalname;
      data.attachmentType = req.file.mimetype;
      data.attachmentSize = req.file.size;
    }

    const event = await prisma.event.create({ data });

    await logActivity(req.user.id, 'created', 'Event', event.id, event.title);

    res.status(201).json(event);
  } catch (err) {
    next(err);
  }
});

// ─── PUT /api/events/:id ──────────────────────────────────

router.put('/:id', requireAuth, requireRole('ADMIN'), upload.single('attachment'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, date, startTime, endTime, venue, removeAttachment } = req.body;

    if (!title || !description || !date || !venue) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: 'Title, description, date, and venue are required.' });
    }
    
    const eventDate = new Date(date);
    if (isNaN(eventDate.valueOf())) {
      return res.status(400).json({ error: 'Invalid event date.' });
    }

    const existing = await prisma.event.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'Event not found.' });
    }

    const data = {
      title,
      description,
      date: eventDate,
      startTime,
      endTime,
      venue,
    };

    if (req.file) {
      data.attachmentUrl = `/uploads/${req.file.filename}`;
      data.attachmentName = req.file.originalname;
      data.attachmentType = req.file.mimetype;
      data.attachmentSize = req.file.size;
    } else if (removeAttachment === 'true') {
      data.attachmentUrl = null;
      data.attachmentName = null;
      data.attachmentType = null;
      data.attachmentSize = null;
    }

    const updated = await prisma.event.update({
      where: { id },
      data
    });

    await logActivity(req.user.id, 'updated', 'Event', updated.id, updated.title);

    res.json(updated);
  } catch (err) {
    next(err);
  }
});

// ─── DELETE /api/events/:id ───────────────────────────────

router.delete('/:id', requireAuth, requireRole('ADMIN'), async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const existing = await prisma.event.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'Event not found.' });
    }

    // Hard delete since there is no status field for events
    await prisma.event.delete({
      where: { id }
    });

    await logActivity(req.user.id, 'deleted', 'Event', id, existing.title);

    res.json({ message: 'Event deleted successfully.' });
  } catch (err) {
    next(err);
  }
});

export default router;
