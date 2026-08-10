import { Router } from 'express';
import authRoutes from './auth.js';
import healthRoutes from './health.js';
import announcementRoutes from './announcements.js';
import eventRoutes from './events.js';
import queryRoutes from './queries.js';
import notificationRoutes from './notifications.js';
import activityRoutes from './activity.js';
import fileRoutes from './files.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/health', healthRoutes);
router.use('/announcements', announcementRoutes);
router.use('/events', eventRoutes);
router.use('/queries', queryRoutes);
router.use('/notifications', notificationRoutes);
router.use('/activity', activityRoutes);
router.use('/files', fileRoutes);

export default router;
