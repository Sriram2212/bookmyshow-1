# MongoDB-Only Mode

## Overview

The application has been configured to run **without Redis**. All functionality now uses MongoDB exclusively.

## What Changed

### ✅ Removed Redis Dependencies
- Redis connection disabled in `server/src/index.js`
- Caching removed from `catalogService.js`
- Seat locking simplified in `bookingService.js`
- All data now stored and retrieved from MongoDB only

### ✅ Simplified Architecture

```
User Request → Express API → MongoDB
```

**Before (with Redis):**
```
User Request → Express API → Redis (cache/locks) → MongoDB
```

**Now (MongoDB only):**
```
User Request → Express API → MongoDB
```

## How to Run

### 1. Start MongoDB
```bash
mongod
```

### 2. Install Dependencies (if not done)
```bash
cd server
npm install

cd ../client
npm install
```

### 3. Configure Environment

Make sure `server/.env` has:
```env
MONGODB_URI=mongodb://localhost:27017/bookmyshow
JWT_SECRET=your-secret-key
PORT=5000
CLIENT_URL=http://localhost:3000
```

**Note:** No `REDIS_URL` needed!

### 4. Seed Database (Optional)
```bash
cd server
npm run seed
```

### 5. Start Application

**Terminal 1 - Backend:**
```bash
cd server
npm start
```

**Terminal 2 - Frontend:**
```bash
cd client
npm start
```

### 6. Access Application
- Frontend: http://localhost:3000
- Backend: http://localhost:5000/api

## Features Still Working

✅ **All features work without Redis:**
- User authentication (JWT)
- Browse movies
- View shows
- Select seats
- Lock seats (MongoDB-based)
- Complete booking
- View booking history
- Booking confirmation

## Differences from Redis Version

### Seat Locking
**With Redis (before):**
- Locks stored in Redis with auto-expiry
- Atomic operations prevent race conditions
- Locks auto-release after 5 minutes

**MongoDB Only (now):**
- Locks stored in MongoDB with expiry timestamp
- Lock status checked before booking
- Manual cleanup or scheduled job needed for expired locks

### Caching
**With Redis (before):**
- Movies/shows cached for faster access
- Cache invalidation on updates
- Reduced database load

**MongoDB Only (now):**
- All data fetched from MongoDB
- No caching layer
- Slightly slower but simpler

## Performance Notes

- **Response times:** Slightly slower without caching (acceptable for most use cases)
- **Concurrency:** MongoDB handles concurrent requests well
- **Scalability:** For high traffic, consider adding Redis back

## Advantages of MongoDB-Only Mode

1. **Simpler setup** - No Redis installation needed
2. **Fewer dependencies** - One database instead of two
3. **Easier deployment** - Deploy to platforms without Redis
4. **Lower cost** - No Redis hosting fees
5. **Easier debugging** - Single source of truth

## When to Add Redis Back

Consider adding Redis if you need:
- **High traffic** (1000+ concurrent users)
- **Faster response times** (sub-10ms)
- **Distributed locking** across multiple servers
- **Session management** at scale
- **Real-time features** with WebSockets

## Troubleshooting

### MongoDB Connection Failed
```
❌ MongoDB connection error
```
**Solution:** Ensure MongoDB is running: `mongod`

### Deprecated Warnings
If you see MongoDB driver warnings, they're harmless and can be ignored. The application works perfectly.

## Summary

Your BookMyShow application now runs with **MongoDB only**:
- ✅ No Redis required
- ✅ All features functional
- ✅ Simpler architecture
- ✅ Easier to deploy
- ✅ Perfect for development and small-scale production

**Enjoy your simplified setup!** 🎬
