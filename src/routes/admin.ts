import { Router, Request, Response } from 'express';
import { prisma } from '../config/database';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = Router();

// Get all users (admin only)
router.get('/users', authenticateToken, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip: offset,
        take: limit,
        select: {
          id: true,
          name: true,
          email: true,
          plan: true,
          requestsThisMonth: true,
          stripeCustomerId: true,
          stripeSubscriptionId: true,
          adminAccess: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count(),
    ]);

    const totalPages = Math.ceil(total / limit);

    res.json({
      users,
      pagination: {
        currentPage: page,
        totalPages,
        totalUsers: total,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error('Admin users fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get system-wide usage statistics (admin only)
router.get('/usage', authenticateToken, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const period = req.query.period as string || 'month';
    let startDate: Date;

    switch (period) {
      case 'week':
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
        break;
      case 'year':
        startDate = new Date(new Date().getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    }

    const [
      totalUsers,
      activeSubscriptions,
      totalRequests,
      totalRevenue,
      planDistribution,
      requestTrends,
    ] = await Promise.all([
      // Total users
      prisma.user.count(),
      
      // Active subscriptions (users with paid plans)
      prisma.user.count({
        where: {
          plan: { not: 'FREE' as any }, // Type assertion for enum compatibility
          stripeSubscriptionId: { not: null },
        },
      }),
      
      // Total requests in period
      prisma.requestLog.count({
        where: { timestamp: { gte: startDate } },
      }),
      
      // Total revenue in period
      prisma.requestLog.aggregate({
        where: { timestamp: { gte: startDate } },
        _sum: { cost: true },
      }),
      
      // Plan distribution
      prisma.user.groupBy({
        by: ['plan'],
        _count: { plan: true },
      }),
      
      // Request trends (daily for the period)
      prisma.requestLog.groupBy({
        by: ['timestamp'],
        where: { timestamp: { gte: startDate } },
        _count: { id: true },
        _sum: { cost: true },
        orderBy: { timestamp: 'asc' },
      }),
    ]);

    const stats = {
      period,
      startDate,
      overview: {
        totalUsers,
        activeSubscriptions,
        totalRequests,
        totalRevenue: totalRevenue._sum.cost || 0,
      },
      planDistribution: planDistribution.map(p => ({
        plan: p.plan,
        count: p._count.plan,
      })),
      requestTrends: requestTrends.map(t => ({
        date: t.timestamp,
        requestCount: t._count.id,
        cost: t._sum.cost || 0,
      })),
    };

    res.json({ stats });
  } catch (error) {
    console.error('Admin usage fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user admin access (admin only)
router.patch('/users/:userId/admin', authenticateToken, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const { adminAccess } = req.body;

    if (typeof adminAccess !== 'boolean') {
      res.status(400).json({ error: 'adminAccess must be a boolean' });
      return;
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { adminAccess },
      select: {
        id: true,
        name: true,
        email: true,
        adminAccess: true,
        updatedAt: true,
      },
    });

    res.json({
      message: `User admin access ${adminAccess ? 'enabled' : 'disabled'} successfully`,
      user,
    });
  } catch (error) {
    console.error('Admin access update error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user details (admin only)
router.get('/users/:userId', authenticateToken, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        requestLogs: {
          orderBy: { timestamp: 'desc' },
          take: 50,
        },
      },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({ user });
  } catch (error) {
    console.error('Admin user details fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export { router as adminRouter };
