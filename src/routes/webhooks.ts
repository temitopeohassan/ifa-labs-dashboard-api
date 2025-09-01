import { Router, Request, Response } from 'express';
import { stripe } from '../config/stripe';
import { prisma } from '../config/database';
import { StripeWebhookEvent } from '../types';

const router = Router();

// Stripe webhook handler
router.post('/stripe', async (req: Request, res: Response): Promise<void> => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !endpointSecret) {
    res.status(400).json({ error: 'Missing signature or webhook secret' });
    return;
  }

  let event: any; // Use any for Stripe event type

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    res.status(400).json({ error: 'Invalid signature' });
    return;
  }

  try {
    switch (event.type) {
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event);
        break;
      
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event);
        break;
      
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event);
        break;
      
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event);
        break;
      
      case 'invoice.payment_failed':
        await handlePaymentFailed(event);
        break;
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
});

// Handle subscription creation
const handleSubscriptionCreated = async (event: any): Promise<void> => {
  const subscription = event.data.object;
  const customerId = subscription.customer as string;

  // Find user by Stripe customer ID
  const user = await prisma.user.findUnique({
    where: { stripeCustomerId: customerId },
  });

  if (!user) {
    console.error('User not found for customer:', customerId);
    return;
  }

  // Update user's subscription ID
  await prisma.user.update({
    where: { id: user.id },
    data: { stripeSubscriptionId: subscription.id },
  });

  console.log(`Subscription created for user ${user.id}: ${subscription.id}`);
};

// Handle subscription updates
const handleSubscriptionUpdated = async (event: any): Promise<void> => {
  const subscription = event.data.object;
  const customerId = subscription.customer as string;

  // Find user by Stripe customer ID
  const user = await prisma.user.findUnique({
    where: { stripeCustomerId: customerId },
  });

  if (!user) {
    console.error('User not found for customer:', customerId);
    return;
  }

  // Update subscription status
  await prisma.user.update({
    where: { id: user.id },
    data: { stripeSubscriptionId: subscription.id },
  });

  console.log(`Subscription updated for user ${user.id}: ${subscription.id}`);
};

// Handle subscription deletion
const handleSubscriptionDeleted = async (event: any): Promise<void> => {
  const subscription = event.data.object;
  const customerId = subscription.customer as string;

  // Find user by Stripe customer ID
  const user = await prisma.user.findUnique({
    where: { stripeCustomerId: customerId },
  });

  if (!user) {
    console.error('User not found for customer:', customerId);
    return;
  }

  // Downgrade user to FREE plan
  await prisma.user.update({
    where: { id: user.id },
    data: {
      plan: 'FREE' as any, // Type assertion for enum compatibility
      stripeSubscriptionId: null,
    },
  });

  console.log(`User ${user.id} downgraded to FREE plan due to subscription deletion`);
};

// Handle successful payment
const handlePaymentSucceeded = async (event: any): Promise<void> => {
  const invoice = event.data.object;
  const customerId = invoice.customer as string;

  // Find user by Stripe customer ID
  const user = await prisma.user.findUnique({
    where: { stripeCustomerId: customerId },
  });

  if (!user) {
    console.error('User not found for customer:', customerId);
    return;
  }

  console.log(`Payment succeeded for user ${user.id}: ${invoice.id}`);
};

// Handle failed payment
const handlePaymentFailed = async (event: any): Promise<void> => {
  const invoice = event.data.object;
  const customerId = invoice.customer as string;

  // Find user by Stripe customer ID
  const user = await prisma.user.findUnique({
    where: { stripeCustomerId: customerId },
  });

  if (!user) {
    console.error('User not found for customer:', customerId);
    return;
  }

  // Downgrade user to FREE plan after payment failure
  await prisma.user.update({
    where: { id: user.id },
    data: {
      plan: 'FREE' as any, // Type assertion for enum compatibility
      stripeSubscriptionId: null,
    },
  });

  console.log(`User ${user.id} downgraded to FREE plan due to payment failure`);
};

export { router as webhooksRouter };
