import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma.js';

const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Middleware: requireAuth
 * Verifies the JWT from the HttpOnly cookie.
 * Attaches req.user (without passwordHash) if valid.
 * Returns 401 if unauthenticated.
 */
export async function requireAuth(req, res, next) {
  try {
    const token = req.cookies?.token;
    if (!token) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    const payload = jwt.verify(token, JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, name: true, email: true, role: true },
    });

    if (!user) {
      return res.status(401).json({ error: 'User not found.' });
    }

    req.user = user;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired session.' });
  }
}

/**
 * Middleware factory: requireRole
 * Checks that the authenticated user has one of the allowed roles.
 * Must be used AFTER requireAuth.
 * Returns 403 if the user's role is not permitted.
 */
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied.' });
    }
    next();
  };
}
