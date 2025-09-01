# JWT Token Configuration Guide

## Overview

The IFA Labs system uses **separate JWT tokens** for different services to maintain security boundaries and prevent cross-service authentication issues.

## JWT Token Types

### 1. Dashboard JWT (`DASHBOARD_JWT`)
- **Purpose**: Dashboard authentication and API access
- **Storage**: Frontend localStorage as `DASHBOARD_JWT`
- **Backend Secret**: `DASHBOARD_JWT_SECRET` environment variable
- **Expiration**: 7 days
- **Usage**: All dashboard API endpoints (`/api/auth/*`, `/api/dashboard/*`)

### 2. Oracle Engine JWT (`ORACLE_ENGINE_JWT`)
- **Purpose**: Oracle engine operations and integration
- **Storage**: TBD (when Oracle engine is implemented)
- **Backend Secret**: `ORACLE_ENGINE_JWT_SECRET` environment variable
- **Expiration**: TBD
- **Usage**: Oracle engine specific endpoints

## Configuration

### Environment Variables

```env
# Dashboard JWT Configuration
DASHBOARD_JWT_SECRET=your-super-secret-dashboard-jwt-key-change-in-production

# Oracle Engine JWT Configuration (when implemented)
ORACLE_ENGINE_JWT_SECRET=your-super-secret-oracle-engine-jwt-key-change-in-production
```

### Frontend Configuration

The dashboard frontend stores the JWT token as:
```typescript
// Store token
localStorage.setItem('DASHBOARD_JWT', token);

// Retrieve token
const token = localStorage.getItem('DASHBOARD_JWT');

// Remove token
localStorage.removeItem('DASHBOARD_JWT');
```

### Backend Configuration

The backend API validates tokens using the appropriate secret:
```typescript
// Dashboard JWT validation
const decodedToken = JWTService.verifyToken(token, DASHBOARD_JWT_SECRET);

// Oracle Engine JWT validation (when implemented)
const oracleToken = OracleJWTService.verifyToken(token, ORACLE_ENGINE_JWT_SECRET);
```

## Security Benefits

### 1. **Service Isolation**
- Dashboard and Oracle Engine maintain separate authentication contexts
- Compromised token in one service doesn't affect the other
- Clear audit trail for each service

### 2. **Access Control**
- Different expiration policies for different services
- Service-specific permissions and roles
- Granular security controls

### 3. **Token Management**
- Independent token refresh cycles
- Service-specific token revocation
- Easier debugging and monitoring

## Implementation Details

### Dashboard JWT Service
```typescript
// src/services/jwtService.ts
export class JWTService {
  static generateToken(payload: JWTPayload): string {
    return jwt.sign(payload, DASHBOARD_JWT_SECRET, { 
      expiresIn: DASHBOARD_JWT_EXPIRES_IN 
    });
  }

  static verifyToken(token: string): JWTPayload | null {
    try {
      return jwt.verify(token, DASHBOARD_JWT_SECRET) as JWTPayload;
    } catch (error) {
      return null;
    }
  }
}
```

### Oracle Engine JWT Service (Future Implementation)
```typescript
// src/services/oracleJwtService.ts (when implemented)
export class OracleJWTService {
  static generateToken(payload: OracleJWTPayload): string {
    return jwt.sign(payload, ORACLE_ENGINE_JWT_SECRET, { 
      expiresIn: ORACLE_ENGINE_JWT_EXPIRES_IN 
    });
  }

  static verifyToken(token: string): OracleJWTPayload | null {
    try {
      return jwt.verify(token, ORACLE_ENGINE_JWT_SECRET) as OracleJWTPayload;
    } catch (error) {
      return null;
    }
  }
}
```

## Migration Guide

### From Generic JWT to Service-Specific JWT

1. **Update Environment Variables**
   ```bash
   # Old
   JWT_SECRET=your-secret-key
   
   # New
   DASHBOARD_JWT_SECRET=your-dashboard-secret-key
   ORACLE_ENGINE_JWT_SECRET=your-oracle-engine-secret-key
   ```

2. **Update Backend Code**
   - Replace `JWT_SECRET` with `DASHBOARD_JWT_SECRET`
   - Update JWT service references
   - Implement Oracle Engine JWT service when needed

3. **Update Frontend Code**
   - Change localStorage key from `auth_token` to `DASHBOARD_JWT`
   - Update API service token handling

4. **Test Authentication Flow**
   - Verify dashboard login/logout works
   - Ensure token validation is working
   - Test token expiration handling

## Best Practices

### 1. **Secret Management**
- Use strong, unique secrets for each service
- Store secrets in environment variables, not in code
- Rotate secrets regularly in production

### 2. **Token Validation**
- Always verify token signature and expiration
- Implement proper error handling for invalid tokens
- Log authentication failures for security monitoring

### 3. **Token Storage**
- Use secure storage mechanisms (localStorage for frontend)
- Implement token refresh mechanisms
- Handle token expiration gracefully

### 4. **Monitoring and Logging**
- Log JWT-related events for security auditing
- Monitor token usage patterns
- Alert on suspicious authentication activities

## Troubleshooting

### Common Issues

1. **"Invalid token" errors**
   - Check if using correct JWT secret
   - Verify token hasn't expired
   - Ensure token is for the correct service

2. **Authentication failures**
   - Verify environment variables are set correctly
   - Check token format in Authorization header
   - Ensure frontend is sending correct token key

3. **Token expiration issues**
   - Check token expiration configuration
   - Implement proper token refresh logic
   - Handle expired tokens gracefully

### Debug Steps

1. **Check Environment Variables**
   ```bash
   echo $DASHBOARD_JWT_SECRET
   echo $ORACLE_ENGINE_JWT_SECRET
   ```

2. **Verify Token Format**
   ```bash
   # Decode JWT token (without verification)
   jwt decode <your-token>
   ```

3. **Check Backend Logs**
   - Look for JWT validation errors
   - Verify secret is being loaded correctly
   - Check token expiration handling

## Future Enhancements

### 1. **Token Refresh Endpoints**
- Implement automatic token refresh
- Handle token rotation securely
- Support for refresh token rotation

### 2. **Advanced Token Features**
- Token scoping and permissions
- Service-specific token claims
- Token revocation lists

### 3. **Monitoring and Analytics**
- Token usage analytics
- Authentication pattern analysis
- Security threat detection
