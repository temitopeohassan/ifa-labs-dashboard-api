import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { NOWPAYMENTS_CONFIG } from '../config/nowpayments';
import { NowPaymentsWebhookEvent } from '../types';
import crypto from 'crypto';

const router = Router();

// NowPayments IPN (Instant Payment Notification) webhook
router.post('/nowpayments', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const signature = req.headers['x-nowpayments-sig'] as string;
    const body = req.body;

    // Verify webhook signature
    if (!verifyNowPaymentsSignature(body, signature)) {
      res.status(400).json({
        success: false,
        message: 'Invalid signature'
      });
      return;
    }

    const webhookEvent: NowPaymentsWebhookEvent = body;

    // Handle different payment statuses
    switch (webhookEvent.payment_status) {
      case 'finished':
        await handlePaymentFinished(webhookEvent);
        break;
      case 'confirmed':
        await handlePaymentConfirmed(webhookEvent);
        break;
      case 'failed':
        await handlePaymentFailed(webhookEvent);
        break;
      case 'expired':
        await handlePaymentExpired(webhookEvent);
        break;
      default:
        console.log(`Unhandled payment status: ${webhookEvent.payment_status}`);
    }

    res.json({ success: true, message: 'Webhook processed successfully' });
  } catch (error) {
    next(error);
  }
});

// Verify NowPayments webhook signature
function verifyNowPaymentsSignature(body: any, signature: string): boolean {
  if (!NOWPAYMENTS_CONFIG.IPN_SECRET) {
    console.warn('IPN secret not configured, skipping signature verification');
    return true;
  }

  const payload = JSON.stringify(body);
  const expectedSignature = crypto
    .createHmac('sha256', NOWPAYMENTS_CONFIG.IPN_SECRET)
    .update(payload)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(signature, 'hex'),
    Buffer.from(expectedSignature, 'hex')
  );
}

// Handle successful payment
async function handlePaymentFinished(webhookEvent: NowPaymentsWebhookEvent): Promise<void> {
  try {
    const { order_id, payment_id } = webhookEvent;

    if (!order_id) {
      console.error('No order_id in webhook event');
      return;
    }

    // Extract user ID from order_id (format: userId_timestamp)
    const userId = order_id.split('_')[0];

    // Find the user
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      console.error(`User not found for order_id: ${order_id}`);
      return;
    }

    // Update user subscription
    await prisma.user.update({
      where: { id: userId },
      data: {
        subscriptionStatus: 'active',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        nowpaymentsSubscriptionId: payment_id
      }
    });

    console.log(`Payment finished for user ${userId}, subscription activated`);
  } catch (error) {
    console.error('Error handling payment finished:', error);
  }
}

// Handle confirmed payment (payment received but not yet finished)
async function handlePaymentConfirmed(webhookEvent: NowPaymentsWebhookEvent): Promise<void> {
  try {
    const { payment_id, order_id } = webhookEvent;
    console.log(`Payment confirmed for order ${order_id}, payment_id: ${payment_id}`);
    
    // You might want to update payment status in your database
    // or send confirmation email to user
  } catch (error) {
    console.error('Error handling payment confirmed:', error);
  }
}

// Handle failed payment
async function handlePaymentFailed(webhookEvent: NowPaymentsWebhookEvent): Promise<void> {
  try {
    const { payment_id, order_id } = webhookEvent;
    console.log(`Payment failed for order ${order_id}, payment_id: ${payment_id}`);
    
    // You might want to update payment status in your database
    // or send failure notification to user
  } catch (error) {
    console.error('Error handling payment failed:', error);
  }
}

// Handle expired payment
async function handlePaymentExpired(webhookEvent: NowPaymentsWebhookEvent): Promise<void> {
  try {
    const { payment_id, order_id } = webhookEvent;
    console.log(`Payment expired for order ${order_id}, payment_id: ${payment_id}`);
    
    // You might want to update payment status in your database
    // or send expiration notification to user
  } catch (error) {
    console.error('Error handling payment expired:', error);
  }
}

export { router as webhooksRouter };
