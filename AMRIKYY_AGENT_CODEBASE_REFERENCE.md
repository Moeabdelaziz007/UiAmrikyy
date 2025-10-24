# 📚 Amrikyy-Agent Codebase Reference

**Repository**: Moeabdelaziz007/Amrikyy-Agent  
**Type**: AI-Powered Travel Assistant Backend  
**Status**: ✅ Production Ready (Deployed)  
**Last Updated**: January 21, 2025

---

## 🔗 Quick Links

- **Repository**: https://github.com/Moeabdelaziz007/Amrikyy-Agent
- **Live Frontend**: https://frontend-beta-sandy.vercel.app
- **Live Backend**: https://amrikyy-agent.onrender.com
- **Health Check**: https://amrikyy-agent.onrender.com/api/health
- **Telegram Bot**: [@AmrikyyBot](https://t.me/AmrikyyBot)

---

## 📋 What to Extract from Amrikyy-Agent

### Priority 1: Backend Architecture (Must Have)
✅ **Use These**:
- `backend/server.js` - Main server entry point
- `backend/routes/*` - All API route handlers (15+ files)
- `backend/middleware/*` - Security, auth, rate limiting
- `backend/database/*` - Supabase, Redis, MongoDB clients
- `backend/services/ai-service.js` - Multi-model AI integration
- `backend/services/payment-service.js` - Stripe integration
- Complete authentication system (JWT + Supabase)

### Priority 2: Documentation (Must Have)
✅ **Copy These**:
- `ENV_KEYS_MASTER.md` - Comprehensive environment variables (120+)
- `DEPLOYMENT_KEYS.md` - Quick deployment reference
- `CODEBASE_INDEX.md` - Complete codebase documentation
- `API_DOCUMENTATION.md` - API endpoint reference
- `DEPLOYMENT_GUIDE.md` - Deployment instructions
- `docs/` folder - All documentation files

### Priority 3: Configuration Files (Must Have)
✅ **Use These**:
- `.env.example` - Environment template
- `vercel.json` - Vercel deployment config
- `render.yaml` - Render deployment config
- `Dockerfile` - Docker configuration
- `netlify.toml` - Netlify config (if applicable)

### Priority 4: Service Integrations (Useful)
✅ **Consider These**:
- `backend/services/flight-service.js` - Amadeus, Kiwi APIs
- `backend/services/hotel-service.js` - Booking.com API
- Communication services (Telegram, WhatsApp, Email)
- Payment processing (Stripe, PayPal, Crypto)
- Analytics and monitoring

### Priority 5: Frontend Components (Optional)
⚠️ **Review but Probably Keep UiAmrikyy's**:
- Amrikyy-Agent has basic React frontend
- UiAmrikyy has superior desktop OS interface
- May extract specific travel booking UI components
- May extract authentication UI patterns

---

## 🏗️ Key Architecture Components

### Backend Structure
```
backend/
├── server.js                   # ⭐⭐⭐ Entry point
│
├── routes/                     # ⭐⭐⭐ API endpoints
│   ├── auth.js                 # Authentication
│   ├── ai.js                   # AI chat
│   ├── flights.js              # Flight search
│   ├── hotels.js               # Hotel search
│   ├── bookings.js             # Booking management
│   ├── destinations.js         # Destination info
│   ├── analytics.js            # Analytics
│   ├── telegram.js             # Telegram bot
│   ├── whatsapp.js             # WhatsApp bot
│   └── stripe-webhook.js       # Payment webhook
│
├── middleware/                 # ⭐⭐⭐ Security & utilities
│   ├── auth.js                 # JWT verification
│   ├── rateLimiter.js          # Rate limiting
│   ├── securityEnhancements.js # Security headers
│   └── analyticsMiddleware.js  # Request tracking
│
├── database/                   # ⭐⭐⭐ Data layer
│   ├── supabase.js             # PostgreSQL client
│   ├── redis.js                # Caching layer
│   └── mongodb.js              # Optional NoSQL
│
├── services/                   # ⭐⭐⭐ Business logic
│   ├── ai-service.js           # Multi-model AI
│   ├── flight-service.js       # Flight APIs
│   ├── hotel-service.js        # Hotel APIs
│   ├── payment-service.js      # Payment processing
│   └── ...                     # Other services
│
└── agents/                     # ⭐⭐ AI agents
    ├── travel-agent.js         # Travel planning
    ├── booking-agent.js        # Booking assistance
    └── ...                     # Other agents
```

### Frontend Structure (Less Relevant)
```
frontend/
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── components/
│   ├── pages/
│   ├── hooks/
│   ├── contexts/
│   ├── services/
│   └── types/
└── package.json
```

---

## 🔑 Environment Variables (120+)

### Critical Variables (Minimum 9)
```bash
PORT=3001
NODE_ENV=production
SUPABASE_URL=xxx
SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx
JWT_SECRET=xxx
OPENAI_API_KEY=xxx
FRONTEND_URL=xxx
VITE_API_URL=xxx
```

### Categories in ENV_KEYS_MASTER.md

1. **Server Configuration** (4 vars)
   - PORT, NODE_ENV, FRONTEND_URL, CORS_ORIGIN

2. **Database** (8 vars)
   - Supabase (3), Redis (2), MongoDB (3)

3. **Authentication** (2 vars)
   - JWT_SECRET, JWT_EXPIRES_IN

4. **AI Services** (30+ vars)
   - OpenAI, Gemini, Claude, Llama, Mixtral, etc.

5. **Communication** (15+ vars)
   - Telegram, WhatsApp, Twilio, SendGrid, etc.

6. **Payment Processing** (20+ vars)
   - Stripe, PayPal, Crypto wallets, etc.

7. **Travel APIs** (15+ vars)
   - Amadeus, Kiwi, Booking.com, Skyscanner, etc.

8. **Maps & Location** (10+ vars)
   - Google Maps, Mapbox, Geoapify, etc.

9. **Monitoring** (10+ vars)
   - Sentry, LangSmith, Google Analytics, etc.

10. **Caching & Storage** (5+ vars)
    - Redis, AWS S3, Google Cloud Storage, etc.

**Full List**: See `ENV_KEYS_MASTER.md` in Amrikyy-Agent repo

---

## 📡 API Endpoints to Integrate

### Authentication
```
POST   /api/auth/register          # Register new user
POST   /api/auth/login             # Login user
POST   /api/auth/logout            # Logout user
GET    /api/auth/me                # Get current user
POST   /api/auth/refresh           # Refresh token
```

### AI Chat
```
POST   /api/ai/chat                # Send message to AI
GET    /api/ai/history             # Get chat history
DELETE /api/ai/history/:id         # Delete chat
```

### Travel Services
```
GET    /api/flights/search         # Search flights
GET    /api/hotels/search          # Search hotels
GET    /api/destinations/:id       # Get destination info
POST   /api/bookings/create        # Create booking
GET    /api/bookings/:id           # Get booking details
PUT    /api/bookings/:id           # Update booking
DELETE /api/bookings/:id           # Cancel booking
```

### Payment
```
POST   /api/stripe/create-intent   # Create payment intent
POST   /api/stripe/webhook         # Stripe webhook handler
GET    /api/payments/:id           # Get payment status
```

### Communication
```
POST   /api/telegram/webhook       # Telegram webhook
POST   /api/whatsapp/webhook       # WhatsApp webhook
POST   /api/email/send             # Send email
```

### Analytics
```
GET    /api/analytics/dashboard    # Dashboard stats
GET    /api/analytics/users        # User analytics
GET    /api/analytics/bookings     # Booking analytics
```

---

## 🛠️ Technology Stack

### Backend Core
- **Runtime**: Node.js 18+
- **Framework**: Express.js 4.18.0
- **Language**: JavaScript (with some TypeScript)

### Database & Storage
- **Primary DB**: Supabase (PostgreSQL)
- **Cache**: Redis 4.6.0
- **Optional**: MongoDB (for specific use cases)
- **File Storage**: AWS S3 / Google Cloud Storage

### AI & ML
- **Primary**: Google Gemini 2.0 Flash (Experimental)
- **Alternatives**: 
  - Gemini 2.5 Pro
  - OpenAI GPT-4, GPT-3.5
  - Anthropic Claude (Sonnet, Haiku)
  - OpenRouter (multiple models)
- **Tracing**: LangSmith (optional)

### External Services
- **Travel**: Amadeus, Kiwi, Booking.com, Skyscanner
- **Payment**: Stripe, PayPal, Crypto (Base, ETH)
- **Communication**: Telegram, WhatsApp, Twilio, SendGrid
- **Maps**: Google Maps, Mapbox
- **Monitoring**: Sentry

### DevOps
- **Backend Hosting**: Render.com
- **Frontend Hosting**: Vercel
- **CI/CD**: GitHub Actions + Auto-deploy
- **Containerization**: Docker

---

## 📦 Key Dependencies

### Backend (package.json)
```json
{
  "express": "^4.18.0",
  "cors": "^2.8.5",
  "dotenv": "^16.0.0",
  "@supabase/supabase-js": "^2.39.0",
  "jsonwebtoken": "^9.0.2",
  "bcryptjs": "^2.4.3",
  "axios": "^1.6.0",
  "redis": "^4.6.0",
  "stripe": "^14.0.0",
  "node-telegram-bot-api": "^0.66.0",
  "passport": "^0.7.0",
  "helmet": "^7.1.0",
  "express-rate-limit": "^7.1.0"
}
```

### Frontend (if using Amrikyy-Agent's frontend)
```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "react-router-dom": "^6.20.0",
  "axios": "^1.6.0",
  "tailwindcss": "^3.4.0"
}
```

---

## 🚀 Deployment Configuration

### Backend on Render.com
```yaml
# render.yaml
services:
  - type: web
    name: amrikyy-agent
    runtime: node
    buildCommand: npm install
    startCommand: node server.js
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 3001
      # ... 12+ more environment variables
```

### Frontend on Vercel
```json
// vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "devCommand": "npm run dev",
  "env": {
    "VITE_API_URL": "https://amrikyy-agent.onrender.com"
  }
}
```

---

## 📖 Important Documentation Files

### Must Read
1. **README.md** - Start here for overview
2. **ENV_KEYS_MASTER.md** - All environment variables explained
3. **DEPLOYMENT_KEYS.md** - Quick deployment checklist
4. **CODEBASE_INDEX.md** - Complete codebase navigation
5. **API_DOCUMENTATION.md** - API endpoint reference

### Helpful Guides
6. **DEPLOYMENT_GUIDE.md** - Step-by-step deployment
7. **QUICK_START.md** - Get started quickly
8. **ARCHITECTURE.md** - System architecture
9. **TESTING_GUIDE.md** - How to test
10. **CHANGELOG.md** - Version history

### Setup Guides
11. **GOOGLE_APIS_SETUP.md** - Configure Google Cloud
12. **TELEGRAM_BOT_SETUP.md** - Setup Telegram bot
13. **SECURE_VAULT_SETUP.md** - Setup secure storage
14. **GMAIL_SETUP.md** - Configure email
15. **GOOGLE_MAPS_SETUP.md** - Setup maps API

---

## 🔐 Security Features

### Authentication & Authorization
- JWT token-based authentication
- Bcrypt password hashing
- Session management
- Role-based access control

### API Security
- Rate limiting (per endpoint)
- CORS configuration
- Helmet.js security headers
- Input validation & sanitization
- SQL injection prevention

### Data Security
- End-to-end encryption for sensitive data
- Secure credential storage (environment variables)
- HTTPS enforcement
- GDPR compliance

---

## 📊 What Makes This Production-Ready

### ✅ Robust Architecture
- Modular, scalable structure
- Separation of concerns
- Error handling throughout
- Logging and monitoring

### ✅ Complete Backend
- Full REST API
- Real database (PostgreSQL)
- Caching layer (Redis)
- Authentication system
- Payment processing

### ✅ External Integrations
- Multiple AI models
- Travel booking APIs
- Communication channels
- Payment gateways
- Analytics tools

### ✅ DevOps
- Already deployed and running
- CI/CD configured
- Environment management
- Health checks
- Error tracking (Sentry)

### ✅ Documentation
- Comprehensive README
- API documentation
- Deployment guides
- Environment variable documentation
- Architecture diagrams

---

## 🎯 Extraction Strategy

### Phase 1: Copy Core Backend
```bash
# In UiAmrikyy repo
cp -r ../Amrikyy-Agent/backend ./backend_amrikyy_agent

# Selectively merge
mv backend backend_old
mv backend_amrikyy_agent backend

# Preserve UiAmrikyy-specific services
cp backend_old/services/GoogleMapsService.js backend/services/
cp backend_old/services/YouTubeService.js backend/services/
```

### Phase 2: Copy Configuration
```bash
cp ../Amrikyy-Agent/.env.example ./
cp ../Amrikyy-Agent/ENV_KEYS_MASTER.md ./
cp ../Amrikyy-Agent/DEPLOYMENT_KEYS.md ./
cp ../Amrikyy-Agent/vercel.json ./
cp ../Amrikyy-Agent/render.yaml ./
```

### Phase 3: Copy Documentation
```bash
cp -r ../Amrikyy-Agent/docs ./docs_backend
cp ../Amrikyy-Agent/API_DOCUMENTATION.md ./
cp ../Amrikyy-Agent/DEPLOYMENT_GUIDE.md ./
```

### Phase 4: Merge Dependencies
```bash
# Manually merge package.json
# Add Amrikyy-Agent dependencies
# Keep UiAmrikyy React 19
# Update scripts
```

### Phase 5: Update Frontend
```bash
# Update API calls
# Add authentication
# Connect to real backend
# Integrate travel features
```

---

## ⚠️ What NOT to Copy

### Don't Copy (Use UiAmrikyy's Instead)
❌ **Frontend Structure**: UiAmrikyy has better UI
❌ **React Components**: UiAmrikyy's are more polished
❌ **Desktop OS Interface**: UiAmrikyy's core feature
❌ **Window Management**: UiAmrikyy's implementation
❌ **Theme System**: UiAmrikyy's is more advanced
❌ **UI Styling**: Keep UiAmrikyy's TailwindCSS setup

### Merge Carefully
⚠️ **AI Agent Implementations**: Combine both
⚠️ **Service Layer**: Merge capabilities
⚠️ **Utility Functions**: Review and merge
⚠️ **Testing**: Combine test suites

---

## 🎓 Learning from Amrikyy-Agent

### Best Practices to Adopt

1. **Environment Management**: Comprehensive ENV_KEYS_MASTER.md
2. **API Structure**: Clear route organization
3. **Middleware Pattern**: Security and auth middleware
4. **Error Handling**: Consistent error responses
5. **Documentation**: Extensive documentation
6. **Deployment**: Production-ready configuration
7. **Security**: Multiple security layers
8. **Testing**: Comprehensive test coverage

### Patterns to Implement

1. **Service Layer**: Separate business logic
2. **Route Organization**: One file per resource
3. **Middleware Chain**: Auth → Validation → Handler
4. **Error Middleware**: Centralized error handling
5. **Database Abstraction**: Repository pattern
6. **Configuration**: Environment-based config

---

## 📞 Contact & Resources

### Amrikyy-Agent Information
- **Author**: Mohamed Hossameldin Abdelaziz
- **Email**: Amrikyy@gmail.com
- **GitHub**: [@Moeabdelaziz007](https://github.com/Moeabdelaziz007)
- **LinkedIn**: [linkedin.com/in/amrikyy](https://www.linkedin.com/in/amrikyy)

### Production Links
- **Frontend**: https://frontend-beta-sandy.vercel.app
- **Backend**: https://amrikyy-agent.onrender.com
- **Health Check**: https://amrikyy-agent.onrender.com/api/health

---

## ✅ Quick Checklist for Integration

- [ ] Clone Amrikyy-Agent repository
- [ ] Review backend structure
- [ ] Copy ENV_KEYS_MASTER.md
- [ ] Copy backend/ directory
- [ ] Copy configuration files
- [ ] Copy documentation
- [ ] Update package.json
- [ ] Merge dependencies
- [ ] Setup Supabase account
- [ ] Configure environment variables
- [ ] Update frontend API calls
- [ ] Test authentication flow
- [ ] Test AI agents
- [ ] Test travel features
- [ ] Run all tests
- [ ] Deploy to staging
- [ ] Deploy to production

---

**Reference Created**: October 24, 2025  
**Purpose**: Guide for extracting components from Amrikyy-Agent  
**Target**: UiAmrikyy repository integration  
**Status**: 📚 Reference Document Complete
