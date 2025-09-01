import { prisma } from './database';
import { PlanType } from '../types';

export const seedDatabase = async () => {
  try {
    console.log('🌱 Seeding database...');

    // Seed plans
    const plans = [
      {
        type: PlanType.FREE,
        price: 0,
        apiRequests: 1000,
        rateLimit: 30,
        requestCost: 0.00000,
        access: 'all-feeds',
        support: 'Email & Community',
        isActive: true,
      },
      {
        type: PlanType.DEVELOPER,
        price: 50,
        apiRequests: 10000,
        rateLimit: 10,
        requestCost: 0.0005,
        access: 'all-feeds',
        support: '24/7 support',
        isActive: true,
      },
      {
        type: PlanType.PROFESSIONAL,
        price: 100,
        apiRequests: 100000,
        rateLimit: 2,
        requestCost: 0.0002,
        access: 'all-feeds + historical',
        support: '24/7 support',
        isActive: true,
      },
      {
        type: PlanType.ENTERPRISE,
        price: 0, // Custom pricing
        apiRequests: 999999999, // Unlimited
        rateLimit: 1, // Custom
        requestCost: 0.0001, // Custom
        access: 'all-feeds + private',
        support: 'Dedicated engineer',
        isActive: true,
      },
    ];

    for (const plan of plans) {
      await prisma.plan.upsert({
        where: { type: plan.type },
        update: plan,
        create: plan,
      });
    }

    console.log('✅ Plans seeded successfully');

    // Create admin user if it doesn't exist
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@yourdomain.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin_password_change_in_production';

    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (!existingAdmin) {
      const bcrypt = require('bcryptjs');
      const passwordHash = await bcrypt.hash(adminPassword, 12);

      await prisma.user.create({
        data: {
          name: 'Admin User',
          email: adminEmail,
          passwordHash,
          plan: PlanType.ENTERPRISE,
          requestsThisMonth: 0,
          adminAccess: true,
        },
      });

      console.log('✅ Admin user created successfully');
    } else {
      console.log('ℹ️ Admin user already exists');
    }

    console.log('🎉 Database seeding completed!');
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    throw error;
  }
};

// Run seeder if this file is executed directly
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('Seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seeding failed:', error);
      process.exit(1);
    });
}
