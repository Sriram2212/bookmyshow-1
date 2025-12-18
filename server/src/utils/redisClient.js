const redis = require('redis');
require('dotenv').config();

let redisClient = null;

/**
 * REDIS CONNECTION SETUP
 * ======================
 * Create and connect a Redis client for caching and seat locking.
 * 
 * FEATURES:
 * - Supports both redis:// (local) and rediss:// (TLS/Cloud) URLs
 * - Graceful fallback: Server continues if Redis is unavailable
 * - Used for: Movie/Show caching, Seat locking during booking
 * 
 * CONFIGURATION:
 * Set REDIS_URL in .env file:
 * - Local: redis://localhost:6379
 * - Cloud (TLS): rediss://username:password@host:port
 */
const connectRedis = async () => {
  try {
    const url = process.env.REDIS_URL || 'redis://localhost:6379';

    const options = { url };
    
    // If using rediss:// (Redis Cloud / TLS), enable TLS socket
    if (url.startsWith('rediss://')) {
      options.socket = {
        tls: true,
        rejectUnauthorized: false, // OK for dev
      };
    }
    
    redisClient = redis.createClient(options);

    redisClient.on('error', (err) => {
      console.error('❌ Redis Client Error:', err.message);
    });

    redisClient.on('connect', () => {
      console.log('✅ Redis Connected - Caching & Locking Enabled');
    });

    redisClient.on('ready', () => {
      console.log('🚀 Redis Ready for operations');
    });

    await redisClient.connect();

    return redisClient;
  } catch (error) {
    console.error(
      '❌ Failed to connect to Redis. Caching and seat locking disabled.',
      error.message
    );
    // Do NOT throw here – allow the HTTP server to start so other features work.
    redisClient = null;
    return null;
  }
};

const getRedisClient = () => {
  if (!redisClient) {
    throw new Error('Redis client not initialized. Seat locking is currently unavailable.');
  }
  return redisClient;
};

/**
 * REDIS UTILITY FUNCTIONS
 * ========================
 * Comprehensive Redis operations for caching and seat locking
 * All functions throw errors if Redis is unavailable (use safe wrappers in services)
 */
const redisUtils = {
  // ============================================
  // CACHING OPERATIONS
  // ============================================
  
  /**
   * Set cache with TTL (Time To Live)
   * USAGE: Cache frequently accessed data like movie lists, show details
   * EXAMPLE: await redisUtils.setCache('cache:movies:all', JSON.stringify(movies), 300)
   */
  setCache: async (key, value, ttlSeconds = 300) => {
    const client = getRedisClient();
    return await client.setEx(key, ttlSeconds, value);
  },

  /**
   * Get cached value
   * USAGE: Retrieve cached data before hitting database
   * EXAMPLE: const cached = await redisUtils.getCache('cache:movies:all')
   */
  getCache: async (key) => {
    const client = getRedisClient();
    return await client.get(key);
  },

  /**
   * Delete cache entry
   * USAGE: Invalidate cache when data is updated
   * EXAMPLE: await redisUtils.deleteCache('cache:movies:all')
   */
  deleteCache: async (key) => {
    const client = getRedisClient();
    return await client.del(key);
  },

  /**
   * Delete multiple cache entries by pattern
   * USAGE: Bulk cache invalidation
   * EXAMPLE: await redisUtils.deleteCachePattern('cache:show:*')
   */
  deleteCachePattern: async (pattern) => {
    const client = getRedisClient();
    const keys = await client.keys(pattern);
    if (keys.length === 0) return 0;
    return await client.del(keys);
  },

  /**
   * Check if cache key exists
   */
  cacheExists: async (key) => {
    const client = getRedisClient();
    const result = await client.exists(key);
    return result === 1;
  },

  /**
   * Get remaining TTL for a key
   * Returns: Seconds remaining (-1 if no expiry, -2 if not exists)
   */
  getTTL: async (key) => {
    const client = getRedisClient();
    return await client.ttl(key);
  },

  // ============================================
  // SEAT LOCKING OPERATIONS
  // ============================================
  
  /**
   * Lock a seat for a user during booking process
   * USAGE: Prevent double booking during payment
   * EXAMPLE: await redisUtils.setLock('lock:showId:seatId', userId, 300)
   * KEY FORMAT: 'lock:${showId}:${seatId}'
   * VALUE: userId who locked the seat
   * EXPIRY: 5 minutes (300 seconds) - auto-releases if payment not completed
   */
  setLock: async (key, value, expiry = 300) => {
    const client = getRedisClient();
    return await client.setEx(key, expiry, value);
  },

  /**
   * Get lock value (returns userId who locked the seat)
   * USAGE: Verify who owns the lock
   * EXAMPLE: const userId = await redisUtils.getLock('lock:showId:seatId')
   */
  getLock: async (key) => {
    const client = getRedisClient();
    return await client.get(key);
  },

  /**
   * Check if lock exists
   * USAGE: Quick check if seat is locked
   * EXAMPLE: const isLocked = await redisUtils.lockExists('lock:showId:seatId')
   */
  lockExists: async (key) => {
    const client = getRedisClient();
    const result = await client.exists(key);
    return result === 1;
  },

  /**
   * Delete lock (release seat)
   * USAGE: Release seat after booking confirmation or cancellation
   * EXAMPLE: await redisUtils.deleteLock('lock:showId:seatId')
   */
  deleteLock: async (key) => {
    const client = getRedisClient();
    return await client.del(key);
  },

  /**
   * Delete multiple locks (bulk release)
   * USAGE: Release all seats for a booking at once
   * EXAMPLE: await redisUtils.deleteLocks(['lock:show1:seat1', 'lock:show1:seat2'])
   */
  deleteLocks: async (keys) => {
    const client = getRedisClient();
    if (keys.length === 0) return 0;
    return await client.del(keys);
  },

  /**
   * Get all lock keys matching pattern
   * USAGE: Find all locks for a show or user
   * EXAMPLE: await redisUtils.getLockKeys('lock:showId:*')
   */
  getLockKeys: async (pattern) => {
    const client = getRedisClient();
    return await client.keys(pattern);
  },

  // ============================================
  // ADVANCED OPERATIONS
  // ============================================
  
  /**
   * Set lock only if it doesn't exist (atomic operation)
   * USAGE: Prevent race conditions when multiple users try to lock same seat
   * RETURNS: true if lock acquired, false if already locked
   * EXAMPLE: const acquired = await redisUtils.setLockNX('lock:showId:seatId', userId, 300)
   */
  setLockNX: async (key, value, expiry = 300) => {
    const client = getRedisClient();
    const result = await client.set(key, value, {
      NX: true, // Only set if key doesn't exist
      EX: expiry // Set expiry in seconds
    });
    return result === 'OK';
  },

  /**
   * Increment counter (for analytics, rate limiting)
   * USAGE: Track API calls, booking attempts
   * EXAMPLE: await redisUtils.increment('counter:bookings:today')
   */
  increment: async (key, expiry = null) => {
    const client = getRedisClient();
    const value = await client.incr(key);
    if (expiry && value === 1) {
      await client.expire(key, expiry);
    }
    return value;
  },
};

module.exports = {
  connectRedis,
  getRedisClient,
  redisUtils,
};