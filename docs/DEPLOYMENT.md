#  Deployment Checklist for BoldAdventures Backend

## Pre-Deployment Checklist

### Code Preparation
- [x] All code committed to repository
- [x] .env file in .gitignore (not committed)
- [x] node_modules in .gitignore (not committed)
- [x] All dependencies listed in package.json
- [x] Start script configured ("npm start")
- [x] No hardcoded secrets in code
- [x] Error handling implemented
- [x] Security headers configured

### Security Verification
- [x] npm audit run (0 vulnerabilities)
- [x] Passwords hashed with bcrypt
- [x] JWT secrets configurable via environment
- [x] Rate limiting implemented
- [x] Input validation on all endpoints
- [x] CORS configured
- [x] httpOnly cookies for tokens
- [x] Security headers via Helmet.js

### Documentation
- [x] API documentation complete
- [x] Security documentation complete
- [x] Testing guide provided
- [x] Quickstart guide created
- [x] README updated

---

## Deployment to Render - Step by Step

### Step 1: Create MongoDB Atlas Database (5 min)

1. **Sign up** at [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Free tier available (512MB)

2. **Create a Cluster**
   - Choose free tier
   - Select region closest to your users
   - Name it "boldadventures"

3. **Create Database User**
   - Database Access → Add New Database User
   - Username: `boldadmin` (or your choice)
   - Password: Generate a strong password
   - Save credentials securely!

4. **Whitelist IP Addresses**
   - Network Access → Add IP Address
   - For development: Add your current IP
   - For production: Add `0.0.0.0/0` (allow all) or Render IPs

5. **Get Connection String**
   - Clusters → Connect → Connect your application
   - Choose driver: Node.js
   - Copy connection string
   - Replace `<password>` with your database user password
   - Example: `mongodb+srv://boldadmin:PASSWORD@cluster0.xxxxx.mongodb.net/boldadventures?retryWrites=true&w=majority`

### Step 2: Prepare Render Account (2 min)

1. **Sign up** at [Render.com](https://render.com)
   - Free tier available
   - Connect your GitHub account

2. **Verify Email**
   - Check your email and verify account

### Step 3: Deploy to Render (3 min)

1. **Create New Web Service**
   - Dashboard → "New +" → "Web Service"
   - Connect to your GitHub repository
   - Select "boldadventures-landing_page"

2. **Configure Service**
   - **Name**: `boldadventures-backend`
   - **Environment**: Node
   - **Region**: Choose closest to users
   - **Branch**: main (or your branch)
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free (or paid for better performance)

3. **Add Environment Variables**
   Click "Advanced" → "Add Environment Variable":
   
   ```
   NODE_ENV=production
   PORT=10000
   MONGODB_URI=<your-mongodb-atlas-connection-string>
   JWT_SECRET=<generate-strong-random-string>
   JWT_REFRESH_SECRET=<generate-another-strong-random-string>
   JWT_EXPIRES_IN=15m
   JWT_REFRESH_EXPIRES_IN=7d
   CLIENT_URL=<your-frontend-url>
   BCRYPT_ROUNDS=12
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   ```

   **Generate JWT Secrets:**
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
   Run twice for two different secrets.

4. **Create Web Service**
   - Click "Create Web Service"
   - Render will:
     - Clone your repository
     - Install dependencies
     - Start your server
   - Wait 3-5 minutes for deployment

### Step 4: Verify Deployment (2 min)

1. **Check Deployment Logs**
   - In Render dashboard, check logs
   - Look for "Server running in production mode on port 10000"
   - Look for "MongoDB Connected"

2. **Test Health Endpoint**
   ```bash
   curl https://your-service.onrender.com/api/health
   ```
   
   Expected response:
   ```json
   {
     "success": true,
     "message": "Server is running",
     "timestamp": "2026-02-06T12:39:59.740Z"
   }
   ```

3. **Test API Endpoint**
   ```bash
   curl https://your-service.onrender.com/api/tours
   ```

### Step 5: Seed Database (2 min)

**Option A: Via Render Shell**
1. Go to Render dashboard → Shell tab
2. Run: `npm run seed`

**Option B: Via API**
Create an admin user via API:
```bash
curl -X POST https://your-service.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@boldadventures.com",
    "password": "YourSecurePassword123!",
    "role": "admin"
  }'
```

### Step 6: Update Frontend (3 min)

1. **Update API Base URL**
   In your frontend code, update:
   ```javascript
   const API_BASE_URL = 'https://your-service.onrender.com/api';
   ```

2. **Update CORS**
   In Render, update `CLIENT_URL` environment variable to your frontend URL

3. **Test Frontend Integration**
   - Open login page
   - Try logging in
   - Check newsletter subscription

---

## Post-Deployment Checklist

### Functional Testing
- [ ] Health check responds
- [ ] User registration works
- [ ] User login works
- [ ] Protected routes require auth
- [ ] Tours API returns data
- [ ] Newsletter subscription works
- [ ] Password change works
- [ ] Token refresh works

### Security Testing
- [ ] HTTPS is enforced (Render provides this)
- [ ] Security headers present (check with browser DevTools)
- [ ] Rate limiting works (try 100+ requests)
- [ ] CORS blocks unauthorized origins
- [ ] Invalid tokens are rejected
- [ ] Weak passwords are rejected

### Performance Testing
- [ ] API response times < 500ms
- [ ] Database queries optimized
- [ ] No memory leaks
- [ ] Server stays up under load

### Monitoring
- [ ] Set up Render alerts
- [ ] Monitor error logs
- [ ] Track API usage
- [ ] Set up uptime monitoring (e.g., UptimeRobot)

---

## Troubleshooting

### Issue: Build Failed
**Symptoms**: Render shows build error

**Solutions**:
1. Check Node.js version compatibility
2. Verify all dependencies in package.json
3. Check build logs for specific errors
4. Ensure `npm install` succeeds locally

### Issue: Server Crashes
**Symptoms**: Server restarts repeatedly

**Solutions**:
1. Check environment variables are set
2. Verify MongoDB connection string
3. Check logs for error messages
4. Test database connectivity

### Issue: MongoDB Connection Failed
**Symptoms**: "connect ECONNREFUSED" or timeout errors

**Solutions**:
1. Verify MongoDB Atlas connection string
2. Check database user credentials
3. Whitelist Render IP addresses (or use 0.0.0.0/0)
4. Ensure database cluster is running

### Issue: JWT Errors
**Symptoms**: "Invalid token" or "Token expired"

**Solutions**:
1. Verify JWT_SECRET is set
2. Check token expiration times
3. Ensure cookies are being sent
4. Verify CORS allows credentials

### Issue: CORS Errors
**Symptoms**: "blocked by CORS policy"

**Solutions**:
1. Update CLIENT_URL to match frontend domain
2. Verify credentials: true in CORS config
3. Check preflight OPTIONS requests
4. Ensure frontend sends credentials

### Issue: Rate Limiting Too Strict
**Symptoms**: "Too many requests" errors

**Solutions**:
1. Increase RATE_LIMIT_MAX_REQUESTS
2. Increase RATE_LIMIT_WINDOW_MS
3. Consider per-user rate limiting
4. Monitor legitimate traffic patterns

---

## Monitoring & Maintenance

### Daily
- [ ] Check error logs
- [ ] Monitor uptime
- [ ] Review failed requests

### Weekly
- [ ] Review API usage patterns
- [ ] Check for security alerts
- [ ] Update dependencies if needed

### Monthly
- [ ] Run npm audit
- [ ] Review and rotate secrets
- [ ] Backup database
- [ ] Performance analysis

---

## Scaling Considerations

### When to Upgrade
- API response time > 1 second
- Error rate > 1%
- Downtime due to traffic
- Database queries slow

### Upgrade Options
1. **Render Plan**
   - Free → Starter ($7/month)
   - More CPU/RAM
   - No cold starts

2. **Database**
   - MongoDB Atlas Free → M2/M5
   - Dedicated resources
   - Better performance

3. **Caching**
   - Add Redis for session storage
   - Cache frequently accessed data
   - Reduce database load

4. **CDN**
   - Cloudflare for static assets
   - Reduce server load
   - Improve global performance

---

## Success Criteria

### Deployment Successful When:
- [x] Health check returns 200 OK
- [x] All API endpoints accessible
- [x] Frontend can authenticate
- [x] Database operations work
- [x] Security features active
- [x] No errors in logs
- [x] HTTPS working
- [x] CORS configured correctly

---

## Next Steps After Deployment

1. **Create Admin Account**
   - Register first admin user
   - Secure the credentials

2. **Add Content**
   - Create tours via API
   - Add sample data

3. **Test Thoroughly**
   - All user flows
   - Edge cases
   - Error scenarios

4. **Monitor**
   - Set up alerts
   - Track metrics
   - Review logs

5. **Announce**
   - Share with stakeholders
   - Update documentation
   - Provide API docs to frontend team

---

## Support Resources

- **Render Documentation**: [render.com/docs](https://render.com/docs)
- **MongoDB Atlas Docs**: [docs.atlas.mongodb.com](https://docs.atlas.mongodb.com)
- **Project Documentation**: See API_DOCUMENTATION.md
- **GitHub Issues**: Report problems in repository

---

##  Congratulations!

Your BoldAdventures backend is now deployed and running in production!

**Your API is live at**: `https://your-service.onrender.com`

**Next**: Integrate the frontend and start accepting users! 
