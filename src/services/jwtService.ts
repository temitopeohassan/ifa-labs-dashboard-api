import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const DASHBOARD_JWT_SECRET = process.env['DASHBOARD_JWT_SECRET'] || 'your-super-secret-dashboard-jwt-key-change-in-production';
const DASHBOARD_JWT_EXPIRES_IN = '7d'; // 7 days as requested
const OTP_EXPIRES_IN = '10m'; // 10 minutes for OTP

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  subscriptionPlan: string;
  iat: number;
  exp: number;
}

export interface OTPPayload {
  email: string;
  purpose: 'signup' | 'login' | 'password-reset';
  iat: number;
  exp: number;
}

export class JWTService {
  // Generate JWT token for authenticated user
  static generateToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
    return jwt.sign(payload, DASHBOARD_JWT_SECRET, { expiresIn: DASHBOARD_JWT_EXPIRES_IN });
  }

  // Generate OTP token (short-lived)
  static generateOTPToken(email: string, purpose: 'signup' | 'login' | 'password-reset'): string {
    return jwt.sign({ email, purpose }, DASHBOARD_JWT_SECRET, { expiresIn: OTP_EXPIRES_IN });
  }

  // Verify JWT token
  static verifyToken(token: string): JWTPayload | null {
    try {
      return jwt.verify(token, DASHBOARD_JWT_SECRET) as JWTPayload;
    } catch (error) {
      return null;
    }
  }

  // Verify OTP token
  static verifyOTPToken(token: string): OTPPayload | null {
    try {
      return jwt.verify(token, DASHBOARD_JWT_SECRET) as OTPPayload;
    } catch (error) {
      return null;
    }
  }

  // Hash password
  static async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }

  // Compare password
  static async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  // Generate random OTP (6 digits)
  static generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Check if token is expired
  static isTokenExpired(token: string): boolean {
    try {
      const decoded = jwt.decode(token) as any;
      if (!decoded || !decoded.exp) return true;
      
      const currentTime = Math.floor(Date.now() / 1000);
      return decoded.exp < currentTime;
    } catch (error) {
      return true;
    }
  }

  // Get token expiration time
  static getTokenExpiration(token: string): Date | null {
    try {
      const decoded = jwt.decode(token) as any;
      if (!decoded || !decoded.exp) return null;
      
      return new Date(decoded.exp * 1000);
    } catch (error) {
      return null;
    }
  }

  // Refresh token (generate new token with same payload but new expiration)
  static refreshToken(oldToken: string): string | null {
    try {
      const decoded = jwt.verify(oldToken, DASHBOARD_JWT_SECRET) as JWTPayload;
      const { iat, exp, ...payload } = decoded;
      
      return this.generateToken(payload);
    } catch (error) {
      return null;
    }
  }
}

export default JWTService;
