import { Request, Response, NextFunction } from 'express';
import redisClient from '../config/redis';
import { prisma } from '../config/database';
import { PlanType } from '../types';

export const planBasedRateLimit = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const userId = req.user.id;
    const userPlan = req.user.plan;

    // Get plan details from database
    const plan = await prisma.plan.findUnique({
      where: { type: userPlan as any }, // Type assertion for enum compatibility
    });

    if (!plan) {
      res.status(500).json({ error: 'Plan configuration not found' });
      return;
    }

    // Check monthly request quota
    if (req.user.requestsThisMonth >= plan.apiRequests) {
      res.status(429).json({
        error: 'Monthly API request limit exceeded',
        limit: plan.apiRequests,
        used: req.user.requestsThisMonth,
        resetDate: new Date(new Date().setDate(1) + 24 * 60 * 60 * 1000), // First day of next month
      });
      return;
    }

    // Check rate limit using Redis
    const rateLimitKey = `rate_limit:${userId}`;
    const currentRequests = await redisClient.get(rateLimitKey);
    
    if (currentRequests && parseInt(currentRequests) >= 1) {
      res.status(429).json({
        error: 'Rate limit exceeded',
        retryAfter: plan.rateLimit,
      });
      return;
    }

    // Set rate limit in Redis
    await redisClient.setEx(rateLimitKey, plan.rateLimit, '1');

    // Increment monthly request counter
    await prisma.user.update({
      where: { id: userId },
      data: { requestsThisMonth: { increment: 1 } },
    });

    next();
  } catch (error) {
    console.error('Rate limiting error:', error);
    next(error);
  }
};

export const resetMonthlyQuota = async (): Promise<void> => {
  try {
    // Reset all users' monthly request count on the first day of each month
    await prisma.user.updateMany({
      data: { requestsThisMonth: 0 },
    });
    console.log('Monthly quota reset completed');
  } catch (error) {
    console.error('Failed to reset monthly quota:', error);
  }
};
