# Signup Troubleshooting Guide

## Issue: "Failed to initiate signup. Please try again."

The signup endpoint is returning a 500 error. This guide will help you identify exactly where the failure occurs.

## 🔍 **Step-by-Step Debugging**

### **1. Test Individual Components**

Use these debug endpoints to test each part of the signup process:

#### **Test Email Service**
```bash
curl http://localhost:3001/api/auth/test-email
```

Expected response:
```json
{
  "success": true,
  "data": {
    "message": "Email service test completed",
    "connectionWorking": true,
    "smtpConfig": {
      "host": "smtp.gmail.com",
      "port": "587",
      "user": "***@gmail.com",
      "from": "noreply@ifalabs.com"
    }
  }
}
```

#### **Test Firebase Connection**
```bash
curl http://localhost:3001/api/auth/test-firebase
```

Expected response:
```json
{
  "success": true,
  "data": {
    "message": "Firebase connection test successful",
    "testDocumentCreated": true
  }
}
```

#### **Test OTP Generation**
```bash
curl http://localhost:3001/api/auth/test-otp
```

Expected response:
```json
{
  "success": true,
  "data": {
    "message": "OTP generation test successful",
    "otp": "123456",
    "otpLength": 6
  }
}
```

### **2. Check Server Logs**

When you try to signup, look for these log messages in your server console:

```
Signup initiated for: { email: 'test@example.com', displayName: 'Test User' }
Email validation passed
User does not exist, proceeding with creation
OTP generated: 123456
User created successfully with ID: abc123
Attempting to send OTP email to: test@example.com
Email sent successfully
```

If any of these messages are missing, that's where the failure occurs.

### **3. Common Issues and Solutions**

#### **Issue A: Email Service Test Fails**
**Symptoms**: `test-email` endpoint returns `connectionWorking: false`
**Causes**:
- Invalid SMTP credentials
- Gmail 2FA not enabled
- App password not generated
- Firewall blocking SMTP

**Solutions**:
1. **Enable 2FA on Gmail account**
2. **Generate App Password**:
   - Go to Google Account → Security → 2-Step Verification
   - Click "App passwords"
   - Generate password for "Mail"
3. **Use App Password in .env**:
   ```env
   SMTP_PASS=your-16-character-app-password
   ```

#### **Issue B: Firebase Test Fails**
**Symptoms**: `test-firebase` endpoint returns error
**Causes**:
- Firebase project not configured
- Service account key invalid
- Firestore rules blocking writes

**Solutions**:
1. **Check Firebase project ID** in `.env`
2. **Verify service account key** is valid JSON
3. **Check Firestore rules** allow writes

#### **Issue C: OTP Generation Fails**
**Symptoms**: `test-otp` endpoint returns error
**Causes**:
- JWT service configuration issue
- Environment variables missing

**Solutions**:
1. **Check `DASHBOARD_JWT_SECRET`** is set in `.env`
2. **Verify JWT service imports** are correct

### **4. Test Signup with Debug Logging**

After fixing any component issues, try the signup again and watch the console logs:

```bash
# In your frontend, try to signup
# Watch the server console for detailed logs
```

### **5. Gmail SMTP Setup**

If email is the issue, here's the complete Gmail setup:

1. **Enable 2-Step Verification** on your Google account
2. **Generate App Password**:
   - Go to Google Account → Security → 2-Step Verification
   - Click "App passwords"
   - Select "Mail" and "Other (Custom name)"
   - Name it "IFA Labs Dashboard"
   - Copy the 16-character password
3. **Update .env**:
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=afrobankhq@gmail.com
   SMTP_PASS=your-16-character-app-password
   SMTP_FROM=noreply@ifalabs.com
   ```

### **6. Alternative: Use Different Email Service**

If Gmail continues to cause issues, consider using:

- **SendGrid** (free tier available)
- **Mailgun** (free tier available)
- **AWS SES** (very cheap)

## 🚨 **Security Notes**

- **Never commit `.env` files** to version control
- **Use App Passwords** instead of your main Gmail password
- **Rotate credentials** regularly in production
- **Monitor email sending** for abuse

## 📋 **Debug Checklist**

- [ ] Email service test passes
- [ ] Firebase connection test passes
- [ ] OTP generation test passes
- [ ] Server logs show signup progress
- [ ] No 500 errors in console
- [ ] User document created in Firestore
- [ ] Email sent successfully

## ❓ **Still Having Issues?**

If all tests pass but signup still fails:

1. **Check browser console** for frontend errors
2. **Verify request payload** is correct
3. **Check CORS configuration**
4. **Look for middleware errors**
5. **Share complete server logs**

Run the debug endpoints first and let me know which ones fail!
