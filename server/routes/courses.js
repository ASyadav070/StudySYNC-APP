import express from 'express';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// All routes are protected by JWT authentication
router.use(authenticateToken);

/**
 * POST /api/courses
 * Create a new course
 * Body: { name }
 * Response (201): { id, name, userId }
 */
router.post('/', async (req, res) => {
  try {
    const { name } = req.body;
    const userId = req.user.userId;

    // Validation
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Course name is required.' });
    }

    const prisma = req.app.get('prisma');

    // Create course
    const newCourse = await prisma.course.create({
      data: {
        name: name.trim(),
        userId
      }
    });

    res.status(201).json({
      id: newCourse.id,
      name: newCourse.name,
      userId: newCourse.userId
    });
  } catch (error) {
    console.error('Create course error:', error);
    res.status(500).json({ error: 'Failed to create course.' });
  }
});

/**
 * GET /api/courses
 * Get all courses for the authenticated user
 * Response (200): [{ id, name, createdAt }, ...]
 */
router.get('/', async (req, res) => {
  try {
    const userId = req.user.userId;
    const prisma = req.app.get('prisma');

    const courses = await prisma.course.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        createdAt: true
      }
    });

    res.status(200).json(courses);
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({ error: 'Failed to fetch courses.' });
  }
});

/**
 * GET /api/courses/:id
 * Get a specific course with all its materials
 * Response (200): { id, name, materials: [{ id, filename, status, createdAt }, ...] }
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const prisma = req.app.get('prisma');

    // Find course and verify ownership
    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        materials: {
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            filename: true,
            status: true,
            createdAt: true
          }
        }
      }
    });

    if (!course) {
      return res.status(404).json({ error: 'Course not found.' });
    }

    // Check if the course belongs to the authenticated user
    if (course.userId !== userId) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    res.status(200).json({
      id: course.id,
      name: course.name,
      materials: course.materials
    });
  } catch (error) {
    console.error('Get course details error:', error);
    res.status(500).json({ error: 'Failed to fetch course details.' });
  }
});

export default router;
