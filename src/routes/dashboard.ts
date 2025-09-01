import { Router, Request, Response } from 'express';
import { prisma } from '../config/database';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Get user dashboard information
router.get('/', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        requestLogs: {
          where: {
            timestamp: {
              gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            },
          },
          orderBy: { timestamp: 'desc' },
          take: 10,
        },
      },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Get plan details
    const plan = await prisma.plan.findUnique({
      where: { type: user.plan as any }, // Type assertion for enum compatibility
    });

    if (!plan) {
      res.status(404).json({ error: 'Plan not found' });
      return;
    }

    // Calculate usage statistics
    const totalCost = user.requestLogs.reduce((sum, log) => sum + log.cost, 0);
    const averageResponseTime = user.requestLogs.length > 0 
      ? user.requestLogs.reduce((sum, log) => sum + log.responseTimeMs, 0) / user.requestLogs.length 
      : 0;

    const dashboard = {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        plan: user.plan,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      plan: {
        type: plan.type,
        price: plan.price,
        apiRequests: plan.apiRequests,
        rateLimit: plan.rateLimit,
        access: plan.access,
        support: plan.support,
      },
      usage: {
        requestsThisMonth: user.requestsThisMonth,
        monthlyLimit: plan.apiRequests,
        remaining: Math.max(0, plan.apiRequests - user.requestsThisMonth),
        percentageUsed: Math.round((user.requestsThisMonth / plan.apiRequests) * 100),
      },
      statistics: {
        totalCost,
        averageResponseTime: Math.round(averageResponseTime),
        requestCount: user.requestLogs.length,
      },
      recentRequests: user.requestLogs.map(log => ({
        id: log.id,
        endpoint: log.endpoint,
        status: log.status,
        responseTimeMs: log.responseTimeMs,
        cost: log.cost,
        timestamp: log.timestamp,
      })),
    };

    res.json({ dashboard });
  } catch (error) {
    console.error('Dashboard fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's request history
router.get('/requests', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;

    const [requests, total] = await Promise.all([
      prisma.requestLog.findMany({
        where: { userId },
        orderBy: { timestamp: 'desc' },
        skip: offset,
        take: limit,
      }),
      prisma.requestLog.count({
        where: { userId },
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    res.json({
      requests,
      pagination: {
        currentPage: page,
        totalPages,
        totalRequests: total,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error('Request history fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's billing information
router.get('/billing', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        plan: true,
        stripeCustomerId: true,
        stripeSubscriptionId: true,
        createdAt: true,
      },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const billing = {
      currentPlan: user.plan,
      hasStripeCustomer: !!user.stripeCustomerId,
      hasActiveSubscription: !!user.stripeSubscriptionId,
      customerSince: user.createdAt,
    };

    res.json({ billing });
  } catch (error) {
    console.error('Billing fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export { router as dashboardRouter };
