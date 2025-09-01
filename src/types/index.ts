export enum PlanType {
  FREE = 'FREE',
  DEVELOPER = 'DEVELOPER',
  PROFESSIONAL = 'PROFESSIONAL'
}

export interface User {
  id: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  planType: PlanType;
  isActive: boolean;
  isAdmin: boolean;
  nowpaymentsCustomerId?: string | null;
  nowpaymentsSubscriptionId?: string | null;
  subscriptionStatus?: 'active' | 'canceled' | 'past_due' | 'unpaid' | null;
  currentPeriodStart?: Date | null;
  currentPeriodEnd?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Plan {
  id: string;
  type: PlanType;
  name: string;
  description: string;
  price: number;
  currency: string;
  features: string[];
  maxRequestsPerMonth: number;
  maxRequestsPerMinute: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface RequestLog {
  id: string;
  userId: string;
  endpoint: string;
  method: string;
  statusCode: number;
  responseTime: number;
  timestamp: Date;
  userAgent?: string;
  ipAddress?: string;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface ChangePlanRequest {
  planType: PlanType;
  paymentMethod: 'cryptocurrency';
  cryptoCurrency?: string;
}

export interface ApiProxyRequest {
  endpoint: string;
  method: string;
  headers?: Record<string, string>;
  body?: any;
}

export interface RateLimitInfo {
  remaining: number;
  reset: Date;
  limit: number;
}

export interface UserUsage {
  currentMonth: number;
  limit: number;
  resetDate: Date;
}

// NowPayments specific types
export interface NowPaymentsPayment {
  payment_id: string;
  payment_status: 'waiting' | 'confirming' | 'confirmed' | 'sending' | 'partially_paid' | 'finished' | 'failed' | 'refunded' | 'expired';
  pay_address: string;
  price_amount: number;
  price_currency: string;
  pay_amount: number;
  pay_currency: string;
  order_id?: string;
  order_description?: string;
  ipn_callback_url?: string;
  created_at: string;
  updated_at: string;
  purchase_id?: string;
  outcome_amount?: number;
  outcome_currency?: string;
}

export interface CreatePaymentRequest {
  price_amount: number;
  price_currency: string;
  pay_currency: string;
  order_id?: string;
  order_description?: string;
  ipn_callback_url?: string;
  case?: 'success' | 'failure';
}

export interface PaymentStatusResponse {
  payment_id: string;
  payment_status: string;
  pay_address: string;
  price_amount: number;
  price_currency: string;
  pay_amount: number;
  pay_currency: string;
  order_id?: string;
  order_description?: string;
  ipn_callback_url?: string;
  created_at: string;
  updated_at: string;
  purchase_id?: string;
  outcome_amount?: number;
  outcome_currency?: string;
}

export interface NowPaymentsWebhookEvent {
  payment_id: string;
  payment_status: string;
  pay_address: string;
  price_amount: number;
  price_currency: string;
  pay_amount: number;
  pay_currency: string;
  order_id?: string;
  order_description?: string;
  purchase_id?: string;
  outcome_amount?: number;
  outcome_currency?: string;
  created_at: string;
  updated_at: string;
}

export interface AdminUserStats {
  totalUsers: number;
  activeUsers: number;
  usersByPlan: Record<PlanType, number>;
  totalRequests: number;
  averageResponseTime: number;
}
