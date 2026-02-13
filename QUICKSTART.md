# Quick Start Guide

Get BoldAdventures backend up and running in minutes!

## Prerequisites

- Node.js v14+ installed ([Download](https://nodejs.org/))
- MongoDB running (local or Atlas)
- A code editor (VS Code recommended)

## 5-Minute Setup

### Step 1: Install Dependencies (1 min)

```bash
npm install
```

### Step 2: Configure Environment (1 min)

```bash
cp .env.example .env
```

Edit `.env` and update at minimum:
```
MONGODB_URI=mongodb://localhost:27017/boldadventures
JWT_SECRET=your-random-secret-here-change-this
JWT_REFRESH_SECRET=your-other-random-secret-here-change-this
```

**Generate secure secrets:**
```bash
# On Linux/Mac
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# On Windows PowerShell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Step 3: Start MongoDB (1 min)

**Option A - Local MongoDB:**
```bash
mongod
```

**Option B - MongoDB Atlas (Cloud):**
1. Create free account at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create cluster → Get connection string
3. Update MONGODB_URI in `.env`

### Step 4: Seed Database (30 sec)

```bash
npm run seed
```

This creates test users and tours. Test accounts:
- Admin: `admin@boldadventures.com` / `Admin123!`
- Guide: `guide@boldadventures.com` / `Guide123!`  
- User: `user@example.com` / `User123!`

### Step 5: Start Server (30 sec)

```bash
npm run dev
```

Server runs at: `http://localhost:5000`

## Quick Test

### Test 1: Health Check
```bash
curl http://localhost:5000/api/health
```

Expected: `{"success":true,"message":"Server is running",...}`

### Test 2: Get Tours
```bash
curl http://localhost:5000/api/tours
```

Expected: List of tours

### Test 3: Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"User123!"}'
```

Expected: User data with access token

## View the Frontend

Open `index.html` in your browser or use a local server:

```bash
# Using Python
python -m http.server 8000

# Using Node.js http-server
npx http-server -p 8000
```

Then visit: `http://localhost:8000`

## Next Steps

1. **Test Login Page**: Open `http://localhost:8000/login.html`
2. **Test Newsletter**: Submit email in contact form
3. **Explore API**: See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
4. **Deploy**: Follow [deployment guide](#deployment) below

## Common Issues

### MongoDB Connection Failed
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Fix**: Start MongoDB with `mongod` or check MONGODB_URI

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::5000
```
**Fix**: Change PORT in `.env` or kill process using port 5000
```bash
# Find process
lsof -i :5000  # On Mac/Linux
netstat -ano | findstr :5000  # On Windows

# Kill process
kill -9 <PID>  # On Mac/Linux
taskkill /PID <PID> /F  # On Windows
```

### JWT Secret Warning
```
Warning: Using development JWT secrets
```
**Fix**: Generate and set proper secrets in `.env` (see Step 2)

## Deployment

### Deploy to Render (Recommended)

1. **Push to GitHub**
   ```bash
   git push origin main
   ```

2. **Create Render Account**
   - Sign up at [render.com](https://render.com)

3. **Create New Web Service**
   - Dashboard → New + → Web Service
   - Connect GitHub repository
   - Render auto-detects `render.yaml`

4. **Add Environment Variables**
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `JWT_SECRET`: Generate a secure random string
   - `JWT_REFRESH_SECRET`: Generate another secure random string
   - `CLIENT_URL`: Your frontend URL

5. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment (3-5 minutes)
   - Access at: `https://your-service.onrender.com`

### Post-Deployment

1. **Test Health**: `curl https://your-service.onrender.com/api/health`
2. **Create Admin**: Register via `/api/auth/register` with `"role":"admin"`
3. **Seed Tours**: POST sample tours via API or admin panel

## Development Workflow

```bash
# Start development server (auto-reload)
npm run dev

# Check code syntax
node -c server.js

# View logs
# Logs appear in terminal

# Stop server
# Press Ctrl+C
```

## API Usage Examples

### Register User
```javascript
fetch('http://localhost:5000/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'John Doe',
    email: 'john@example.com',
    password: 'SecurePass123!'
  })
})
```

### Get Featured Tours
```javascript
fetch('http://localhost:5000/api/tours/featured')
  .then(res => res.json())
  .then(data => console.log(data.data.tours))
```

### Subscribe to Newsletter
```javascript
fetch('http://localhost:5000/api/newsletter/subscribe', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'subscriber@example.com' })
})
```

## Project Structure

```
boldadventures-landing_page/
├── server.js              # Main server file (START HERE)
├── .env                   # Environment variables (CREATE THIS)
├── package.json           # Dependencies and scripts
│
├── server/
│   ├── config/            # Database configuration
│   ├── models/            # MongoDB schemas (User, Tour, Newsletter)
│   ├── controllers/       # Business logic
│   ├── routes/            # API endpoints
│   ├── middleware/        # Auth, validation, errors
│   └── utils/             # Helper functions (JWT)
│
├── Frontend Files
├── index.html            # Main landing page
├── login.html            # Login/register page
├── js/
│   ├── app.js           # Frontend logic
│   └── api.js           # API integration helpers
└── css/                 # Stylesheets
```

## Support

- **Documentation**: [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
- **Security**: [SECURITY.md](./SECURITY.md)
- **Testing**: [TESTING.md](./TESTING.md)
- **Issues**: [GitHub Issues](https://github.com/Zoe-life/boldadventures-landing_page/issues)

## Tips

- Use **Postman** or **Insomnia** for API testing
- Check **MongoDB Compass** to view database
- Enable **Morgan logging** for request debugging (already enabled in dev)
- Use **nodemon** for auto-reload (already configured)

## What's Included

✅ User authentication (JWT)  
✅ Role-based authorization  
✅ Password hashing (bcrypt)  
✅ Tour management API  
✅ Newsletter subscription  
✅ Rate limiting  
✅ Security headers  
✅ Input validation  
✅ Error handling  
✅ CORS configuration  
✅ Login/Register UI  
✅ API integration examples  

## What's Next

🔲 Email verification  
🔲 Password reset flow  
🔲 Booking system  
🔲 Payment integration  
🔲 Admin dashboard  
🔲 Tour reviews & ratings  
🔲 Image upload  
🔲 Search & filters UI  

---

**Ready to code!** 🚀 Start with `npm run dev` and visit `http://localhost:5000/api/health`
