# Troubleshooting Guide

## Issue: Dashboard API Route Not Found

If you're getting the error:
```json
{
  "success": false,
  "error": {
    "message": "Route /api/dashboard not found",
    "code": "NOT_FOUND"
  },
  "timestamp": "2025-09-01T09:59:29.238Z",
  "path": "/api/dashboard",
  "method": "GET"
}
```

## Step-by-Step Debugging

### 1. **Check if the server is running**

First, verify that your backend server is actually running:

```bash
# Check if the server is running on port 3001
curl http://localhost:3001/api/health
```

Expected response:
```json
{
  "success": true,
  "message": "Health check is working",
  "timestamp": "2025-09-01T09:59:29.238Z"
}
```

### 2. **Test with debug server**

If the main server isn't working, try the debug server:

```bash
# Run the debug server (no Firebase dependencies)
npm run debug
```

Then test:
```bash
curl http://localhost:3001/api/dashboard
```

### 3. **Check server logs**

Look for any error messages when starting the server:

```bash
# Start the development server
npm run dev
```

Look for:
- Firebase initialization errors
- Import/export errors
- Middleware errors
- Route registration errors

### 4. **Verify environment variables**

Make sure you have the required environment variables:

```bash
# Check if .env file exists
ls -la .env*

# Create .env file if it doesn't exist
cp .env.example .env
```

Required variables for basic functionality:
```env
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
DASHBOARD_JWT_SECRET=your-secret-key
```

### 5. **Check Firebase configuration**

If Firebase isn't configured properly, the server might fail to start:

```env
# Option 1: Service Account Key
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}

# Option 2: Project Configuration
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_DATABASE_URL=https://your-project-id.firebaseio.com
FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
```

### 6. **Test individual components**

#### Test basic Express server:
```bash
npm run debug
```

#### Test TypeScript compilation:
```bash
npm run build
```

#### Test production server:
```bash
npm run start
```

## Common Issues and Solutions

### Issue 1: Server not starting
**Symptoms**: No server startup messages, port already in use
**Solution**: 
```bash
# Kill any existing processes on port 3001
lsof -ti:3001 | xargs kill -9

# Start fresh
npm run dev
```

### Issue 2: Firebase initialization error
**Symptoms**: Server starts but crashes on Firebase import
**Solution**: 
```bash
# Use debug server temporarily
npm run debug

# Or fix Firebase config in .env file
```

### Issue 3: Import/export errors
**Symptoms**: Syntax errors or module not found
**Solution**:
```bash
# Clean and reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Rebuild TypeScript
npm run build
```

### Issue 4: Route not registered
**Symptoms**: Server starts but routes return 404
**Solution**: Check the route registration in `src/index.ts`:
```typescript
// Routes should be registered like this:
app.use('/api/dashboard', dashboardRouter);
app.use('/api/auth', authRouter);
```

## Debug Commands

### Check server status:
```bash
# Check if port 3001 is in use
netstat -tulpn | grep :3001

# Check process
ps aux | grep node
```

### Test API endpoints:
```bash
# Health check
curl http://localhost:3001/api/health

# Dashboard test
curl http://localhost:3001/api/dashboard

# Auth test
curl http://localhost:3001/api/auth
```

### Check logs:
```bash
# Start server with verbose logging
DEBUG=* npm run dev

# Or check console output for errors
npm run dev 2>&1 | tee server.log
```

## Quick Fix Steps

1. **Stop all servers**:
   ```bash
   pkill -f "node"
   ```

2. **Clear port**:
   ```bash
   lsof -ti:3001 | xargs kill -9
   ```

3. **Check environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your Firebase config
   ```

4. **Test debug server**:
   ```bash
   npm run debug
   ```

5. **If debug works, check main server**:
   ```bash
   npm run dev
   ```

6. **Look for specific error messages** in the console output

## Still Having Issues?

If none of the above solutions work:

1. **Check the GitHub issues** for similar problems
2. **Share the complete error logs** from the console
3. **Verify your Node.js version** (requires 18+)
4. **Check if all dependencies are installed** correctly

## Environment Setup Checklist

- [ ] Node.js 18+ installed
- [ ] `.env` file created with required variables
- [ ] Firebase project configured
- [ ] All dependencies installed (`npm install`)
- [ ] No syntax errors in TypeScript files
- [ ] Port 3001 is available
- [ ] CORS origin matches your frontend URL
