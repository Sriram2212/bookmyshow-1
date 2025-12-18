# Architecture & System Design

## High-Level Design (HLD)

### System Flow

```
┌─────────┐
│  User   │
└────┬────┘
     │
     ▼
┌─────────────────┐
│  React Frontend │
│  (Port 3000)    │
└────┬────────────┘
     │ HTTP/HTTPS
     ▼
┌─────────────────┐
│  Load Balancer   │ (Conceptual)
│  (Express API)   │
└────┬────────────┘
     │
     ▼
┌─────────────────┐
│  Controller     │ Request Validation
│  Layer          │
└────┬────────────┘
     │
     ▼
┌─────────────────┐
│  Service        │ Business Logic
│  Layer          │
└────┬────────────┘
     │
     ▼
┌─────────────────┐      ┌──────────────┐
│  Redis          │◄────┤ Lock Check   │
│  (Port 6379)    │      │ Cache        │
└────┬────────────┘      └──────────────┘
     │
     ▼
┌─────────────────┐
│  Repository     │ Data Access
│  Layer          │
└────┬────────────┘
     │
     ▼
┌─────────────────┐
│  MongoDB        │ Final Write
│  (Port 27017)   │
└─────────────────┘
```

## Low-Level Design (LLD)

### Controller-Service-Repository Pattern

#### 1. Controller Layer (`server/src/controllers/`)
**Responsibility**: Handle HTTP requests/responses, validate input

- `authController.js`: Signup, Login
- `catalogController.js`: Get movies, shows
- `bookingController.js`: Lock seats, confirm booking

#### 2. Service Layer (`server/src/services/`)
**Responsibility**: Business logic, orchestration

- `authService.js`: User authentication logic
- `catalogService.js`: Movie/show retrieval logic
- `bookingService.js`: **Critical** - Seat locking, booking confirmation

#### 3. Repository Layer (`server/src/repositories/`)
**Responsibility**: Data access, database operations

- `userRepository.js`: User CRUD operations
- `movieRepository.js`: Movie queries
- `showRepository.js`: Show and seat queries
- `bookingRepository.js`: Booking operations

## Concurrency Handling

### Redis-Based Seat Locking

#### Problem Statement
Multiple users trying to book the same seat simultaneously can cause:
- Double booking
- Race conditions
- Data inconsistency

#### Solution: Distributed Locking with Redis

**Key Pattern**: `lock:{showId}:{seatId}`

**Lock Flow**:
```
1. User selects seat → Frontend sends lock request
2. Service checks Redis: GET lock:showId:seatId
3. If exists → Return error (seat locked)
4. If not → SET lock:showId:seatId userId EX 300
5. Update MongoDB: Set seat status to "locked"
6. Return success to user
```

**Booking Confirmation Flow**:
```
1. User confirms payment
2. Verify lock still exists and belongs to user
3. Create booking in MongoDB
4. Update seat status to "booked"
5. Delete Redis lock: DEL lock:showId:seatId
6. Return booking confirmation
```

**Lock Expiry**:
- Redis automatically expires locks after 300 seconds (5 minutes)
- If user doesn't complete booking, lock expires
- Seat becomes available again

### Code Implementation

**Locking Seats** (`bookingService.js`):
```javascript
async lockSeats(showId, seatIds, userId) {
  for (const seatId of seatIds) {
    const lockKey = `lock:${showId}:${seatId}`;
    
    // Check if already locked
    const existingLock = await redisUtils.getLock(lockKey);
    if (existingLock) {
      // Seat unavailable
      continue;
    }
    
    // Set lock with 5-minute expiry
    await redisUtils.setLock(lockKey, userId, 300);
    
    // Update MongoDB
    await showRepository.updateSeatStatus(showId, [seatId], 'locked', userId);
  }
}
```

**Confirming Booking** (`bookingService.js`):
```javascript
async confirmBooking(userId, showId, seatIds, paymentId) {
  // Verify locks
  for (const seatId of seatIds) {
    const lockKey = `lock:${showId}:${seatId}`;
    const lockValue = await redisUtils.getLock(lockKey);
    
    if (!lockValue || lockValue !== userId) {
      throw new Error('Seat no longer locked');
    }
  }
  
  // Create booking in MongoDB
  const booking = await bookingRepository.create({...});
  
  // Update seats to booked
  await showRepository.updateSeatsToBooked(showId, seatIds);
  
  // Release locks
  await redisUtils.deleteLocks(lockKeys);
}
```

## Database Schema

### User
- `_id`: ObjectId
- `name`: String
- `email`: String (unique)
- `password`: String (hashed)
- `phone`: String (optional)

### Movie
- `_id`: ObjectId
- `title`: String
- `description`: String
- `genre`: [String]
- `duration`: Number
- `releaseDate`: Date
- `rating`: Number

### Theater
- `_id`: ObjectId
- `name`: String
- `address`: Object
- `totalScreens`: Number
- `amenities`: [String]

### Show
- `_id`: ObjectId
- `movie`: ObjectId (ref: Movie)
- `theater`: ObjectId (ref: Theater)
- `screen`: String
- `showTime`: Date
- `showDate`: Date
- `seats`: [ShowSeat]
  - `seatNumber`: String
  - `row`: String
  - `column`: Number
  - `seatType`: String
  - `price`: Number
  - `status`: String (available/locked/booked)
  - `lockedBy`: ObjectId (ref: User)
  - `lockedUntil`: Date

### Booking
- `_id`: ObjectId
- `user`: ObjectId (ref: User)
- `show`: ObjectId (ref: Show)
- `seats`: [Object]
- `totalAmount`: Number
- `paymentStatus`: String
- `bookingStatus`: String

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - User login

### Catalog
- `GET /api/movies` - List all movies
- `GET /api/movies/:id` - Get movie details
- `GET /api/shows/movie/:movieId` - Get shows for movie
- `GET /api/shows/:showId` - Get show with seats

### Booking (Authenticated)
- `POST /api/booking/lock` - Lock seats (Redis)
- `POST /api/booking/confirm` - Confirm booking
- `POST /api/booking/release` - Release locks
- `GET /api/booking/my-bookings` - User bookings

## Security Considerations

1. **JWT Authentication**: All booking endpoints require valid JWT token
2. **Password Hashing**: bcrypt with salt rounds = 10
3. **Input Validation**: Controllers validate required fields
4. **Lock Ownership**: Only lock owner can confirm booking
5. **CORS**: Configured for specific frontend origin

## Scalability Notes

### Current Implementation
- Single server instance
- Direct Redis connection
- MongoDB single instance

### Production Considerations
1. **Redis Cluster**: For high availability
2. **MongoDB Replica Set**: For data redundancy
3. **Load Balancer**: Multiple app server instances
4. **Message Queue**: For async booking processing
5. **Caching**: Cache movie/show data in Redis
6. **Database Indexing**: Indexes on frequently queried fields

## Testing Concurrency

### Manual Test
1. Open two browser windows
2. Login with different accounts
3. Navigate to same show
4. Try to select same seat
5. Only one should succeed
6. Wait 5 minutes - lock expires

### Redis Monitoring
```bash
redis-cli
KEYS lock:*
TTL lock:showId:seatId  # Check remaining time
```

## Performance Optimizations

1. **Redis Caching**: Cache movie/show data
2. **Database Indexes**: On showDate, movie, theater
3. **Connection Pooling**: MongoDB connection pool
4. **Batch Operations**: Lock multiple seats in one transaction

