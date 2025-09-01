import { PrismaClient, PlanType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');

    // Create plans
    const plans = [
      {
        type: PlanType.FREE,
        name: 'Free Plan',
        description: 'Basic access with limited features',
        price: 0,
        currency: 'USD',
        features: [
          '100 API requests per month',
          'Basic support',
          'Standard response time'
        ],
        maxRequestsPerMonth: 100,
        maxRequestsPerMinute: 5,
        isActive: true
      },
      {
        type: PlanType.DEVELOPER,
        name: 'Developer Plan',
        description: 'Perfect for developers and small projects',
        price: 50,
        currency: 'USD',
        features: [
          '10,000 API requests per month',
          'Priority support',
          'Faster response time',
          'Advanced analytics',
          'Webhook notifications'
        ],
        maxRequestsPerMonth: 10000,
        maxRequestsPerMinute: 50,
        isActive: true
      },
      {
        type: PlanType.PROFESSIONAL,
        name: 'Professional Plan',
        description: 'Enterprise-grade features for professional use',
        price: 100,
        currency: 'USD',
        features: [
          '100,000 API requests per month',
          '24/7 priority support',
          'Fastest response time',
          'Advanced analytics dashboard',
          'Custom webhook endpoints',
          'Rate limit customization',
          'Dedicated account manager'
        ],
        maxRequestsPerMonth: 100000,
        maxRequestsPerMinute: 200,
        isActive: true
      }
    ];

    console.log('📋 Creating plans...');
    for (const planData of plans) {
      const existingPlan = await prisma.plan.findUnique({
        where: { type: planData.type }
      });

      if (!existingPlan) {
        await prisma.plan.create({
          data: planData
        });
        console.log(`✅ Created ${planData.name}`);
      } else {
        await prisma.plan.update({
          where: { type: planData.type },
          data: planData
        });
        console.log(`🔄 Updated ${planData.name}`);
      }
    }

    // Create admin user if it doesn't exist
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@yourdomain.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin_password_change_in_production';

    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail }
    });

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash(adminPassword, 12);
      
      await prisma.user.create({
        data: {
          email: adminEmail,
          password: hashedPassword,
          firstName: 'Admin',
          lastName: 'User',
          planType: PlanType.PROFESSIONAL,
          isActive: true,
          isAdmin: true,
          subscriptionStatus: 'active',
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
        }
      });
      console.log('👑 Created admin user');
    } else {
      console.log('👑 Admin user already exists');
    }

    console.log('🎉 Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('✅ Seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seeding failed:', error);
      process.exit(1);
    });
}

export { seedDatabase };
