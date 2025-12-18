# Complete Setup & Testing Guide

## 🎯 Complete Booking Flow

```
1. Home Page → Browse Movies
2. Click Movie → View Shows
3. Click "Select Seats" → Seat Selection Page
4. Select Seats → Click "Lock Seats"
5. 5-Minute Timer Starts
6. Click "Confirm Booking" → Booking Confirmed
7. View Confirmation → See Booking Details
8. "My Bookings" → View All Bookings
```

---

## 🚀 Step-by-Step Setup

### Step 1: Start MongoDB

**Windows:**
```powershell
# Start MongoDB service
net start MongoDB

# Verify it's running
netstat -an | findstr "27017"
```

**Expected:** You should see `TCP    127.0.0.1:27017`

---

### Step 2: Verify Environment Variables

Check `server/.env` file exists with:
```env
MONGODB_URI=mongodb://127.0.0.1:27017/bookmyshow
JWT_SECRET=your-super-secret-key-here
PORT=5000
CLIENT_URL=http://localhost:3000
```

---

### Step 3: Install Dependencies (First Time Only)

```powershell
# Backend
cd d:\bookmyshow\server
npm install

# Frontend
cd d:\bookmyshow\client
npm install
```

---

### Step 4: Seed Database

```powershell
cd d:\bookmyshow\server
npm run seed
```

**Expected Output:**
```
✅ MongoDB Connected for seeding
🗑️  Cleared existing data
✅ Created movies
✅ Created theaters
✅ Created 252 shows

🎉 Seed data created successfully!

Sample data:
- 4 movies
- 3 theaters
- 252 shows
```

---

### Step 5: Start Backend

```powershell
cd d:\bookmyshow\server
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

**✅ If you see this, backend is working!**

---

### Step 6: Start Frontend (New Terminal)

```powershell
cd d:\bookmyshow\client
npm start
```

**Expected Output:**
```
Compiled successfully!

You can now view client in the browser.

  Local:            http://localhost:3000
  On Your Network:  http://192.168.x.x:3000
```

**✅ Browser should open automatically at http://localhost:3000**

---

## 🧪 Complete Testing Flow

### Test 1: Sign Up & Login

1. **Sign Up:**
   - Click "Sign Up" button
   - Enter:
     - Name: `Test User`
     - Email: `test@example.com`
     - Password: `password123`
   - Click "Sign Up"
   - ✅ Should auto-login and redirect to home

2. **Logout & Login:**
   - Click "Logout"
   - Click "Login"
   - Enter email and password
   - Click "Login"
   - ✅ Should redirect to home page

---

### Test 2: Browse Movies

1. **Home Page:**
   - ✅ Should see 4 movies:
     - The Dark Knight
     - Inception
     - Interstellar
     - The Matrix
   - Each movie should show:
     - Title
     - Genre tags
     - Duration
     - Rating

2. **Click on "The Dark Knight":**
   - ✅ Should navigate to shows page
   - ✅ Should see movie details at top
   - ✅ Should see list of shows below

---

### Test 3: View Shows

1. **Shows Page:**
   - ✅ Should see multiple shows
   - Each show displays:
     - Theater name (CineMax Downtown, Grand Cinema, Star Theater)
     - City and Screen number
     - Date and Time
     - "Select Seats" button

2. **Click "Select Seats" on any show:**
   - ✅ Should navigate to seat selection page

---

### Test 4: Seat Selection & Booking

1. **Seat Selection Page:**
   - ✅ Should see:
     - Movie title and show details at top
     - Seat map (5 rows × 10 columns)
     - Legend showing seat colors
     - "Lock Seats" button (disabled initially)

2. **Select Seats:**
   - Click on 2-3 seats (they turn blue)
   - ✅ "Lock Seats" button becomes enabled
   - ✅ Total price updates

3. **Lock Seats:**
   - Click "Lock Seats" button
   - ✅ Seats turn yellow (locked)
   - ✅ 5-minute countdown timer appears
   - ✅ "Confirm Booking" button appears

4. **Confirm Booking:**
   - Click "Confirm Booking"
   - ✅ Should navigate to confirmation page
   - ✅ Should see:
     - "Booking Confirmed!" message
     - Booking ID
     - Movie and show details
     - Seat numbers
     - Total amount
     - Payment status
     - "Print Ticket" button

---

### Test 5: View Bookings

1. **Click "My Bookings" in navigation:**
   - ✅ Should see list of all your bookings
   - Each booking shows:
     - Movie title
     - Theater name
     - Show date and time
     - Seat numbers
     - Total amount
     - Booking date

2. **Click on a booking:**
   - ✅ Should navigate to booking details page
   - ✅ Should see full booking information

---

### Test 6: Concurrent Booking (Advanced)

1. **Open two browser windows side-by-side:**
   - Window 1: Login as `test@example.com`
   - Window 2: Login as `test2@example.com` (sign up first)

2. **Both select same show:**
   - Navigate to same movie and show

3. **Try to lock same seat:**
   - Window 1: Select seat A1, click "Lock Seats"
   - ✅ Seat A1 turns yellow
   - Window 2: Try to select seat A1
   - ✅ Seat A1 should be gray (unavailable)
   - ✅ Cannot select already locked seat

**This proves the locking mechanism works!**

---

### Test 7: Lock Expiry

1. **Lock seats but don't confirm:**
   - Select and lock seats
   - Wait 5+ minutes
   - Try to click "Confirm Booking"
   - ✅ Should show error: "Lock expired"

2. **Refresh page:**
   - ✅ Seats should be available again (green)

---

## 🔍 Troubleshooting

### Problem: MongoDB Connection Error

**Error:** `connect ECONNREFUSED ::1:27017`

**Solution:**
```powershell
# Check if MongoDB is running
netstat -an | findstr "27017"

# If not running, start it
net start MongoDB

# Or start manually
cd "C:\Program Files\MongoDB\Server\7.0\bin"
mongod --dbpath "C:\data\db"
```

---

### Problem: Schema Registration Error

**Error:** `Schema hasn't been registered for model "Theater"`

**Solution:** Already fixed! Models are imported in `server/src/index.js`:
```javascript
require('./models/User');
require('./models/Movie');
require('./models/Theater');
require('./models/Show');
require('./models/Booking');
```

**Verify:** Check `server/src/index.js` lines 10-14

---

### Problem: No Movies Showing

**Solution:**
```powershell
# Re-seed database
cd d:\bookmyshow\server
npm run seed
```

---

### Problem: Authentication Not Working

**Solution:**
```javascript
// Clear browser storage
localStorage.clear()

// Then sign up again
```

---

### Problem: Seats Not Locking

**Check:**
1. Are you logged in? (Check top-right corner)
2. Is backend running? (Check terminal)
3. Check browser console for errors (F12)

**Solution:**
```powershell
# Restart backend
cd d:\bookmyshow\server
npm start
```

---

## 📊 Database Verification

### Check Data in MongoDB

```powershell
# Connect to MongoDB
mongosh mongodb://127.0.0.1:27017/bookmyshow

# View movies
db.movies.find().pretty()

# View theaters
db.theaters.find().pretty()

# View shows
db.shows.countDocuments()

# View bookings
db.bookings.find().pretty()

# View users
db.users.find({}, {password: 0}).pretty()
```

---

## 🎯 Success Checklist

After following all steps, verify:

- [ ] MongoDB is running (port 27017)
- [ ] Backend starts without errors
- [ ] Frontend loads at localhost:3000
- [ ] Can sign up and login
- [ ] See 4 movies on home page
- [ ] Can click movie and see shows
- [ ] Can select seats (turn blue)
- [ ] Can lock seats (turn yellow, timer starts)
- [ ] Can confirm booking
- [ ] See booking confirmation
- [ ] See booking in "My Bookings"
- [ ] Concurrent locking works (test with 2 windows)

**If all checked ✅ - Your application is fully working!**

---

## 🔧 Quick Commands Reference

```powershell
# Start MongoDB
net start MongoDB

# Start Backend
cd d:\bookmyshow\server
npm start

# Start Frontend (new terminal)
cd d:\bookmyshow\client
npm start

# Seed Database
cd d:\bookmyshow\server
npm run seed

# Check MongoDB
mongosh mongodb://127.0.0.1:27017/bookmyshow

# View logs
# Backend: Check terminal where npm start is running
# Frontend: Check browser console (F12)
```

---

## 📝 API Endpoints Reference

### Authentication
- `POST /api/auth/signup` - Sign up
- `POST /api/auth/login` - Login

### Movies & Shows
- `GET /api/movies` - Get all movies
- `GET /api/movies/:id/shows` - Get shows for movie
- `GET /api/shows/:id` - Get show details with seats

### Booking (Requires Auth)
- `POST /api/booking/lock` - Lock seats
- `POST /api/booking/confirm` - Confirm booking
- `POST /api/booking/release` - Release locks
- `GET /api/booking/my-bookings` - Get user bookings
- `GET /api/booking/:id` - Get booking details

---

## 🎉 You're All Set!

Your complete BookMyShow application is now:
- ✅ Fully functional
- ✅ Fast and optimized
- ✅ Properly authenticated
- ✅ Handling concurrent bookings
- ✅ Managing seat locks correctly
- ✅ Ready for testing and demo

**Enjoy your movie booking system!** 🎬🍿
