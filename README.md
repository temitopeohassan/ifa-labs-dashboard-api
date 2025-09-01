# API Gateway Backend

A Node.js/Express.js backend API that manages access to a Golang-powered data API with subscription-based access control, built with **Supabase PostgreSQL**.

## Features

- **User Authentication**: JWT-based authentication with bcrypt password hashing
- **Subscription Management**: Multiple plan tiers (FREE, DEVELOPER, PROFESSIONAL, ENTERPRISE)
- **API Rate Limiting**: Plan-based rate limiting using Redis
- **Request Logging**: Comprehensive logging of all API requests with cost tracking
- **Stripe Integration**: Subscription billing and payment processing
- **Admin Dashboard**: User management and system-wide analytics
- **Golang API Proxy**: Forwards authenticated requests to the backend Golang API
- **Supabase Integration**: Managed PostgreSQL with real-time capabilities

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Client App    │───▶│  API Gateway     │───▶│  Golang API     │
│                 │    │  (Node.js)       │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌──────────────────┐
                       │   Supabase       │
                       │   PostgreSQL     │
                       │   + Redis        │
                       └──────────────────┘
```

## Tech Stack

- **Backend**: Node.js + Express.js + TypeScript
- **Database**: **Supabase PostgreSQL** with Prisma ORM
- **Cache**: Redis for rate limiting
- **Authentication**: JWT + bcrypt
- **Payments**: Stripe
- **Deployment**: Vercel (serverless)
- **Real-time**: Supabase real-time subscriptions

## Quick Start with Supabase

### 1. Create Supabase Project
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Create new project
3. Save your database password and project URL

### 2. Set Environment Variables
```bash
cp env.example .env
# Edit .env with your Supabase details:
# - DATABASE_URL (from Supabase dashboard)
# - SUPABASE_URL
# - SUPABASE_ANON_KEY
# - SUPABASE_SERVICE_ROLE_KEY
```

### 3. Setup Database
```bash
npm install
npm run db:generate
npm run db:migrate
npm run db:seed
```

### 4. Start Development
```bash
npm run dev
```

📖 **Complete Supabase Setup Guide**: See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for detailed instructions.

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile

### Plans & Subscriptions
- `GET /api/plans` - List all available plans
- `POST /api/plans/change` - Change user plan
- `GET /api/plans/current` - Get current plan details

### Dashboard
- `GET /api/dashboard` - User dashboard with usage stats
- `GET /api/dashboard/requests` - Request history
- `GET /api/dashboard/billing` - Billing information

### Data API Proxy
- `GET /api/data/*` - Proxy to Golang API (with auth & rate limiting)
- `POST /api/data/*` - Proxy to Golang API (with auth & rate limiting)
- `PUT /api/data/*` - Proxy to Golang API (with auth & rate limiting)
- `DELETE /api/data/*` - Proxy to Golang API (with auth & rate limiting)

### Admin (Admin users only)
- `GET /api/admin/users` - List all users
- `GET /api/admin/usage` - System-wide usage statistics
- `PATCH /api/admin/users/:userId/admin` - Update user admin access
- `GET /api/admin/users/:userId` - Get user details

### Webhooks
- `POST /api/webhooks/stripe` - Stripe webhook handler

## Subscription Plans

| Plan | Price | API Requests | Rate Limit | Request Cost | Access | Support |
|------|-------|--------------|------------|--------------|---------|---------|
| FREE | $0 | 1,000/month | 30s | $0.00000 | all-feeds | Email & Community |
| DEVELOPER | $50 | 10,000/month | 10s | $0.0005 | all-feeds | 24/7 support |
| PROFESSIONAL | $100 | 100,000/month | 2s | $0.0002 | all-feeds + historical | 24/7 support |
| ENTERPRISE | Custom | Unlimited | Custom | Custom | all-feeds + private | Dedicated engineer |

## Environment Variables

```bash
# Server Configuration
PORT=3001
NODE_ENV=development

# Supabase Database Configuration
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"
SUPABASE_URL=https://[YOUR-PROJECT-REF].supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Redis Configuration
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# JWT Configuration
DASHBOARD_JWT_SECRET=your-super-secret-dashboard-jwt-key-change-in-production

# Golang API Configuration
GOLANG_API_BASE_URL=http://localhost:8080
GOLANG_API_TIMEOUT=30000
```

## Setup & Installation

### Prerequisites
- Node.js 18+
- Supabase account
- Redis (optional - can use Supabase caching)
- Stripe account

### 1. Install Dependencies
```bash
npm install
```

### 2. Set up Environment Variables
```bash
cp env.example .env
# Edit .env with your configuration
```

### 3. Database Setup
```bash
# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# Seed initial data
npm run db:seed
```

### 4. Start Development Server
```bash
npm run dev
```

## Database Schema

### Users
- Authentication and profile information
- Subscription plan and usage tracking
- Stripe customer and subscription IDs

### Plans
- Subscription plan configurations
- Pricing, limits, and features

### RequestLogs
- API request tracking
- Response times and costs
- User association

## Rate Limiting

The API implements a two-tier rate limiting system:

1. **Plan-based Rate Limiting**: Each plan has a different rate limit (e.g., FREE: 30s, PROFESSIONAL: 2s)
2. **Monthly Quota**: Each plan has a monthly API request limit

## Security Features

- JWT authentication with secure token handling
- bcrypt password hashing
- Role-based access control
- Rate limiting to prevent abuse
- HTTPS enforcement
- Input validation and sanitization
- Supabase Row Level Security (RLS) support

## JWT Token Management

The API uses a dedicated JWT configuration for dashboard authentication:

- **`DASHBOARD_JWT_SECRET`**: Secret key for signing dashboard JWT tokens
- **Token Expiration**: 7 days for authentication tokens
- **Token Separation**: Dashboard JWT is separate from Golang API JWT

## Deployment

### Vercel Deployment
The application is configured for Vercel serverless deployment:

1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy

### Environment Variables for Production
Ensure all required environment variables are set in your production environment, especially:
- `DATABASE_URL` (Supabase)
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `REDIS_URL`
- `STRIPE_SECRET_KEY`
- `DASHBOARD_JWT_SECRET`

## Supabase Benefits

- **Managed PostgreSQL**: No database administration needed
- **Real-time Subscriptions**: Built-in real-time capabilities
- **Row Level Security**: Advanced access control
- **Auto-scaling**: Handles traffic spikes automatically
- **Backup & Recovery**: Automatic backups and point-in-time recovery
- **Monitoring**: Built-in performance insights
- **Edge Functions**: Serverless functions at the edge

## Monitoring & Analytics

- Request logging with response times
- Cost tracking per user and plan
- Admin dashboard with system-wide statistics
- Stripe webhook integration for subscription events
- Supabase dashboard for database insights

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

- **Supabase**: [Documentation](https://supabase.com/docs) | [Discord](https://discord.supabase.com)
- **Stripe**: [Documentation](https://stripe.com/docs)
- **Vercel**: [Documentation](https://vercel.com/docs)
