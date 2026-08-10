/**
 * GET /api/files/announcement/:id
 * GET /api/files/event/:id
 *
 * Streams stored attachment directly from database (base64) or fallback disk path.
 * Public route so images and PDFs render directly in browser / new tab.
 */

import { Router } from 'express';
import prisma from '../lib/prisma.js';
import path from 'path';
import fs from 'fs';

const router = Router();

async function getAttachmentBuffer(record) {
  if (!record) return null;
  if (record.attachmentData) {
    return Buffer.from(record.attachmentData, 'base64');
  }
  if (record.attachmentUrl && record.attachmentUrl.startsWith('/uploads/')) {
    const cleanPath = record.attachmentUrl.replace(/^\/+/, '');
    const pathsToTry = [
      path.join(process.cwd(), cleanPath),
      path.join(process.cwd(), 'server', cleanPath),
      path.resolve(process.cwd(), '..', cleanPath),
    ];
    for (const p of pathsToTry) {
      if (fs.existsSync(p)) {
        return fs.readFileSync(p);
      }
    }
  }
  return null;
}

// ─── Announcement attachment ──────────────────────────────
router.get('/announcement/:id', async (req, res, next) => {
  try {
    const record = await prisma.announcement.findUnique({
      where: { id: req.params.id },
      select: {
        attachmentData: true,
        attachmentUrl: true,
        attachmentType: true,
        attachmentName: true,
      },
    });

    if (!record) {
      return res.status(404).json({ error: 'Announcement not found.' });
    }

    const buffer = await getAttachmentBuffer(record);
    if (!buffer) {
      return res.status(404).json({ error: 'File attachment not found.' });
    }

    const contentType = record.attachmentType || 'application/octet-stream';
    const filename = record.attachmentName || 'attachment';

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Length', buffer.length);
    res.setHeader(
      'Content-Disposition',
      `inline; filename="${encodeURIComponent(filename)}"`
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
        attachmentUrl: true,
        attachmentType: true,
        attachmentName: true,
      },
    });

    if (!record) {
      return res.status(404).json({ error: 'Event not found.' });
    }

    const buffer = await getAttachmentBuffer(record);
    if (!buffer) {
      return res.status(404).json({ error: 'File attachment not found.' });
    }

    const contentType = record.attachmentType || 'application/octet-stream';
    const filename = record.attachmentName || 'attachment';

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Length', buffer.length);
    res.setHeader(
      'Content-Disposition',
      `inline; filename="${encodeURIComponent(filename)}"`
    );
    res.end(buffer);
  } catch (err) {
    next(err);
  }
});

export default router;
