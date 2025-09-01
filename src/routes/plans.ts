import { Router, Request, Response, NextFunction } from 'express';
import { PlanType } from '../types';
import { prisma } from '../config/database';
import { authenticateToken } from '../middleware/auth';
import { nowpaymentsApi, NOWPAYMENTS_CONFIG } from '../config/nowpayments';
import { CreatePaymentRequest, ChangePlanRequest } from '../types';

const router = Router();

// Get all available plans
router.get('/', async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const plans = await prisma.plan.findMany({
      where: { isActive: true },
      orderBy: { price: 'asc' }
    });

    res.json({
      success: true,
      data: plans
    });
  } catch (error) {
    next(error);
  }
});

// Change user plan
router.post('/change', authenticateToken, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { planType, paymentMethod, cryptoCurrency }: ChangePlanRequest = req.body;
    const userId = (req as any).user.id;

    if (paymentMethod !== 'cryptocurrency') {
      res.status(400).json({
        success: false,
        message: 'Only cryptocurrency payments are supported'
      });
      return;
    }

    // Get the plan details
    const plan = await prisma.plan.findUnique({
      where: { type: planType }
    });

    if (!plan) {
      res.status(404).json({
        success: false,
        message: 'Plan not found'
      });
      return;
    }

    // If it's a free plan, update immediately
    if (plan.price === 0) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          planType: planType,
          subscriptionStatus: 'active',
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        }
      });

      res.json({
        success: true,
        message: 'Plan updated successfully',
        data: { planType, subscriptionStatus: 'active' }
      });
      return;
    }

    // For paid plans, create a NowPayments payment
    const paymentRequest: CreatePaymentRequest = {
      price_amount: plan.price,
      price_currency: plan.currency,
      pay_currency: cryptoCurrency || 'BTC',
      order_id: `${userId}_${Date.now()}`,
      order_description: `Upgrade to ${plan.name} plan`,
      ipn_callback_url: process.env.NOWPAYMENTS_WEBHOOK_URL,
    };

    const paymentResponse = await nowpaymentsApi.post('/payment', paymentRequest);

    if (paymentResponse.data.payment_id) {
      // Store payment information (you might want to create a Payment model)
      res.json({
        success: true,
        message: 'Payment created successfully',
        data: {
          paymentId: paymentResponse.data.payment_id,
          payAddress: paymentResponse.data.pay_address,
          payAmount: paymentResponse.data.pay_amount,
          payCurrency: paymentResponse.data.pay_currency,
          priceAmount: paymentResponse.data.price_amount,
          priceCurrency: paymentResponse.data.price_currency,
          orderId: paymentResponse.data.order_id,
          status: 'pending'
        }
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Failed to create payment'
      });
    }
  } catch (error) {
    next(error);
  }
});

// Get current user plan
router.get('/current', authenticateToken, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        requestLogs: {
          where: {
            timestamp: {
              gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
            }
          }
        }
      }
    });

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    const plan = await prisma.plan.findUnique({
      where: { type: user.planType }
    });

    const currentMonthRequests = user.requestLogs.length;
    const limit = plan?.maxRequestsPerMonth || 0;
    const remaining = Math.max(0, limit - currentMonthRequests);

    res.json({
      success: true,
      data: {
        currentPlan: plan,
        usage: {
          currentMonth: currentMonthRequests,
          limit: limit,
          remaining: remaining,
          resetDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1)
        },
        subscription: {
          status: user.subscriptionStatus,
          currentPeriodStart: user.currentPeriodStart,
          currentPeriodEnd: user.currentPeriodEnd
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

export { router as plansRouter };
