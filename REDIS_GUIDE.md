# Redis Integration Guide

## Overview

This BookMyShow application uses **Redis** for two critical features:
1. **Caching** - Fast data retrieval for movies, shows, and seat availability
2. **Seat Locking** - Temporary seat reservations during the booking process

## Why Redis?

### Caching Benefits
- **Speed**: Redis stores data in-memory, providing sub-millisecond response times
- **Reduced Database Load**: Frequently accessed data is cached, reducing MongoDB queries
- **Scalability**: Handles high traffic without overwhelming the database

### Seat Locking Benefits
- **Atomic Operations**: Prevents race conditions when multiple users book simultaneously
- **Auto-Expiry**: Locks automatically release after 5 minutes if payment isn't completed
- **High Performance**: Fast lock/unlock operations for real-time booking

## Redis Setup

### Option 1: Local Redis (Development)

#### Windows
1. Download Redis from: https://github.com/microsoftarchive/redis/releases
2. Install and run Redis server:
   ```bash
   redis-server
   ```
3. Verify Redis is running:
   ```bash
   redis-cli ping
   # Should return: PONG
   ```

#### macOS
```bash
brew install redis
brew services start redis
```

#### Linux
```bash
sudo apt-get install redis-server
sudo systemctl start redis
```

### Option 2: Redis Cloud (Production)

1. Sign up at: https://redis.com/try-free/
2. Create a free database
3. Copy your connection URL (format: `rediss://username:password@host:port`)
4. Add to `.env` file:
   ```
   REDIS_URL=rediss://default:your-password@your-host:port
   ```

### Environment Configuration

Create/update `server/.env`:
```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/bookmyshow

# Redis (choose one)
REDIS_URL=redis://localhost:6379              # Local
# REDIS_URL=rediss://user:pass@host:port      # Cloud

# JWT
JWT_SECRET=your-secret-key-here

# Server
PORT=5000
CLIENT_URL=http://localhost:3000
```

## Redis Data Structure

### Cache Keys
```
cache:movies:all                    # All movies list
cache:movie:{movieId}               # Single movie details
cache:shows:movie:{movieId}:{date}  # Shows for a movie
cache:show:{showId}                 # Show details with seats
```

### Lock Keys
```
lock:{showId}:{seatId}              # Seat lock
Value: userId (who locked the seat)
Expiry: 300 seconds (5 minutes)
```

## How It Works

### 1. Caching Flow

```
User Request → Check Redis Cache → Cache Hit? 
                                      ↓ Yes: Return cached data
                                      ↓ No: Query MongoDB
                                      ↓ Store in Redis (with TTL)
                                      ↓ Return data
```

**TTL (Time To Live):**
- Movies list: 5 minutes
- Movie details: 5 minutes
- Shows list: 5 minutes
- Show details: 2 minutes (shorter due to frequent seat updates)

### 2. Seat Locking Flow

```
User Selects Seats
    ↓
Lock Request → Check Redis Lock → Already Locked?
                                      ↓ No: Create lock (NX operation)
                                      ↓ Update MongoDB seat status
                                      ↓ Return success
                                      ↓ Yes: Return error
    ↓
User Completes Payment (within 5 minutes)
    ↓
Verify Lock Ownership → Create Booking → Update Seats to Booked → Release Redis Lock
    ↓
Booking Confirmed!
```

**If user doesn't complete payment:**
- Redis lock auto-expires after 5 minutes
- Seat becomes available again
- No manual cleanup needed!

## Code Examples

### Using Cache (Catalog Service)

```javascript
// GET request with caching
async getMovies() {
  const cacheKey = 'cache:movies:all';
  
  // Try cache first
  const cached = await safeGetCache(cacheKey);
  if (cached) {
    console.log('✅ Cache HIT');
    return JSON.parse(cached);
  }
  
  // Cache miss - fetch from DB
  console.log('❌ Cache MISS');
  const movies = await movieRepository.findAll();
  
  // Store in cache for 5 minutes
  await safeSetCache(cacheKey, JSON.stringify(movies), 300);
  return movies;
}
```

### Using Locks (Booking Service)

```javascript
// Lock seats atomically
async lockSeats(showId, seatIds, userId) {
  for (const seatId of seatIds) {
    const lockKey = `lock:${showId}:${seatId}`;
    
    // Atomic lock (only if not exists)
    const acquired = await redisUtils.setLockNX(
      lockKey, 
      userId.toString(), 
      300  // 5 minutes
    );
    
    if (!acquired) {
      throw new Error('Seat already locked');
    }
    
    // Update MongoDB
    await showRepository.updateSeatStatus(showId, [seatId], 'locked', userId);
  }
}
```

## Graceful Degradation

The application works **even if Redis is unavailable**:

```javascript
// Safe wrapper - never crashes the app
const safeGetCache = async (key) => {
  try {
    return await redisUtils.getCache(key);
  } catch (error) {
    console.log('Redis unavailable - skipping cache');
    return null;  // Continue without cache
  }
};
```

**What happens without Redis:**
- ✅ App continues to work normally
- ✅ All data fetched from MongoDB
- ❌ No caching (slower response times)
- ❌ No seat locking (potential double bookings)

## Monitoring Redis

### Check Redis Connection
```bash
redis-cli ping
# PONG = connected
```

### View All Keys
```bash
redis-cli keys "*"
```

### View Cache Keys
```bash
redis-cli keys "cache:*"
```

### View Lock Keys
```bash
redis-cli keys "lock:*"
```

### Get Key Value
```bash
redis-cli get "cache:movies:all"
```

### Check Key TTL
```bash
redis-cli ttl "lock:show123:seat456"
# Returns seconds remaining
```

### Clear All Cache
```bash
redis-cli flushdb
```

## Performance Optimization

### Cache Strategy
- **Read-heavy data** (movies, theaters): Longer TTL (5 min)
- **Frequently updated data** (show seats): Shorter TTL (2 min)
- **Cache invalidation**: Clear cache when data is updated

### Lock Strategy
- **Atomic operations**: Use `SETNX` to prevent race conditions
- **Auto-expiry**: Locks expire automatically (no manual cleanup)
- **Ownership verification**: Only lock owner can confirm booking

## Troubleshooting

### Redis Connection Failed
```
❌ Failed to connect to Redis. Caching and seat locking disabled.
```
**Solution:**
1. Check if Redis server is running: `redis-cli ping`
2. Verify `REDIS_URL` in `.env` file
3. For cloud Redis, check firewall/network settings

### Seat Lock Expired
```
Error: Seat is no longer locked by you. Lock may have expired.
```
**Solution:**
- User took too long to complete payment (>5 minutes)
- Ask user to re-select seats and complete payment faster

### Cache Not Working
```
Cache miss (Redis unavailable): cache:movies:all
```
**Solution:**
- Redis is down but app continues to work
- Data fetched from MongoDB (slower but functional)
- Fix Redis connection to restore caching

## Production Checklist

- [ ] Use Redis Cloud or managed Redis service
- [ ] Enable Redis persistence (RDB/AOF)
- [ ] Set up Redis monitoring and alerts
- [ ] Configure Redis maxmemory policy (e.g., `allkeys-lru`)
- [ ] Use connection pooling for high traffic
- [ ] Enable TLS for Redis Cloud connections
- [ ] Set appropriate cache TTLs based on traffic patterns
- [ ] Monitor cache hit/miss ratios
- [ ] Set up Redis backup and recovery

## Additional Resources

- Redis Documentation: https://redis.io/docs/
- Redis Cloud: https://redis.com/
- Node Redis Client: https://github.com/redis/node-redis
- Redis Best Practices: https://redis.io/docs/manual/patterns/

## Summary

Redis enhances this application by:
1. **Caching** frequently accessed data for faster response times
2. **Locking** seats temporarily to prevent double bookings
3. **Auto-expiring** locks to handle abandoned bookings
4. **Graceful degradation** when unavailable

All Redis operations are **thoroughly commented** in the codebase for easy understanding and future modifications.
