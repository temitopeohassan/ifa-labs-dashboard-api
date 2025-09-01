# API Gateway Backend

A modern, subscription-based API Gateway Backend for managing access to a Golang-powered data API. This application provides user authentication, subscription management, rate limiting, and request logging with cryptocurrency payment processing through NowPayments.

## 🚀 Features

- **User Authentication & Authorization**: JWT-based authentication with role-based access control
- **Subscription Management**: Three-tier subscription system (Free, Developer, Professional)
- **Cryptocurrency Payments**: Integrated with NowPayments for crypto payment processing
- **API Rate Limiting**: Plan-based rate limiting with Redis caching
- **Request Logging**: Comprehensive logging of all API requests
- **Admin Dashboard**: User management and system analytics
- **Database**: Supabase PostgreSQL with Prisma ORM
- **Caching**: Redis for rate limiting and session management
- **Security**: Helmet, CORS, rate limiting, and input validation

## 🛠️ Tech Stack

- **Backend**: Node.js, Express.js, TypeScript
- **Database**: Supabase PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT (JSON Web Tokens)
- **Payments**: NowPayments (Cryptocurrency)
- **Caching**: Redis
- **Validation**: Joi
- **Deployment**: Vercel (Serverless)

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- NowPayments account
- Redis instance (optional - can use Supabase's built-in caching)

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd api-gateway-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   ```
   
   Update the `.env` file with your configuration:
   ```bash
   # Supabase Database
   DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"
   SUPABASE_URL=https://[YOUR-PROJECT-REF].supabase.co
   SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   
   # NowPayments
   NOWPAYMENTS_API_KEY=your_nowpayments_api_key
   NOWPAYMENTS_IPN_SECRET=your_nowpayments_ipn_secret
   NOWPAYMENTS_WEBHOOK_URL=https://your-domain.com/api/webhooks/nowpayments
   
   # JWT
   DASHBOARD_JWT_SECRET=your-super-secret-dashboard-jwt-key-change-in-production
   ```

4. **Set up the database**
   ```bash
   # Generate Prisma client
   npm run db:generate
   
   # Run database migrations
   npm run db:migrate
   
   # Seed the database with initial data
   npm run db:seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

## 🗄️ Database Setup

### Supabase Quick Start

1. **Create a new project** at [supabase.com](https://supabase.com)
2. **Get your connection details** from Settings > Database
3. **Update your `.env` file** with the connection string
4. **Run migrations** to create the database schema

### Database Schema

The application uses three main models:

- **User**: User accounts with subscription information
- **Plan**: Subscription plan definitions
- **RequestLog**: API request logging and analytics

## 💳 NowPayments Integration

### Setup

1. **Create a NowPayments account** at [nowpayments.io](https://nowpayments.io)
2. **Get your API key** from the dashboard
3. **Configure webhook URL** in your NowPayments settings
4. **Set IPN secret** for webhook verification

### Supported Cryptocurrencies

- Bitcoin (BTC)
- Ethereum (ETH)
- Tether (USDT)
- USD Coin (USDC)
- And many more...

### Payment Flow

1. User selects a plan
2. System creates payment request via NowPayments API
3. User receives cryptocurrency payment address
4. Payment is processed and confirmed
5. Webhook updates user subscription status

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile

### Plans & Subscriptions
- `GET /api/plans` - List available plans
- `POST /api/plans/change` - Change user plan
- `GET /api/plans/current` - Get current user plan

### Dashboard
- `GET /api/dashboard` - User dashboard overview
- `GET /api/dashboard/requests` - Request history
- `GET /api/dashboard/billing` - Billing information

### API Proxy
- `/*` - Proxy requests to Golang API (with authentication and rate limiting)

### Admin
- `GET /api/admin/users` - List all users
- `GET /api/admin/usage` - System usage statistics
- `PUT /api/admin/users/:userId/admin` - Update user admin access
- `GET /api/admin/users/:userId` - Get specific user details

### Webhooks
- `POST /api/webhooks/nowpayments` - NowPayments IPN webhook

## 🔐 Authentication

The application uses JWT tokens for authentication. There are two separate JWT systems:

1. **Dashboard JWT** (`DASHBOARD_JWT_SECRET`): Used for the API Gateway Backend
2. **Golang API JWT**: Used for the backend Golang API server

### JWT Flow

1. User logs in with email/password
2. System validates credentials and generates JWT
3. JWT is returned to client
4. Client includes JWT in Authorization header for subsequent requests
5. Middleware validates JWT and attaches user to request

## 🚦 Rate Limiting

Rate limiting is implemented at two levels:

1. **Global Rate Limiting**: Basic IP-based rate limiting
2. **Plan-based Rate Limiting**: Subscription plan-specific limits

### Rate Limit Configuration

- **Free Plan**: 5 requests per minute, 100 per month
- **Developer Plan**: 50 requests per minute, 10,000 per month  
- **Professional Plan**: 200 requests per minute, 100,000 per month

## 🚀 Deployment

### Vercel Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Deploy to Vercel**
   ```bash
   vercel --prod
   ```

3. **Configure environment variables** in Vercel dashboard

4. **Set up webhook URL** for NowPayments IPN

### Environment Variables for Production

Ensure all required environment variables are set in your production environment:

- Database connection strings
- JWT secrets
- NowPayments API keys
- Webhook URLs
- CORS origins

## 📊 Monitoring & Analytics

The application provides comprehensive monitoring:

- **Request Logging**: All API requests are logged with metadata
- **User Analytics**: Usage statistics and plan distribution
- **Performance Metrics**: Response times and error rates
- **Admin Dashboard**: Real-time system overview

## 🔒 Security Features

- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing configuration
- **Rate Limiting**: DDoS protection
- **Input Validation**: Request payload validation
- **JWT Verification**: Secure token validation
- **Webhook Signatures**: IPN verification for NowPayments

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:

- Check the documentation
- Review the API endpoints
- Check the logs for errors
- Contact the development team

## 🔄 Changelog

### Version 2.0.0
- Migrated from Firebase to Supabase PostgreSQL
- Replaced Stripe with NowPayments cryptocurrency payments
- Updated database schema and Prisma models
- Enhanced rate limiting and request logging
- Improved admin dashboard and analytics
- Added comprehensive webhook handling
