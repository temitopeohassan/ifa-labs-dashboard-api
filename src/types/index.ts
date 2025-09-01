export enum PlanType {
  FREE = 'FREE',
  DEVELOPER = 'DEVELOPER',
  PROFESSIONAL = 'PROFESSIONAL',
  ENTERPRISE = 'ENTERPRISE'
}

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  plan: PlanType;
  requestsThisMonth: number;
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
  adminAccess: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Plan {
  id: string;
  type: PlanType;
  price: number;
  apiRequests: number;
  rateLimit: number; // in seconds
  requestCost: number;
  access: string;
  support: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface RequestLog {
  id: string;
  userId: string;
  timestamp: Date;
  endpoint: string;
  status: number;
  responseTimeMs: number;
  cost: number;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface ChangePlanRequest {
  planType: PlanType;
}

export interface ApiProxyRequest {
  endpoint: string;
  method: string;
  headers?: Record<string, string>;
  body?: any;
}

export interface RateLimitInfo {
  remaining: number;
  resetTime: Date;
  limit: number;
}

export interface UserUsage {
  userId: string;
  plan: PlanType;
  requestsThisMonth: number;
  monthlyLimit: number;
  remaining: number;
  rateLimit: number;
}

export interface StripeWebhookEvent {
  id: string;
  type: string;
  data: {
    object: {
      id: string;
      customer: string;
      status: string;
      [key: string]: any;
    };
  };
}

export interface AdminUserStats {
  totalUsers: number;
  activeSubscriptions: number;
  totalRequests: number;
  revenue: number;
}
