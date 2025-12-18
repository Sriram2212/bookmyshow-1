# Quick Start Guide - MongoDB Only

## ⚠️ IMPORTANT: Start MongoDB First!

### Step 1: Start MongoDB

**Option A: MongoDB as Windows Service**
```powershell
# Start MongoDB service
net start MongoDB

# Check if running
sc query MongoDB
```

**Option B: Start MongoDB Manually**
```powershell
# Navigate to MongoDB bin folder (adjust path to your installation)
cd "C:\Program Files\MongoDB\Server\7.0\bin"

# Start MongoDB
.\mongod.exe --dbpath "C:\data\db"
```

**Option C: Using MongoDB Compass**
1. Open MongoDB Compass
2. Connect to `mongodb://127.0.0.1:27017`
3. MongoDB will start automatically

### Step 2: Verify MongoDB is Running

```powershell
# Test connection
mongosh mongodb://127.0.0.1:27017

# Or check if port is listening
netstat -an | findstr "27017"
```

You should see: `TCP    127.0.0.1:27017`

### Step 3: Configure Environment

Make sure `server/.env` exists with:
```env
MONGODB_URI=mongodb://127.0.0.1:27017/bookmyshow
JWT_SECRET=your-secret-key-here
PORT=5000
CLIENT_URL=http://localhost:3000
```

### Step 4: Install Dependencies (First Time Only)

```powershell
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### Step 5: Seed Database (Optional but Recommended)

```powershell
cd server
npm run seed
```

This creates:
- Sample movies
- Sample theaters
- Sample shows with seats

### Step 6: Start Backend

```powershell
cd server
npm start
```

**Expected Output:**
```
✅ MongoDB Connected: 127.0.0.1
🚀 Server running on port 5000
📡 API available at http://localhost:5000/api
ℹ️  Redis disabled - using MongoDB only mode
✅ MongoDB-only mode active
```

### Step 7: Start Frontend (New Terminal)

```powershell
cd client
npm start
```

**Expected Output:**
```
Compiled successfully!
You can now view client in the browser.
  Local:            http://localhost:3000
```

### Step 8: Access Application

Open browser: **http://localhost:3000**

## 🎯 Test the Application

### 1. Sign Up
- Click "Sign Up"
- Create account with email and password
- You'll be logged in automatically

### 2. Browse Movies
- See list of movies on home page
- Click on any movie to see shows

### 3. Book Tickets
- Select a show
- Choose seats (click to select)
- Click "Lock Seats" - 5 minute timer starts
- Click "Confirm Booking" to complete
- View confirmation page

### 4. View Bookings
- Click "My Bookings" in navigation
- See all your bookings
- Click on booking to see details

## ❌ Troubleshooting

### Error: MongoDB connection error: connect ECONNREFUSED

**Problem:** MongoDB is not running

**Solution:**
1. Start MongoDB service: `net start MongoDB`
2. Or run manually: `mongod --dbpath "C:\data\db"`
3. Verify with: `netstat -an | findstr "27017"`

### Error: Schema hasn't been registered for model "Theater"

**Problem:** Models not loaded before use

**Solution:** Already fixed! Models are now imported in `server/src/index.js`

### Error: Failed to load resource: net::ERR_CONNECTION_REFUSED

**Problem:** Backend server not running

**Solution:**
1. Make sure MongoDB is running first
2. Start backend: `cd server && npm start`
3. Check output for errors

### Error: Invalid or expired token

**Problem:** Authentication token expired

**Solution:**
1. Logout and login again
2. Or clear localStorage in browser console:
   ```javascript
   localStorage.clear()
   ```

### Seats not locking properly

**Problem:** Stale data or concurrent access

**Solution:** Already fixed! Each seat lock now fetches fresh data

## 📊 MongoDB Commands

### View Data in MongoDB

```powershell
# Connect to MongoDB
mongosh mongodb://127.0.0.1:27017/bookmyshow

# List collections
show collections

# View movies
db.movies.find().pretty()

# View shows
db.shows.find().pretty()

# View bookings
db.bookings.find().pretty()

# View users
db.users.find().pretty()

# Count documents
db.movies.countDocuments()
db.shows.countDocuments()
db.bookings.countDocuments()
```

### Clear All Data

```powershell
mongosh mongodb://127.0.0.1:27017/bookmyshow

# Drop entire database
db.dropDatabase()

# Then re-seed
cd server
npm run seed
```

## 🎬 Complete Workflow

1. **Start MongoDB** → `net start MongoDB`
2. **Start Backend** → `cd server && npm start`
3. **Start Frontend** → `cd client && npm start`
4. **Open Browser** → `http://localhost:3000`
5. **Sign Up** → Create account
6. **Browse Movies** → Click on movie
7. **Select Show** → Choose show time
8. **Select Seats** → Click seats to select
9. **Lock Seats** → 5-minute timer starts
10. **Confirm Booking** → Complete payment
11. **View Confirmation** → See booking details
12. **My Bookings** → View all bookings

## ✅ Success Indicators

Your setup is working if:

1. ✅ MongoDB connects without errors
2. ✅ Server starts on port 5000
3. ✅ Frontend loads at localhost:3000
4. ✅ You can sign up and login
5. ✅ Movies display on home page
6. ✅ You can select and lock seats
7. ✅ Booking confirmation appears
8. ✅ Bookings show in "My Bookings"

## 🚀 Quick Commands

```powershell
# Start everything (3 terminals)

# Terminal 1: MongoDB
net start MongoDB

# Terminal 2: Backend
cd d:\bookmyshow\server
npm start

# Terminal 3: Frontend
cd d:\bookmyshow\client
npm start
```

## 📝 Notes

- **No Redis needed** - Application works with MongoDB only
- **Seat locks** expire after 5 minutes automatically
- **Authentication** uses JWT tokens stored in localStorage
- **All data** persists in MongoDB
- **Fast and simple** setup for development

---

**Need help? Check the error messages and refer to troubleshooting section above!** 🎉
