# 🔐 JWT Configuration Guide

This document explains the JWT token management in your API Gateway Backend, which uses **separate JWT secrets** for different purposes.

## 🎯 JWT Token Separation

Your project uses **two separate JWT systems** to maintain security and separation of concerns:

### 1. **Dashboard JWT** (`DASHBOARD_JWT_SECRET`)
- **Purpose**: Authentication for the API Gateway Backend dashboard
- **Scope**: User management, subscription plans, admin panel
- **Expiration**: 7 days
- **Used by**: Express.js API Gateway

### 2. **Golang API JWT** (Separate system)
- **Purpose**: Authentication for the backend Golang API server
- **Scope**: Data access, business logic, core functionality
- **Expiration**: Configured by Golang API
- **Used by**: Golang backend server

## 🔧 Configuration

### Environment Variables

```bash
# Dashboard JWT (API Gateway)
DASHBOARD_JWT_SECRET=your-super-secret-dashboard-jwt-key-change-in-production

# Golang API JWT (configured separately in Golang server)
# This is NOT configured in this project
```

### Dashboard JWT Usage

The `DASHBOARD_JWT_SECRET` is used in the following places:

1. **User Registration** (`/api/auth/register`)
   - Signs JWT tokens for new users
   - Token contains: `{ userId, email }`

2. **User Login** (`/api/auth/login`)
   - Signs JWT tokens for authenticated users
   - Token contains: `{ userId, email }`

3. **Authentication Middleware** (`src/middleware/auth.ts`)
   - Verifies JWT tokens in protected routes
   - Extracts user information for request processing

4. **Protected Routes**
   - All routes requiring authentication use this JWT
   - Admin routes also use this JWT for authorization

## 🛡️ Security Features

### Token Structure
```typescript
interface DashboardJWTPayload {
  userId: string;
  email: string;
  iat: number;  // Issued at
  exp: number;  // Expiration
}
```

### Security Measures
- **Secret Key**: 256-bit minimum recommended
- **Expiration**: 7 days (configurable)
- **Algorithm**: HS256 (HMAC SHA-256)
- **Token Rotation**: Implemented on login/logout

## 🔄 Token Flow

### 1. **User Authentication Flow**
```
User Login → Validate Credentials → Generate JWT → Return Token
```

### 2. **Protected Route Access**
```
Request with JWT → Verify Token → Extract User Info → Process Request
```

### 3. **Token Refresh**
```
Token Expired → Re-authenticate → Generate New JWT → Update Client
```

## 📍 Implementation Details

### JWT Generation (Auth Routes)
```typescript
const token = jwt.sign(
  { userId: user.id, email: user.email },
  process.env.DASHBOARD_JWT_SECRET!,
  { expiresIn: '7d' }
);
```

### JWT Verification (Middleware)
```typescript
const decoded = jwt.verify(
  token, 
  process.env.DASHBOARD_JWT_SECRET!
) as { userId: string };
```

### Protected Route Example
```typescript
router.get('/dashboard', authenticateToken, async (req, res) => {
  // req.user is populated by authenticateToken middleware
  const userId = req.user!.id;
  // ... process request
});
```

## 🔒 Best Practices

### 1. **Environment Variables**
- Never commit JWT secrets to version control
- Use different secrets for development/staging/production
- Rotate secrets regularly

### 2. **Token Management**
- Set appropriate expiration times
- Implement token refresh mechanisms
- Log token usage for security monitoring

### 3. **Security Headers**
- Use HTTPS in production
- Set secure cookie flags
- Implement CSRF protection

## 🚨 Troubleshooting

### Common Issues

#### 1. **"Invalid token" errors**
- Check if `DASHBOARD_JWT_SECRET` is set correctly
- Verify token hasn't expired
- Ensure token format is correct

#### 2. **"JWT_SECRET is required" errors**
- Environment variable name changed from `JWT_SECRET` to `DASHBOARD_JWT_SECRET`
- Update your `.env` file accordingly

#### 3. **Token verification failures**
- Check if secret keys match between services
- Verify token signature algorithm
- Check token expiration

### Debugging Steps
1. **Check environment variables**
2. **Verify token format**
3. **Check token expiration**
4. **Validate secret key**
5. **Check middleware order**

## 🔄 Migration from JWT_SECRET

If you were previously using `JWT_SECRET`, update your configuration:

### Before
```bash
JWT_SECRET=your-secret-key
```

### After
```bash
DASHBOARD_JWT_SECRET=your-super-secret-dashboard-jwt-key-change-in-production
```

### Update Code References
```typescript
// Old
process.env.JWT_SECRET

// New
process.env.DASHBOARD_JWT_SECRET
```

## 📋 Checklist

- [ ] Set `DASHBOARD_JWT_SECRET` in `.env`
- [ ] Update production environment variables
- [ ] Test authentication endpoints
- [ ] Verify protected routes work
- [ ] Check admin access functionality
- [ ] Update deployment configurations

## 🎯 Next Steps

1. **Set your JWT secret** in environment variables
2. **Test authentication flow** locally
3. **Update production environment** variables
4. **Monitor token usage** and security
5. **Implement token refresh** if needed

---

🔐 **Remember**: Keep your JWT secrets secure and never expose them in client-side code or logs.
