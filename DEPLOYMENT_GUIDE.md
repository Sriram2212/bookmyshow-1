# BookMyShow - Complete Deployment Guide

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- MongoDB (local or cloud)
- Redis (optional but recommended)

### Installation

1. **Clone and Install Dependencies**
```bash
# Server
cd server
npm install

# Client
cd ../client
npm install
```

2. **Configure Environment Variables**

Create `server/.env`:
```env
# Database
MONGODB_URI=mongodb://localhost:27017/bookmyshow

# Redis (optional - app works without it)
REDIS_URL=redis://localhost:6379

# JWT Authentication
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Server Configuration
PORT=5000
NODE_ENV=development

# Client URL (for CORS)
CLIENT_URL=http://localhost:3000
```

Create `client/.env`:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

3. **Seed Database (Optional)**
```bash
cd server
npm run seed
```

4. **Start Development Servers**

Terminal 1 (Backend):
```bash
cd server
npm run dev
```

Terminal 2 (Frontend):
```bash
cd client
npm start
```

5. **Access Application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api
- Health Check: http://localhost:5000/health

## 📋 Features Implemented

### ✅ Core Features
- [x] User Authentication (JWT-based)
- [x] Movie Catalog with Search
- [x] Show Listings by Movie
- [x] Interactive Seat Selection
- [x] Seat Locking (5-minute timer)
- [x] Booking Confirmation
- [x] Booking History
- [x] Payment Simulation

### ✅ Redis Integration
- [x] Movie/Show Caching (5-minute TTL)
- [x] Atomic Seat Locking
- [x] Auto-expiring Locks
- [x] Cache Invalidation
- [x] Graceful Degradation (works without Redis)

### ✅ Performance Optimizations
- [x] Redis Caching Layer
- [x] Database Indexing
- [x] Optimized Queries
- [x] Connection Pooling

### ✅ Security
- [x] JWT Authentication
- [x] Password Hashing (bcrypt)
- [x] Protected Routes
- [x] CORS Configuration
- [x] Input Validation

## 🏗️ Architecture

```
┌─────────────────┐
│   React Client  │ (Port 3000)
│   - TailwindCSS │
│   - React Router│
└────────┬────────┘
         │ HTTP/REST
         ↓
┌─────────────────┐
│  Express Server │ (Port 5000)
│   - JWT Auth    │
│   - REST API    │
└────┬───────┬────┘
     │       │
     ↓       ↓
┌─────────┐ ┌──────────┐
│ MongoDB │ │  Redis   │
│ (Data)  │ │ (Cache)  │
└─────────┘ └──────────┘
```

## 📁 Project Structure

```
bookmyshow/
├── server/
│   ├── src/
│   │   ├── controllers/      # Request handlers
│   │   ├── services/         # Business logic (with Redis)
│   │   ├── repositories/     # Database operations
│   │   ├── models/           # MongoDB schemas
│   │   ├── routes/           # API routes
│   │   ├── middleware/       # Auth, validation
│   │   ├── utils/            # Redis, DB, JWT utilities
│   │   └── index.js          # Server entry point
│   ├── .env                  # Environment variables
│   └── package.json
│
├── client/
│   ├── src/
│   │   ├── pages/            # Route components
│   │   ├── components/       # Reusable components
│   │   ├── services/         # API calls
│   │   ├── utils/            # Helper functions
│   │   └── App.js            # Main app component
│   ├── .env
│   └── package.json
│
├── REDIS_GUIDE.md            # Redis documentation
├── DEPLOYMENT_GUIDE.md       # This file
└── README.md                 # Project overview
```

## 🔧 Configuration Details

### MongoDB Setup

**Local MongoDB:**
```bash
# Install MongoDB
# Windows: Download from mongodb.com
# macOS: brew install mongodb-community
# Linux: sudo apt-get install mongodb

# Start MongoDB
mongod --dbpath /path/to/data
```

**MongoDB Atlas (Cloud):**
1. Create account at mongodb.com/cloud/atlas
2. Create cluster (free tier available)
3. Get connection string
4. Update `MONGODB_URI` in `.env`

### Redis Setup

**Local Redis:**
```bash
# Windows: Download from github.com/microsoftarchive/redis
# macOS: brew install redis && brew services start redis
# Linux: sudo apt-get install redis-server

# Verify Redis
redis-cli ping  # Should return PONG
```

**Redis Cloud:**
1. Sign up at redis.com/try-free
2. Create database
3. Copy connection URL
4. Update `REDIS_URL` in `.env`

**Note:** App works without Redis but loses caching and seat locking features.

## 🔐 Authentication Flow

```
1. User Signs Up → Password Hashed → Stored in MongoDB
2. User Logs In → Credentials Verified → JWT Token Generated
3. Token Stored in localStorage
4. Protected Routes → Token Verified → Access Granted
5. Token Expires → User Re-authenticates
```

## 🎫 Booking Flow

```
1. User Selects Movie → Views Shows
2. User Selects Show → Views Seat Map
3. User Selects Seats → Clicks "Lock Seats"
   ↓
4. Redis Lock Created (5-minute expiry)
   MongoDB Seat Status → "locked"
   ↓
5. User Completes Payment (simulated)
   ↓
6. Booking Created in MongoDB
   Seats Status → "booked"
   Redis Locks Released
   ↓
7. Booking Confirmation Displayed
```

## 📊 API Endpoints

### Authentication
```
POST   /api/auth/signup       # Register new user
POST   /api/auth/login        # Login user
```

### Movies & Shows
```
GET    /api/movies            # Get all movies (cached)
GET    /api/movies/:id        # Get movie details (cached)
GET    /api/movies/:id/shows  # Get shows for movie (cached)
GET    /api/shows/:id         # Get show with seats (cached)
```

### Bookings (Protected)
```
POST   /api/booking/lock      # Lock seats (Redis + MongoDB)
POST   /api/booking/confirm   # Confirm booking
POST   /api/booking/release   # Release locks
GET    /api/booking/my-bookings  # Get user bookings
GET    /api/booking/:id       # Get booking details
```

## 🧪 Testing

### Manual Testing

1. **Test Authentication:**
```bash
# Signup
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

2. **Test Caching:**
```bash
# First request (cache miss)
curl http://localhost:5000/api/movies

# Second request (cache hit - faster)
curl http://localhost:5000/api/movies
```

3. **Test Seat Locking:**
- Open two browser windows
- Try to lock same seat simultaneously
- Only one should succeed (atomic operation)

### Redis Monitoring

```bash
# Check cache keys
redis-cli keys "cache:*"

# Check lock keys
redis-cli keys "lock:*"

# Monitor Redis operations
redis-cli monitor
```

## 🚀 Production Deployment

### Environment Variables (Production)

```env
# Use production MongoDB
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/bookmyshow

# Use Redis Cloud
REDIS_URL=rediss://default:pass@redis-cloud.com:port

# Strong JWT secret
JWT_SECRET=use-a-very-strong-random-secret-here

# Production settings
NODE_ENV=production
PORT=5000
CLIENT_URL=https://your-domain.com
```

### Deployment Platforms

**Backend (Node.js):**
- Heroku
- Railway
- Render
- AWS Elastic Beanstalk
- DigitalOcean App Platform

**Frontend (React):**
- Vercel
- Netlify
- AWS S3 + CloudFront
- GitHub Pages

**Database:**
- MongoDB Atlas (managed)
- AWS DocumentDB

**Redis:**
- Redis Cloud (managed)
- AWS ElastiCache
- DigitalOcean Managed Redis

### Build Commands

**Backend:**
```bash
cd server
npm install --production
npm start
```

**Frontend:**
```bash
cd client
npm install
npm run build
# Serve build folder with static server
```

## 🔍 Troubleshooting

### Common Issues

**1. MongoDB Connection Failed**
```
Error: MongoNetworkError: failed to connect
```
Solution:
- Check MongoDB is running: `mongod`
- Verify `MONGODB_URI` in `.env`
- Check network/firewall settings

**2. Redis Connection Failed**
```
❌ Failed to connect to Redis
```
Solution:
- Check Redis is running: `redis-cli ping`
- Verify `REDIS_URL` in `.env`
- App continues to work without Redis (degraded mode)

**3. JWT Token Invalid**
```
Error: jwt malformed
```
Solution:
- Clear localStorage in browser
- Login again to get new token
- Check `JWT_SECRET` is set in `.env`

**4. CORS Errors**
```
Access-Control-Allow-Origin error
```
Solution:
- Verify `CLIENT_URL` in server `.env`
- Check CORS configuration in `server/src/index.js`

**5. Seat Already Booked**
```
Error: Seat is already locked by another user
```
Solution:
- This is expected behavior (working correctly)
- User should select different seats
- Or wait for lock to expire (5 minutes)

## 📈 Performance Tips

1. **Enable Redis** for caching and locking
2. **Use MongoDB indexes** (already configured)
3. **Implement rate limiting** for API endpoints
4. **Use CDN** for static assets
5. **Enable gzip compression**
6. **Implement pagination** for large datasets
7. **Use connection pooling** (already configured)

## 🔒 Security Checklist

- [x] Passwords hashed with bcrypt
- [x] JWT tokens for authentication
- [x] Protected API routes
- [x] CORS configured
- [x] Environment variables for secrets
- [ ] Rate limiting (recommended for production)
- [ ] Input sanitization (recommended)
- [ ] HTTPS in production
- [ ] Security headers (helmet.js)

## 📝 Maintenance

### Database Cleanup

```javascript
// Remove expired locks (run periodically)
db.shows.updateMany(
  { "seats.lockedUntil": { $lt: new Date() } },
  { $set: { "seats.$.status": "available" } }
);
```

### Cache Management

```bash
# Clear all cache
redis-cli flushdb

# Clear specific pattern
redis-cli --scan --pattern "cache:movie:*" | xargs redis-cli del
```

### Monitoring

- Monitor MongoDB performance
- Track Redis memory usage
- Log API response times
- Set up error tracking (e.g., Sentry)
- Monitor server resources (CPU, RAM)

## 🎯 Next Steps

Potential enhancements:
1. Payment gateway integration (Stripe, PayPal)
2. Email notifications for bookings
3. QR code generation for tickets
4. Admin dashboard for theater management
5. Real-time seat updates (WebSockets)
6. Mobile app (React Native)
7. Advanced search and filters
8. User reviews and ratings
9. Loyalty program
10. Multi-language support

## 📞 Support

For issues or questions:
1. Check this guide and `REDIS_GUIDE.md`
2. Review code comments (extensively documented)
3. Check console logs for errors
4. Verify environment variables
5. Test Redis and MongoDB connections

## 🎉 Success!

If you can:
- ✅ Sign up and login
- ✅ Browse movies
- ✅ Select seats
- ✅ Lock seats (with timer)
- ✅ Confirm booking
- ✅ View booking history

**Congratulations! Your BookMyShow clone is fully functional!** 🎬🍿
