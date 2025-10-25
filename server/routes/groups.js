import express from 'express';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * GET /api/groups/recommendations
 * Returns recommended groups based on overlapping keywords
 * 
 * Algorithm:
 * 1. Get all keywords for the current user from their materials
 * 2. Find other users with overlapping keywords
 * 3. Find groups that those similar users are in
 * 4. Return groups with matching keywords highlighted
 */
router.get('/groups/recommendations', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const prisma = req.app.get('prisma');

    // Step 1: Get all keywords for the current user
    const userMaterials = await prisma.material.findMany({
      where: {
        course: {
          userId: userId
        },
        status: 'COMPLETED'
      },
      include: {
        aiData: {
          select: {
            keywords: true
          }
        }
      }
    });

    // Flatten all keywords into a single array
    const userKeywords = new Set();
    userMaterials.forEach(material => {
      if (material.aiData && material.aiData.keywords) {
        material.aiData.keywords.forEach(keyword => {
          userKeywords.add(keyword.toLowerCase().trim());
        });
      }
    });

    if (userKeywords.size === 0) {
      return res.status(200).json([]);
    }

    const userKeywordsArray = Array.from(userKeywords);
    console.log(`🔍 User ${userId} has ${userKeywordsArray.length} unique keywords`);

    // Step 2: Find other users with overlapping keywords
    // Get all materials from other users that have overlapping keywords
    const otherUsersMaterials = await prisma.material.findMany({
      where: {
        course: {
          userId: {
            not: userId
          }
        },
        status: 'COMPLETED',
        aiData: {
          isNot: null
        }
      },
      include: {
        aiData: {
          select: {
            keywords: true
          }
        },
        course: {
          select: {
            userId: true
          }
        }
      }
    });

    // Calculate keyword overlap for each user
    const userOverlap = new Map(); // userId -> Set of matching keywords
    
    otherUsersMaterials.forEach(material => {
      const otherUserId = material.course.userId;
      
      if (material.aiData && material.aiData.keywords) {
        const matchingKeywords = material.aiData.keywords.filter(keyword => 
          userKeywordsArray.includes(keyword.toLowerCase().trim())
        );

        if (matchingKeywords.length > 0) {
          if (!userOverlap.has(otherUserId)) {
            userOverlap.set(otherUserId, new Set());
          }
          matchingKeywords.forEach(kw => 
            userOverlap.get(otherUserId).add(kw)
          );
        }
      }
    });

    if (userOverlap.size === 0) {
      return res.status(200).json([]);
    }

    const similarUserIds = Array.from(userOverlap.keys());
    console.log(`🤝 Found ${similarUserIds.length} similar users`);

    // Step 3: Find groups that similar users are in
    const groups = await prisma.group.findMany({
      where: {
        members: {
          some: {
            userId: {
              in: similarUserIds
            }
          }
        }
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                email: true
              }
            }
          }
        }
      }
    });

    // Step 4: Calculate matching keywords for each group and filter out groups user is already in
    const recommendations = groups
      .map(group => {
        // Check if user is already a member
        const isAlreadyMember = group.members.some(member => member.userId === userId);
        if (isAlreadyMember) {
          return null; // Filter out groups user is already in
        }

        // Get all matching keywords from members in this group
        const groupMatchingKeywords = new Set();
        group.members.forEach(member => {
          const memberKeywords = userOverlap.get(member.userId);
          if (memberKeywords) {
            memberKeywords.forEach(kw => groupMatchingKeywords.add(kw));
          }
        });

        return {
          id: group.id,
          name: group.name,
          description: group.description,
          matchingKeywords: Array.from(groupMatchingKeywords),
          memberCount: group.members.length,
          relevanceScore: groupMatchingKeywords.size
        };
      })
      .filter(g => g !== null) // Remove groups user is already in
      .sort((a, b) => b.relevanceScore - a.relevanceScore); // Sort by most relevant

    console.log(`📊 Returning ${recommendations.length} recommended groups`);
    res.status(200).json(recommendations);

  } catch (error) {
    console.error('Get recommendations error:', error);
    res.status(500).json({ error: 'Failed to fetch group recommendations.' });
  }
});

/**
 * POST /api/groups/:id/join
 * Allows user to join a group
 */
router.post('/groups/:id/join', authenticateToken, async (req, res) => {
  try {
    const { id: groupId } = req.params;
    const userId = req.user.userId;
    const prisma = req.app.get('prisma');

    // Check if group exists
    const group = await prisma.group.findUnique({
      where: { id: groupId }
    });

    if (!group) {
      return res.status(404).json({ error: 'Group not found.' });
    }

    // Check if user is already a member
    const existingMembership = await prisma.groupMember.findUnique({
      where: {
        userId_groupId: {
          userId,
          groupId
        }
      }
    });

    if (existingMembership) {
      return res.status(400).json({ error: 'You are already a member of this group.' });
    }

    // Create the group membership
    const membership = await prisma.groupMember.create({
      data: {
        userId,
        groupId
      }
    });

    console.log(`✅ User ${userId} joined group ${groupId}`);
    res.status(201).json({
      userId: membership.userId,
      groupId: membership.groupId,
      joinedAt: membership.joinedAt
    });

  } catch (error) {
    console.error('Join group error:', error);
    res.status(500).json({ error: 'Failed to join group.' });
  }
});

/**
 * GET /api/groups/my-groups
 * Get all groups the current user is a member of
 */
router.get('/groups/my-groups', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const prisma = req.app.get('prisma');

    const userGroups = await prisma.group.findMany({
      where: {
        members: {
          some: {
            userId: userId
          }
        }
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                email: true
              }
            }
          },
          orderBy: {
            joinedAt: 'asc'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const formattedGroups = userGroups.map(group => ({
      id: group.id,
      name: group.name,
      description: group.description,
      memberCount: group.members.length,
      members: group.members.map(m => ({
        userId: m.user.id,
        email: m.user.email,
        joinedAt: m.joinedAt
      })),
      createdAt: group.createdAt
    }));

    res.status(200).json(formattedGroups);

  } catch (error) {
    console.error('Get my groups error:', error);
    res.status(500).json({ error: 'Failed to fetch your groups.' });
  }
});

/**
 * POST /api/groups (Create a new group - bonus feature)
 * Allows user to create a new study group
 */
router.post('/groups', authenticateToken, async (req, res) => {
  try {
    const { name, description } = req.body;
    const userId = req.user.userId;
    const prisma = req.app.get('prisma');

    if (!name || name.trim().length === 0) {
      return res.status(400).json({ error: 'Group name is required.' });
    }

    // Create group and automatically add creator as first member
    const group = await prisma.group.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        members: {
          create: {
            userId: userId
          }
        }
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                email: true
              }
            }
          }
        }
      }
    });

    console.log(`✅ User ${userId} created group ${group.id}: "${group.name}"`);
    res.status(201).json({
      id: group.id,
      name: group.name,
      description: group.description,
      memberCount: group.members.length,
      members: group.members.map(m => ({
        userId: m.user.id,
        email: m.user.email,
        joinedAt: m.joinedAt
      }))
    });

  } catch (error) {
    console.error('Create group error:', error);
    res.status(500).json({ error: 'Failed to create group.' });
  }
});

/**
 * GET /api/groups/:id/messages
 * Get all messages for a specific group
 */
router.get('/groups/:id/messages', authenticateToken, async (req, res) => {
  try {
    const { id: groupId } = req.params;
    const userId = req.user.userId;
    const prisma = req.app.get('prisma');

    // Verify user is a member of the group
    const membership = await prisma.groupMember.findUnique({
      where: {
        userId_groupId: {
          userId,
          groupId
        }
      }
    });

    if (!membership) {
      return res.status(403).json({ error: 'You must be a member of this group to view messages.' });
    }

    // Fetch messages with user information
    const messages = await prisma.message.findMany({
      where: {
        groupId
      },
      include: {
        user: {
          select: {
            id: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      },
      take: 100 // Limit to last 100 messages
    });

    res.status(200).json(messages);

  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Failed to fetch messages.' });
  }
});

/**
 * POST /api/groups/:id/messages
 * Send a message to a group
 */
router.post('/groups/:id/messages', authenticateToken, async (req, res) => {
  try {
    const { id: groupId } = req.params;
    const { content } = req.body;
    const userId = req.user.userId;
    const prisma = req.app.get('prisma');
    const io = req.app.get('io');

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: 'Message content is required.' });
    }

    // Verify user is a member of the group
    const membership = await prisma.groupMember.findUnique({
      where: {
        userId_groupId: {
          userId,
          groupId
        }
      }
    });

    if (!membership) {
      return res.status(403).json({ error: 'You must be a member of this group to send messages.' });
    }

    // Create the message
    const message = await prisma.message.create({
      data: {
        content: content.trim(),
        userId,
        groupId
      },
      include: {
        user: {
          select: {
            id: true,
            email: true
          }
        }
      }
    });

    // Emit real-time event to all users in the group room
    io.to(`group_${groupId}`).emit('new_message', message);

    console.log(`📨 Message sent to group ${groupId} by user ${userId}`);
    res.status(201).json(message);

  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Failed to send message.' });
  }
});

export default router;
