import prisma from './prisma.js';

/**
 * Logs an administrative action to the database.
 * 
 * @param {string} adminId - The ID of the admin who performed the action.
 * @param {string} action - The action performed (e.g., 'created', 'updated', 'published', 'archived', 'deleted', 'responded').
 * @param {string} entityType - The type of entity (e.g., 'Announcement', 'Event', 'Query', 'Auth').
 * @param {string} entityId - The ID of the entity that was affected.
 * @param {string} [details] - Optional context or description of the entity (e.g., the title).
 */
export async function logActivity(adminId, action, entityType, entityId, details = null) {
  try {
    await prisma.activityLog.create({
      data: {
        adminId,
        action,
        entityType,
        entityId,
        details
      }
    });
  } catch (error) {
    // We don't want activity logging failures to crash the main request
    console.error(`[ActivityLogger] Failed to log activity: ${error.message}`);
  }
}
