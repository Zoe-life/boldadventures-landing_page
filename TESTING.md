# Backend Testing Guide

## Testing Without MongoDB

Since MongoDB may not be available in all environments, here are the options for testing:

### Option 1: Use MongoDB Atlas (Recommended for Production)

1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster (Free tier available)
3. Get your connection string
4. Update `.env` file:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/boldadventures?retryWrites=true&w=majority
   ```
5. Run the server:
   ```bash
   npm run dev
   ```

### Option 2: Use Local MongoDB

1. Install MongoDB:
   - **macOS**: `brew install mongodb-community`
   - **Ubuntu**: `sudo apt-get install mongodb`
   - **Windows**: Download from [mongodb.com](https://www.mongodb.com/try/download/community)

2. Start MongoDB:
   ```bash
   mongod
   ```

3. Run the server:
   ```bash
   npm run dev
   ```

### Option 3: Use Docker

```bash
# Start MongoDB in Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Run the server
npm run dev
```

## Manual API Testing

### Test Health Check (No DB required)

```bash
# Start server (will fail to connect to DB but health endpoint may work)
npm start

# In another terminal
curl http://localhost:5000/api/health
```

### Testing with Postman or cURL

Once MongoDB is connected and server is running:

#### 1. Register a User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "TestPass123!"
  }'
```

#### 2. Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123!"
  }'
```

#### 3. Get Tours (Public)
```bash
curl http://localhost:5000/api/tours
```

#### 4. Subscribe to Newsletter (Public)
```bash
curl -X POST http://localhost:5000/api/newsletter/subscribe \
  -H "Content-Type: application/json" \
  -d '{
    "email": "subscriber@example.com"
  }'
```

#### 5. Get User Profile (Protected)
```bash
# Replace TOKEN with the token from login response
curl http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer TOKEN"
```

## Testing Checklist

- [ ] Server starts without errors (with MongoDB connection)
- [ ] Health check endpoint responds
- [ ] User registration works
- [ ] User login returns tokens
- [ ] Protected routes require authentication
- [ ] Role-based access control works
- [ ] Tours API returns data
- [ ] Newsletter subscription works
- [ ] Rate limiting prevents abuse
- [ ] CORS headers are set correctly
- [ ] Security headers are present

## Using the Seed Script

If MongoDB is available:

```bash
# Seed the database with test data
npm run seed

# Now you can login with test accounts:
# Admin: admin@boldadventures.com / Admin123!
# Guide: guide@boldadventures.com / Guide123!
# User: user@example.com / User123!
```

## Production Deployment Testing

After deploying to Render:

```bash
# Replace YOUR_DOMAIN with your actual domain
export API_URL=https://your-app.onrender.com

# Test health check
curl $API_URL/api/health

# Test registration
curl -X POST $API_URL/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "TestPass123!"
  }'
```
