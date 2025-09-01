# 🚀 Supabase Setup Guide for API Gateway Backend

This guide will help you set up Supabase PostgreSQL for your API Gateway Backend.

## 📋 Prerequisites

- [Supabase account](https://supabase.com) (free tier available)
- Node.js 18+ installed
- Git repository set up

## 🔧 Step 1: Create Supabase Project

1. **Go to [Supabase Dashboard](https://app.supabase.com)**
2. **Click "New Project"**
3. **Choose your organization**
4. **Fill in project details:**
   - Name: `api-gateway-backend` (or your preferred name)
   - Database Password: **Save this password!** You'll need it for the connection string
   - Region: Choose closest to your users
5. **Click "Create new project"**
6. **Wait for project to be created** (usually 2-3 minutes)

## 🗄️ Step 2: Get Connection Details

Once your project is created, go to **Settings > Database**:

### Database Connection String
```
postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
```

### Project URL
```
https://[YOUR-PROJECT-REF].supabase.co
```

### API Keys
- **anon key**: Public key for client-side operations
- **service_role key**: Secret key for admin operations (keep this secret!)

## 🔐 Step 3: Set Up Environment Variables

1. **Copy the environment template:**
   ```bash
   cp env.example .env
   ```

2. **Edit `.env` with your Supabase details:**
   ```bash
   # Supabase Database Configuration
   DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"
   SUPABASE_URL=https://[YOUR-PROJECT-REF].supabase.co
   SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   
   # JWT Configuration
   DASHBOARD_JWT_SECRET=your-super-secret-dashboard-jwt-key-change-in-production
   
   # Other required variables
   STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
   STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
   ```

## 🗃️ Step 4: Database Setup

### Install Dependencies
```bash
npm install
```

### Generate Prisma Client
```bash
npm run db:generate
```

### Create Database Tables
```bash
npm run db:migrate
```

### Seed Initial Data
```bash
npm run db:seed
```

## 🔒 Step 5: Supabase Security Rules (Optional)

For additional security, you can set up Row Level Security (RLS) in Supabase:

### Enable RLS on Tables
```sql
-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Enable RLS on request_logs table
ALTER TABLE request_logs ENABLE ROW LEVEL SECURITY;

-- Enable RLS on plans table
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
```

### Create Policies (Optional)
```sql
-- Users can only see their own data
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid()::text = id);

-- Users can only see their own request logs
CREATE POLICY "Users can view own request logs" ON request_logs
  FOR SELECT USING (auth.uid()::text = user_id);
```

## 🧪 Step 6: Test Your Setup

### Start Development Server
```bash
npm run dev
```

### Test Health Endpoint
```bash
curl http://localhost:3001/api/health
```

### Test Database Connection
```bash
curl http://localhost:3001/
```

## 🚀 Step 7: Deploy to Vercel

### 1. Push to GitHub
```bash
git add .
git commit -m "Add Supabase integration"
git push origin main
```

### 2. Connect to Vercel
- Go to [Vercel Dashboard](https://vercel.com/dashboard)
- Click "New Project"
- Import your GitHub repository
- Set environment variables in Vercel dashboard

### 3. Set Vercel Environment Variables
Copy all variables from your `.env` file to Vercel:
- `DATABASE_URL`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `DASHBOARD_JWT_SECRET`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`

## 🔍 Step 8: Monitor Your Database

### Supabase Dashboard
- **Table Editor**: View and edit data
- **SQL Editor**: Run custom queries
- **Logs**: Monitor database activity
- **API**: Test API endpoints

### Useful Queries
```sql
-- Check user count
SELECT COUNT(*) FROM users;

-- Check plan distribution
SELECT plan, COUNT(*) FROM users GROUP BY plan;

-- Check recent API requests
SELECT * FROM request_logs ORDER BY timestamp DESC LIMIT 10;
```

## 🚨 Troubleshooting

### Common Issues

#### 1. Connection Refused
- Check if `DATABASE_URL` is correct
- Verify project is not paused (free tier pauses after inactivity)
- Check if IP is allowed (if you set up IP restrictions)

#### 2. Authentication Failed
- Verify password in connection string
- Check if service role key is correct
- Ensure environment variables are set

#### 3. Table Not Found
- Run migrations: `npm run db:migrate`
- Check if tables exist in Supabase dashboard
- Verify Prisma schema matches database

#### 4. Rate Limiting Issues
- Check Supabase usage limits
- Monitor database performance
- Consider upgrading plan if needed

### Getting Help
- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Discord](https://discord.supabase.com)
- [GitHub Issues](https://github.com/supabase/supabase/issues)

## 🎯 Next Steps

After successful setup:

1. **Test all API endpoints**
2. **Set up Stripe webhooks**
3. **Configure monitoring and alerts**
4. **Set up backup strategies**
5. **Plan for scaling**

## 📊 Monitoring & Analytics

### Supabase Insights
- Database performance metrics
- Query execution times
- Connection pool usage
- Storage usage

### Custom Metrics
- API request counts
- User registration rates
- Plan upgrade conversions
- Error rates

---

🎉 **Congratulations!** Your API Gateway Backend is now connected to Supabase PostgreSQL and ready for production use.
