# Quick Start Guide

Follow these steps to get the BookMyShow clone up and running:

## Step 1: Prerequisites Check

Ensure you have:
- ✅ Node.js installed (`node --version`)
- ✅ MongoDB running (`mongod` or service)
- ✅ Redis running (`redis-cli ping` should return PONG)

## Step 2: Environment Setup

### Server Environment
Create `server/.env`:
```env
MONGO_URI=mongodb://localhost:27017/bookmyshow
REDIS_URL=redis://localhost:6379
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000
```

### Client Environment
Create `client/.env`:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

## Step 3: Install Dependencies

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

## Step 4: Seed Database

```bash
cd server
npm run seed
```

This creates sample movies, theaters, and shows.

## Step 5: Start Services

### Terminal 1 - Backend Server
```bash
cd server
npm run dev
```

You should see:
- ✅ MongoDB Connected
- ✅ Redis Connected
- 🚀 Server running on port 5000

### Terminal 2 - Frontend
```bash
cd client
npm start
```

The React app will open at http://localhost:3000

## Step 6: Test the Application

1. **Sign Up**: Create a new account at http://localhost:3000/signup
2. **Browse Movies**: View available movies on the home page
3. **Select Show**: Click on a movie → Select a show time
4. **Select Seats**: Choose seats and click "Lock Seats"
5. **Confirm Booking**: Complete the booking within 5 minutes

## Testing Redis Locking

To test the concurrency feature:

1. Open two browser windows (or use incognito mode)
2. Login with different accounts
3. Try to select the same seat simultaneously
4. Only one user should be able to lock the seat
5. Wait 5 minutes - the lock should expire automatically

## Verify Redis Locks

In a new terminal:
```bash
redis-cli
KEYS lock:*
```

This shows all active seat locks.

## Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running: `mongod`
- Check connection string in `.env`

### Redis Connection Error
- Ensure Redis is running: `redis-server`
- Test connection: `redis-cli ping`

### Port Already in Use
- Change `PORT` in `server/.env`
- React will prompt for alternative port

### CORS Errors
- Ensure `CLIENT_URL` in `server/.env` matches your frontend URL

## Next Steps

- Explore the codebase structure
- Check MongoDB Compass to view data
- Monitor Redis locks during booking
- Test concurrent seat selection scenarios

