import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/database';
import { User } from '../types';

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      res.status(401).json({ error: 'Access token required' });
      return;
    }

    const decoded = jwt.verify(token, process.env.DASHBOARD_JWT_SECRET!) as { userId: string };
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      res.status(401).json({ error: 'Invalid token' });
      return;
    }

    // Convert Prisma user to our User type
    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      passwordHash: user.passwordHash,
      plan: user.plan as any, // Type assertion for enum compatibility
      requestsThisMonth: user.requestsThisMonth,
      stripeCustomerId: user.stripeCustomerId,
      stripeSubscriptionId: user.stripeSubscriptionId,
      adminAccess: user.adminAccess,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    next();
  } catch (error) {
    res.status(403).json({ error: 'Invalid token' });
    return;
  }
};

export const requireAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user?.adminAccess) {
    res.status(403).json({ error: 'Admin access required' });
    return;
  }
  next();
};
