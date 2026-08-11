import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { logActivity } from '../lib/activityLogger.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET;
const SALT_ROUNDS = 10;
const COOKIE_NAME = 'token';

/** Cookie options for the JWT token */
function cookieOptions() {
  const isProd = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProd, // Must be true when sameSite is 'none'
    sameSite: isProd ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
  };
}

/** Strip sensitive fields from user object */
function safeUser(user) {
  return { id: user.id, name: user.name, email: user.email, role: user.role, rollNo: user.rollNo, year: user.year, department: user.department };
}

// ─── POST /api/auth/register ────────────────────────────

router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password, rollNo, year, department } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    // Check for existing account
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    // Hash password and create user (always STUDENT role)
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await prisma.user.create({
      data: { name, email, passwordHash, role: 'STUDENT', rollNo, year, department },
    });

    // Issue token
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
    res.cookie(COOKIE_NAME, token, cookieOptions());
    res.status(201).json({ user: safeUser(user) });
  } catch (err) {
    next(err);
  }
});

// ─── POST /api/auth/login ───────────────────────────────

router.post('/login', async (req, res, next) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await prisma.user.findFirst({
      where: { email: { equals: normalizedEmail, mode: 'insensitive' } }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // If logging in via Admin portal, enforce ADMIN role check before issuing session cookie
    if (role === 'ADMIN' && user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Access denied. Account does not have Administrator privileges.' });
    }

    // Issue token
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
    res.cookie(COOKIE_NAME, token, cookieOptions());

    if (user.role === 'ADMIN') {
      await logActivity(user.id, 'login', 'Auth', user.id, 'Admin logged in');
    }

    res.json({ user: safeUser(user) });
  } catch (err) {
    next(err);
  }
});

// ─── POST /api/auth/logout ──────────────────────────────

router.post('/logout', (_req, res) => {
  res.clearCookie(COOKIE_NAME, { path: '/' });
  res.json({ message: 'Logged out.' });
});

// ─── GET /api/auth/me ───────────────────────────────────

router.get('/me', requireAuth, (req, res) => {
  res.json({ user: req.user });
});

// ─── GET /api/auth/admin/test ───────────────────────────
// Temporary protected route to verify role-based authorization

router.get('/admin/test', requireAuth, requireRole('ADMIN'), (req, res) => {
  res.json({ message: 'Admin access verified.', user: req.user });
});

// ─── POST /api/auth/change-password ──────────────────────

router.post('/change-password', requireAuth, requireRole('ADMIN'), async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current and new passwords are required.' });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters.' });
    }

    const admin = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!admin) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const isMatch = await bcrypt.compare(currentPassword, admin.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Incorrect current password.' });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: admin.id },
      data: { passwordHash: hashedNewPassword }
    });

    await logActivity(admin.id, 'updated', 'Auth', admin.id, 'Admin changed password');

    res.json({ message: 'Password updated successfully.' });
  } catch (err) {
    next(err);
  }
});

// ─── POST /api/auth/reset-password ───────────────────────

router.post('/reset-password', async (req, res, next) => {
  try {
    const { email, newPassword, role } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json({ error: 'Email and new password are required.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await prisma.user.findFirst({
      where: {
        email: { equals: normalizedEmail, mode: 'insensitive' }
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'No account found with this email address.' });
    }

    if (role && user.role !== role) {
      return res.status(403).json({ error: `This email is not registered as an ${role.toLowerCase()} account.` });
    }

    const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash }
    });

    if (user.role === 'ADMIN') {
      await logActivity(user.id, 'updated', 'Auth', user.id, 'Admin reset password via Forgot Password');
    }

    res.json({ message: 'Password reset successfully. You can now sign in with your new password.' });
  } catch (err) {
    next(err);
  }
});

export default router;
