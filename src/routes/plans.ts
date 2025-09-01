import { Router, Request, Response } from 'express';
import { prisma } from '../config/database';
import { stripe, STRIPE_PRICES } from '../config/stripe';
import { authenticateToken } from '../middleware/auth';
import { ChangePlanRequest, PlanType } from '../types';

const router = Router();

// Get all available plans
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const plans = await prisma.plan.findMany({
      where: { isActive: true },
      orderBy: { price: 'asc' },
    });

    res.json({ plans });
  } catch (error) {
    console.error('Plans fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Change user plan
router.post('/change', authenticateToken, async (req: Request<{}, {}, ChangePlanRequest>, res: Response): Promise<void> => {
  try {
    const { planType } = req.body;
    const userId = req.user!.id;

    // Validate plan type
    if (!Object.values(PlanType).includes(planType)) {
      res.status(400).json({ error: 'Invalid plan type' });
      return;
    }

    // Get current user
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Get plan details
    const plan = await prisma.plan.findUnique({
      where: { type: planType as any }, // Type assertion for enum compatibility
    });

    if (!plan) {
      res.status(404).json({ error: 'Plan not found' });
      return;
    }

    // Handle different plan types
    if (planType === PlanType.FREE) {
      // Downgrade to free plan
      await prisma.user.update({
        where: { id: userId },
        data: {
          plan: PlanType.FREE as any, // Type assertion for enum compatibility
          stripeSubscriptionId: null,
        },
      });

      res.json({
        message: 'Plan changed to FREE successfully',
        plan: planType,
      });
      return;
    }

    // For paid plans, handle Stripe subscription
    if (!user.stripeCustomerId) {
      res.status(400).json({ error: 'Stripe customer not found. Please contact support.' });
      return;
    }

    // Cancel existing subscription if any
    if (user.stripeSubscriptionId) {
      try {
        await stripe.subscriptions.update(user.stripeSubscriptionId, {
          cancel_at_period_end: true,
        });
      } catch (error) {
        console.error('Error canceling existing subscription:', error);
      }
    }

    // Create new subscription
    const priceId = STRIPE_PRICES[planType as keyof typeof STRIPE_PRICES];
    if (!priceId) {
      res.status(500).json({ error: 'Plan price not configured' });
      return;
    }

    const subscription = await stripe.subscriptions.create({
      customer: user.stripeCustomerId,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
    });

    // Update user plan
    await prisma.user.update({
      where: { id: userId },
      data: {
        plan: planType as any, // Type assertion for enum compatibility
        stripeSubscriptionId: subscription.id,
      },
    });

    res.json({
      message: `Plan changed to ${planType} successfully`,
      plan: planType,
      subscription: {
        id: subscription.id,
        status: subscription.status,
        current_period_end: subscription.current_period_end,
      },
    });
  } catch (error) {
    console.error('Plan change error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get current user's plan details
router.get('/current', authenticateToken, async (req: Request, res: Response): Promise<void> => {
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
        },
      },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const plan = await prisma.plan.findUnique({
      where: { type: user.plan as any }, // Type assertion for enum compatibility
    });

    if (!plan) {
      res.status(404).json({ error: 'Plan not found' });
      return;
    }

    const usage = {
      plan: user.plan,
      monthlyLimit: plan.apiRequests,
      used: user.requestsThisMonth,
      remaining: Math.max(0, plan.apiRequests - user.requestsThisMonth),
      rateLimit: plan.rateLimit,
      price: plan.price,
      access: plan.access,
      support: plan.support,
    };

    res.json({ usage });
  } catch (error) {
    console.error('Current plan fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export { router as plansRouter };
