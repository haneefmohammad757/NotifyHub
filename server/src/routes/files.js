/**
 * GET /api/files/announcement/:id
 * GET /api/files/event/:id
 *
 * Streams the stored base64 attachment directly from the database.
 * No authentication required so browsers can open files in a new tab.
 */

import { Router } from 'express';
import prisma from '../lib/prisma.js';

const router = Router();

// ─── Announcement attachment ──────────────────────────────
router.get('/announcement/:id', async (req, res, next) => {
  try {
    const record = await prisma.announcement.findUnique({
      where: { id: req.params.id },
      select: {
        attachmentData: true,
        attachmentType: true,
        attachmentName: true,
      },
    });

    if (!record?.attachmentData) {
      return res.status(404).json({ error: 'File not found.' });
    }

    const buffer = Buffer.from(record.attachmentData, 'base64');
    res.setHeader('Content-Type', record.attachmentType || 'application/octet-stream');
    res.setHeader('Content-Length', buffer.length);

    // Inline for images, attachment for PDFs so they open in-browser
    const disposition = record.attachmentType?.startsWith('image/')
      ? 'inline'
      : 'inline'; // 'inline' so PDF opens in browser tab
    res.setHeader(
      'Content-Disposition',
      `${disposition}; filename="${encodeURIComponent(record.attachmentName || 'file')}"`
    );
    res.end(buffer);
  } catch (err) {
    next(err);
  }
});

// ─── Event attachment ─────────────────────────────────────
router.get('/event/:id', async (req, res, next) => {
  try {
    const record = await prisma.event.findUnique({
      where: { id: req.params.id },
      select: {
        attachmentData: true,
        attachmentType: true,
        attachmentName: true,
      },
    });

    if (!record?.attachmentData) {
      return res.status(404).json({ error: 'File not found.' });
    }

    const buffer = Buffer.from(record.attachmentData, 'base64');
    res.setHeader('Content-Type', record.attachmentType || 'application/octet-stream');
    res.setHeader('Content-Length', buffer.length);

    const disposition = record.attachmentType?.startsWith('image/')
      ? 'inline'
      : 'inline';
    res.setHeader(
      'Content-Disposition',
      `${disposition}; filename="${encodeURIComponent(record.attachmentName || 'file')}"`
    );
    res.end(buffer);
  } catch (err) {
    next(err);
  }
});

export default router;
