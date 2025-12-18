# Environment Variables Setup Guide

## Step 1: Server Environment Variables

Create a file named `.env` in the `server/` directory and add the following:

```env
MONGO_URI=mongodb://localhost:27017/bookmyshow
REDIS_URL=redis://localhost:6379
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000
```

### Explanation of Variables:

- **MONGO_URI**: MongoDB connection string. Default port is 27017. `bookmyshow` is the database name.
- **REDIS_URL**: Redis connection string. Default port is 6379.
- **JWT_SECRET**: A secret key for signing JWT tokens. **IMPORTANT**: Generate a strong random string for production (e.g., use `openssl rand -base64 32`).
- **PORT**: Backend server port (default: 5000).
- **NODE_ENV**: Environment mode (development/production).
- **CLIENT_URL**: Frontend URL for CORS configuration.

## Step 2: Client Environment Variables

Create a file named `.env` in the `client/` directory and add:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

### Explanation:

- **REACT_APP_API_URL**: Base URL for API calls from React frontend.

## Step 3: Quick Setup Commands

### Windows (PowerShell):

```powershell
# Create server .env
@"
MONGO_URI=mongodb://localhost:27017/bookmyshow
REDIS_URL=redis://localhost:6379
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000
"@ | Out-File -FilePath server\.env -Encoding utf8

# Create client .env
@"
REACT_APP_API_URL=http://localhost:5000/api
"@ | Out-File -FilePath client\.env -Encoding utf8
```

### Mac/Linux:

```bash
# Create server .env
cat > server/.env << EOF
MONGO_URI=mongodb://localhost:27017/bookmyshow
REDIS_URL=redis://localhost:6379
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000
EOF

# Create client .env
cat > client/.env << EOF
REACT_APP_API_URL=http://localhost:5000/api
EOF
```

## Step 4: Verify Prerequisites

### Check MongoDB:
```bash
mongod --version
# Start MongoDB (if not running as service)
mongod
```

### Check Redis:
```bash
redis-cli ping
# Should return: PONG
# If not, start Redis:
redis-server
```

### Check Node.js:
```bash
node --version
npm --version
```

## Step 5: Generate JWT Secret (Optional but Recommended)

### Windows (PowerShell):
```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

### Mac/Linux:
```bash
openssl rand -base64 32
```

Replace `your_super_secret_jwt_key_change_this_in_production` in the `.env` file with the generated value.

## Troubleshooting

### MongoDB Connection Issues:
- Ensure MongoDB is running: `mongod`
- Check if port 27017 is available
- Verify connection: `mongosh` or `mongo`

### Redis Connection Issues:
- Ensure Redis is running: `redis-server`
- Check if port 6379 is available
- Test connection: `redis-cli ping` (should return PONG)

### Port Conflicts:
- If port 5000 is in use, change `PORT` in server `.env`
- If port 3000 is in use, React will prompt to use another port

