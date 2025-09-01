# OTP Verification Troubleshooting Guide

## Issue: OTP Verification Failing

The OTP is being sent successfully, but verification is failing. This guide will help you identify exactly where the verification process is breaking.

## 🔍 **Step-by-Step Debugging**

### **1. Check User Data and OTP**

Use the debug endpoint to see what's stored in the database:

```bash
# Replace 'user@example.com' with the actual email you're testing
curl http://localhost:3001/api/auth/debug/user/user@example.com
```

Expected response:
```json
{
  "success": true,
  "data": {
    "id": "abc123",
    "email": "user@example.com",
    "displayName": "Test User",
    "isEmailVerified": false,
    "isActive": false,
    "role": "user",
    "subscriptionPlan": "free",
    "hasOTP": true,
    "otpStored": "123456",
    "otpExpiresAt": "2025-09-01T11:30:00.000Z",
    "createdAt": "2025-09-01T11:20:00.000Z",
    "updatedAt": "2025-09-01T11:20:00.000Z"
  }
}
```

### **2. Check Server Logs During Verification**

When you try to verify the OTP, watch your server console for these messages:

```
OTP verification initiated for: { email: 'user@example.com', otp: '123456' }
Email and OTP validation passed
Looking for user with email: user@example.com
User found: { id: 'abc123', email: 'user@example.com', isEmailVerified: false, hasOTP: true, otpExpiresAt: Timestamp }
Email not verified, proceeding with OTP verification
Comparing OTPs - Received: 123456, Stored: 123456
OTP matches, checking expiration
OTP is valid and not expired, updating user
User updated successfully, sending verification success email
Verification success email sent
```

**If any message is missing, that's where the failure occurs.**

### **3. Common Issues and Solutions**

#### **Issue A: User Not Found**
**Symptoms**: "User not found" error
**Causes**:
- Email doesn't match exactly (case sensitivity, spaces)
- User was deleted after signup
- Database connection issues

**Solutions**:
1. **Check email case** - Make sure it matches exactly
2. **Verify user exists** using the debug endpoint
3. **Check database connection**

#### **Issue B: Invalid OTP**
**Symptoms**: "Invalid OTP" error
**Causes**:
- OTP mismatch between sent and stored
- OTP was cleared or overwritten
- Database update issues

**Solutions**:
1. **Compare OTPs** - Check what's stored vs. what's received
2. **Verify OTP format** - Should be 6 digits
3. **Check for multiple signup attempts** - Each attempt generates a new OTP

#### **Issue C: OTP Expired**
**Symptoms**: "OTP has expired" error
**Causes**:
- OTP expired (10 minutes)
- Clock synchronization issues
- Database timestamp problems

**Solutions**:
1. **Check OTP expiration time** in debug response
2. **Verify server clock** is correct
3. **Request new OTP** if expired

#### **Issue D: Email Already Verified**
**Symptoms**: "Email already verified" error
**Causes**:
- User already completed verification
- Database state inconsistency

**Solutions**:
1. **Check verification status** in debug response
2. **Proceed to password setup** if already verified
3. **Check database consistency**

### **4. Debug Commands**

#### **Check User Data**
```bash
curl http://localhost:3001/api/auth/debug/user/your-email@example.com
```

#### **Test OTP Generation**
```bash
curl http://localhost:3001/api/auth/test-otp
```

#### **Check Server Status**
```bash
curl http://localhost:3001/api/health
```

### **5. Data Verification Checklist**

- [ ] User exists in database
- [ ] OTP is stored correctly
- [ ] OTP hasn't expired
- [ ] Email not already verified
- [ ] OTP matches exactly
- [ ] Database update succeeds
- [ ] Success email is sent

### **6. Frontend Verification**

Make sure your frontend is sending the correct data:

```javascript
// Check the request payload
const response = await fetch('/api/auth/signup/verify-email', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'user@example.com', // Must match exactly
    otp: '123456'             // Must match exactly
  })
});
```

### **7. Database Inspection**

If you have access to Firebase Console:

1. **Go to Firestore Database**
2. **Navigate to `users` collection**
3. **Find your user document**
4. **Check these fields**:
   - `emailVerificationOTP`
   - `emailVerificationExpiresAt`
   - `isEmailVerified`

### **8. Common Debugging Steps**

1. **Use debug endpoint** to see user data
2. **Check server logs** during verification
3. **Verify OTP format** (6 digits)
4. **Check email case sensitivity**
5. **Verify database state**
6. **Test with fresh OTP**

## 🚨 **Troubleshooting Flow**

1. **Run debug endpoint** to see user data
2. **Try verification** and watch server logs
3. **Identify failure point** from logs
4. **Apply specific fix** for that issue
5. **Test again** with same or new OTP

## ❓ **Still Having Issues?**

If the debug endpoint and logs don't reveal the problem:

1. **Share the debug endpoint response**
2. **Share the complete server logs** during verification
3. **Check if the issue is consistent** or intermittent
4. **Verify frontend request payload**

**Start with the debug endpoint to see what's stored in the database!**
