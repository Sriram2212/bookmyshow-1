# Test Booking Flow - Step by Step

## 🔍 Error: "Booking Not Found" - Solutions

### Possible Causes:
1. Booking not created in database
2. Invalid booking ID
3. Database connection issue
4. Population (join) failing

### ✅ Fixes Applied:

1. **Added error handling in bookingRepository.create()**
   - Logs when booking is saved
   - Throws detailed error if save fails

2. **Added validation in confirmBooking()**
   - Checks if booking._id exists after creation
   - Throws error if booking not created properly

3. **Added error handling in bookingRepository.findById()**
   - Logs when booking is found/not found
   - Returns null if not found
   - Throws error with details if query fails

4. **Added logging in bookingController**
   - Logs booking confirmation request
   - Logs successful booking creation
   - Logs errors with details

---

## 🧪 Manual Testing Steps

### Step 1: Start Everything

```powershell
# Terminal 1: MongoDB
net start MongoDB

# Terminal 2: Backend
cd d:\bookmyshow\server
npm start

# Terminal 3: Frontend
cd d:\bookmyshow\client
npm start
```

---

### Step 2: Test Complete Booking Flow

#### A. Sign Up / Login
1. Open http://localhost:3000
2. Click "Sign Up"
3. Enter:
   - Name: Test User
   - Email: test@test.com
   - Password: test123
4. Click "Sign Up"
5. ✅ Should auto-login

#### B. Browse and Select Movie
1. Home page shows movies
2. Click on "The Dark Knight"
3. ✅ Shows page displays

#### C. Select Show
1. Click "Select Seats" on any show
2. ✅ Seat selection page loads

#### D. Lock Seats
1. Click on 2-3 seats (turn blue)
2. Click "Lock Seats"
3. ✅ Seats turn yellow
4. ✅ Timer starts

**Check Backend Terminal:**
```
✅ Seat A1 locked for user 67...
✅ Seat A2 locked for user 67...
```

#### E. Confirm Booking
1. Click "Confirm Booking"

**Check Backend Terminal - Should See:**
```
📝 Confirm booking request: { userId: '67...', showId: '67...', seatIds: 2 }
📝 Booking created: 67... for user 67...
✅ Booking saved to DB: 67...
✅ Booking found: 67...
✅ Booking confirmed: 67...
✅ Booking confirmed successfully: 67...
```

2. ✅ Should redirect to confirmation page
3. ✅ Should see booking details

---

### Step 3: Verify in Database

```powershell
# Connect to MongoDB
mongosh mongodb://127.0.0.1:27017/bookmyshow

# Check if booking exists
db.bookings.find().pretty()

# Should see your booking with:
# - _id
# - user (ObjectId)
# - show (ObjectId)
# - seats array
# - totalAmount
# - paymentStatus: "completed"
# - bookingStatus: "confirmed"
```

---

## 🔍 Debugging Steps

### If "Booking Not Found" Error Occurs:

#### 1. Check Backend Logs

Look for these messages in backend terminal:

**Good Flow:**
```
📝 Confirm booking request: { userId: '...', showId: '...', seatIds: 2 }
📝 Booking created: ... for user ...
✅ Booking saved to DB: ...
✅ Booking found: ...
✅ Booking confirmed successfully: ...
```

**Bad Flow (Error):**
```
❌ Error creating booking: ...
OR
❌ Booking not found: ...
OR
❌ Failed to retrieve booking details
```

#### 2. Check MongoDB Connection

```powershell
# In backend terminal, you should see:
✅ MongoDB Connected: 127.0.0.1

# If not, restart MongoDB:
net start MongoDB
```

#### 3. Check Database Has Data

```powershell
mongosh mongodb://127.0.0.1:27017/bookmyshow

# Check collections exist
show collections

# Should see:
# - users
# - movies
# - theaters
# - shows
# - bookings

# Check shows have data
db.shows.countDocuments()
# Should be > 0

# If 0, re-seed:
npm run seed
```

#### 4. Check Browser Console

Press F12 in browser, check Console tab:

**Good:**
```
POST http://localhost:5000/api/booking/confirm 201 (Created)
```

**Bad:**
```
POST http://localhost:5000/api/booking/confirm 400 (Bad Request)
OR
POST http://localhost:5000/api/booking/confirm 500 (Internal Server Error)
```

#### 5. Check Network Tab

F12 → Network tab → Click on "confirm" request:

**Response should be:**
```json
{
  "success": true,
  "message": "Booking confirmed successfully",
  "data": {
    "_id": "67...",
    "user": {...},
    "show": {...},
    "seats": [...],
    "totalAmount": 25.98,
    ...
  }
}
```

**If data is null or missing _id:**
- Backend didn't create booking properly
- Check backend terminal for error messages

---

## 🛠️ Common Fixes

### Fix 1: Re-seed Database

```powershell
cd d:\bookmyshow\server
npm run seed
```

### Fix 2: Clear and Restart

```powershell
# Stop backend (Ctrl+C)
# Stop frontend (Ctrl+C)

# Clear MongoDB data
mongosh mongodb://127.0.0.1:27017/bookmyshow
db.dropDatabase()
exit

# Re-seed
cd d:\bookmyshow\server
npm run seed

# Restart backend
npm start

# Restart frontend (new terminal)
cd d:\bookmyshow\client
npm start
```

### Fix 3: Clear Browser Data

```javascript
// In browser console (F12)
localStorage.clear()
// Then refresh page and login again
```

### Fix 4: Check Environment Variables

File: `d:\bookmyshow\server\.env`

Should contain:
```env
MONGODB_URI=mongodb://127.0.0.1:27017/bookmyshow
JWT_SECRET=your-secret-key
PORT=5000
CLIENT_URL=http://localhost:3000
```

---

## 📊 Expected Database State After Booking

### Bookings Collection:

```javascript
{
  "_id": ObjectId("67..."),
  "user": ObjectId("67..."),
  "show": ObjectId("67..."),
  "seats": [
    {
      "seatId": ObjectId("67..."),
      "seatNumber": "A1",
      "price": 12.99
    },
    {
      "seatId": ObjectId("67..."),
      "seatNumber": "A2",
      "price": 12.99
    }
  ],
  "totalAmount": 25.98,
  "paymentStatus": "completed",
  "paymentId": "PAY_...",
  "bookingStatus": "confirmed",
  "bookingDate": ISODate("2025-12-18T..."),
  "createdAt": ISODate("2025-12-18T..."),
  "updatedAt": ISODate("2025-12-18T...")
}
```

### Shows Collection (Seats Updated):

```javascript
{
  "_id": ObjectId("67..."),
  "seats": [
    {
      "_id": ObjectId("67..."),
      "seatNumber": "A1",
      "status": "booked",  // Changed from "locked"
      "lockedBy": null,
      "lockedUntil": null
    },
    {
      "_id": ObjectId("67..."),
      "seatNumber": "A2",
      "status": "booked",  // Changed from "locked"
      "lockedBy": null,
      "lockedUntil": null
    }
  ]
}
```

---

## ✅ Success Indicators

Your booking flow is working if:

1. ✅ Backend logs show "Booking created" and "Booking confirmed"
2. ✅ Frontend redirects to confirmation page
3. ✅ Confirmation page shows booking details (not error)
4. ✅ MongoDB bookings collection has new document
5. ✅ Show seats status changed from "locked" to "booked"
6. ✅ "My Bookings" page shows the booking

---

## 🎯 Quick Test Command

```powershell
# Test booking creation directly in MongoDB
mongosh mongodb://127.0.0.1:27017/bookmyshow

# Count bookings before
db.bookings.countDocuments()

# Do a booking in the app

# Count bookings after
db.bookings.countDocuments()
# Should increase by 1

# View latest booking
db.bookings.find().sort({createdAt: -1}).limit(1).pretty()
```

---

## 📞 Still Having Issues?

### Check These Files Were Updated:

1. ✅ `server/src/repositories/bookingRepository.js` - Added error handling
2. ✅ `server/src/services/bookingService.js` - Added validation
3. ✅ `server/src/controllers/bookingController.js` - Added logging

### Verify Changes:

```powershell
# Check if models are imported
cat server/src/index.js | findstr "models"

# Should see:
# require('./models/User');
# require('./models/Movie');
# require('./models/Theater');
# require('./models/Show');
# require('./models/Booking');
```

---

## 🎉 Final Checklist

- [ ] MongoDB is running
- [ ] Backend starts without errors
- [ ] Frontend loads at localhost:3000
- [ ] Can login successfully
- [ ] Can see movies
- [ ] Can select show
- [ ] Can select and lock seats
- [ ] Backend logs show "Booking created"
- [ ] Confirmation page loads (not error)
- [ ] Booking appears in "My Bookings"
- [ ] MongoDB has booking document

**If all checked ✅ - Your booking system is fully working!**
