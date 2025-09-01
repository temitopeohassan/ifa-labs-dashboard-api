import { Router, Request, Response, NextFunction } from 'express';
import axios from 'axios';
import { prisma } from '../config/database';
import { authenticateToken } from '../middleware/auth';
import { planBasedRateLimit } from '../middleware/rateLimit';
import { golangApiClient } from '../config/golang-api';
import { PlanType } from '../types';

const router = Router();

// Middleware to log API requests
const logApiRequest = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const startTime = Date.now();
  
  // Override res.json to capture response data
  const originalJson = res.json;
  res.json = function(data) {
    const responseTime = Date.now() - startTime;
    
    // Log the request asynchronously
    logRequestToDatabase(req, res, responseTime, data).catch(console.error);
    
    return originalJson.call(this, data);
  };
  
  next();
};

// Log request to database
const logRequestToDatabase = async (
  req: Request, 
  res: Response, 
  responseTime: number, 
  responseData: any
): Promise<void> => {
  try {
    if (!req.user) return;

    const userId = req.user.id;
    const endpoint = req.originalUrl;
    const status = res.statusCode;
    
    // Calculate cost based on user's plan
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) return;

    const plan = await prisma.plan.findUnique({
      where: { type: user.plan as any }, // Type assertion for enum compatibility
    });

    if (!plan) return;

    const cost = plan.requestCost;

    await prisma.requestLog.create({
      data: {
        userId,
        endpoint,
        status,
        responseTimeMs: responseTime,
        cost,
      },
    });
  } catch (error) {
    console.error('Failed to log request:', error);
  }
};

// Generic API proxy endpoint
router.all('/*', 
  authenticateToken, 
  planBasedRateLimit, 
  logApiRequest,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const targetEndpoint = req.params[0];
      const method = req.method.toLowerCase();
      const headers = { ...req.headers };
      
      // Remove headers that shouldn't be forwarded
      delete headers.host;
      delete headers.authorization; // Don't forward our JWT to Golang API
      
      // Forward the request to Golang API
      const response = await golangApiClient.request({
        method,
        url: `/${targetEndpoint}`,
        headers,
        data: req.body,
        params: req.query,
      });

      // Forward the response
      res.status(response.status).json(response.data);
    } catch (error: any) {
      console.error('API proxy error:', error);
      
      if (error.response) {
        // Forward error response from Golang API
        res.status(error.response.status).json(error.response.data);
      } else {
        res.status(500).json({ 
          error: 'Failed to forward request to Golang API',
          message: error.message 
        });
      }
    }
  }
);

export { router as apiProxyRouter };
