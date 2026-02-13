# Environment Variables Setup Guide

This guide provides detailed instructions on how to obtain and configure all the environment variables required for the BoldAdventures project.

## Table of Contents

1. [Server Configuration](#server-configuration)
2. [Database Setup](#database-setup)
3. [JWT Configuration](#jwt-configuration)
4. [Google OAuth2.0 Setup](#google-oauth20-setup)
5. [Payment Gateway Setup](#payment-gateway-setup)
   - [Stripe](#stripe-setup)
   - [PayPal](#paypal-setup)
6. [Currency Conversion API](#currency-conversion-api-setup)
7. [Email Configuration](#email-configuration)
8. [Security Settings](#security-settings)
9. [Complete .env Template](#complete-env-template)

---

## Server Configuration

### NODE_ENV
- **Description**: Environment mode for the application
- **Values**: `development` | `production` | `test`
- **How to set**:
  - For local development: `NODE_ENV=development`
  - For production: `NODE_ENV=production`

### PORT
- **Description**: Port number on which the server runs
- **Default**: `5000`
- **How to set**: `PORT=5000`

### CLIENT_URL
- **Description**: URL of the frontend application
- **Local**: `http://localhost:3000`
- **Production**: Your deployed frontend URL (e.g., `https://yourdomain.com`)

---

## Database Setup

### MONGODB_URI

**For Local Development:**

1. Install MongoDB locally:
   ```bash
   # macOS (with Homebrew)
   brew tap mongodb/brew
   brew install mongodb-community

   # Ubuntu/Debian
   sudo apt-get install mongodb

   # Windows: Download from https://www.mongodb.com/try/download/community
   ```

2. Start MongoDB:
   ```bash
   mongod
   ```

3. Set the URI:
   ```
   MONGODB_URI=mongodb://localhost:27017/boldadventures
   ```

**For Production (MongoDB Atlas):**

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up or log in
3. Create a new cluster:
   - Click "Build a Cluster"
   - Choose the free tier (M0)
   - Select a cloud provider and region
   - Click "Create Cluster"

4. Set up database access:
   - Go to "Database Access" in the left sidebar
   - Click "Add New Database User"
   - Create a username and password
   - Set user privileges to "Read and write to any database"

5. Set up network access:
   - Go to "Network Access" in the left sidebar
   - Click "Add IP Address"
   - For development: Click "Allow Access from Anywhere" (0.0.0.0/0)
   - For production: Add your server's IP address

6. Get connection string:
   - Go to "Clusters" and click "Connect"
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Replace `<dbname>` with `boldadventures`

   ```
   MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/boldadventures?retryWrites=true&w=majority
   ```

---

## JWT Configuration

### JWT_SECRET & JWT_REFRESH_SECRET

**How to generate secure secrets:**

```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Using OpenSSL
openssl rand -hex 64
```

**Example:**
```
JWT_SECRET=8f9a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a
JWT_REFRESH_SECRET=1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b
```

### JWT Token Expiration

```
JWT_EXPIRES_IN=15m          # Access token expires in 15 minutes
JWT_REFRESH_EXPIRES_IN=7d   # Refresh token expires in 7 days
```

---

## Google OAuth2.0 Setup

### Getting Google OAuth Credentials

1. **Go to Google Cloud Console**
   - Visit [Google Cloud Console](https://console.cloud.google.com/)
   - Sign in with your Google account

2. **Create a New Project**
   - Click on the project dropdown at the top
   - Click "New Project"
   - Enter project name: `BoldAdventures`
   - Click "Create"

3. **Enable Google+ API**
   - In the left sidebar, go to "APIs & Services" > "Library"
   - Search for "Google+ API"
   - Click on it and press "Enable"

4. **Configure OAuth Consent Screen**
   - Go to "APIs & Services" > "OAuth consent screen"
   - Choose "External" user type
   - Click "Create"
   - Fill in the required information:
     - App name: `BoldAdventures`
     - User support email: Your email
     - Developer contact email: Your email
   - Click "Save and Continue"
   - Add scopes (optional for basic setup)
   - Add test users if needed
   - Click "Save and Continue"

5. **Create OAuth Credentials**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Choose "Web application"
   - Name: `BoldAdventures Web Client`
   - Add Authorized JavaScript origins:
     - `http://localhost:5000` (for development)
     - Your production URL (e.g., `https://yourdomain.com`)
   - Add Authorized redirect URIs:
     - `http://localhost:5000/api/auth/google/callback` (for development)
     - `https://yourdomain.com/api/auth/google/callback` (for production)
   - Click "Create"

6. **Copy Your Credentials**
   - You'll see your Client ID and Client Secret
   - Copy them to your `.env` file:

   ```
   GOOGLE_CLIENT_ID=123456789-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=GOCSPX-your_client_secret_here
   GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
   ```

---

## Payment Gateway Setup

### Stripe Setup

Stripe is used for credit/debit card payments.

1. **Create a Stripe Account**
   - Go to [Stripe](https://stripe.com/)
   - Click "Start now" and sign up
   - Complete account verification

2. **Get API Keys**
   - Go to [Stripe Dashboard](https://dashboard.stripe.com/)
   - Click "Developers" in the left sidebar
   - Click "API keys"
   - You'll see two keys:
     - **Publishable key** (starts with `pk_test_` for test mode)
     - **Secret key** (starts with `sk_test_` for test mode)
   - Click "Reveal test key" to see the secret key

3. **Add to .env**
   ```
   STRIPE_SECRET_KEY=sk_test_51Abc...your_secret_key
   STRIPE_PUBLISHABLE_KEY=pk_test_51Abc...your_publishable_key
   ```

4. **For Production:**
   - Toggle to "View live data" in the dashboard
   - Copy the live keys (starts with `pk_live_` and `sk_live_`)
   - Use these in production environment

**Testing Cards:**
- Success: `4242 4242 4242 4242`
- Requires authentication: `4000 0025 0000 3155`
- Declined: `4000 0000 0000 9995`
- Use any future expiry date, any CVC, and any postal code

### PayPal Setup

PayPal is used for PayPal payments.

1. **Create a PayPal Developer Account**
   - Go to [PayPal Developer](https://developer.paypal.com/)
   - Sign up or log in with your PayPal account

2. **Create an App**
   - Go to "My Apps & Credentials"
   - Make sure you're in "Sandbox" mode for testing
   - Click "Create App"
   - Enter app name: `BoldAdventures`
   - Choose "Merchant" as the app type
   - Click "Create App"

3. **Get Credentials**
   - You'll see your Client ID and Secret
   - Copy them to your `.env` file:

   ```
   PAYPAL_MODE=sandbox
   PAYPAL_CLIENT_ID=your_paypal_client_id_here
   PAYPAL_CLIENT_SECRET=your_paypal_client_secret_here
   ```

4. **Create Test Accounts** (for testing)
   - Go to "Sandbox" > "Accounts"
   - You'll see auto-generated test accounts
   - Use these for testing PayPal payments

5. **For Production:**
   - Toggle to "Live" mode in the dashboard
   - Create a live app
   - Copy the live credentials
   - Update .env:
     ```
     PAYPAL_MODE=live
     PAYPAL_CLIENT_ID=your_live_client_id
     PAYPAL_CLIENT_SECRET=your_live_client_secret
     ```

---

## Currency Conversion API Setup

The application uses a currency conversion API to get real-time exchange rates for PayPal payments (KES to USD conversion).

### Setup Exchange Rate API (Optional but Recommended)

1. **Sign up for a free API key**
   - Go to [ExchangeRate-API](https://www.exchangerate-api.com/)
   - Click "Get Free Key"
   - Sign up with your email
   - Verify your email address

2. **Get your API key**
   - After verification, you'll see your API key
   - Free tier includes:
     - 1,500 requests per month
     - Updates once per day
     - All currency pairs

3. **Add to .env**
   ```
   EXCHANGE_RATE_API_KEY=your_api_key_here
   KES_TO_USD_RATE=0.0077
   ```

### Without API Key (Fallback)

The application works without an API key:
- Uses a free API with limited requests
- Falls back to configured rate if API fails
- Set `KES_TO_USD_RATE` as backup

```
# No API key needed
KES_TO_USD_RATE=0.0077
```

### API Endpoints

The application provides these currency endpoints:

1. **Get Exchange Rate**
   ```
   GET /api/currency/rate?from=KES&to=USD
   ```

2. **Convert Amount**
   ```
   GET /api/currency/convert?amount=100000&from=KES&to=USD
   ```

3. **Supported Currencies**
   ```
   GET /api/currency/supported
   ```

### Features

- **Automatic caching**: Rates are cached for 1 hour to reduce API calls
- **Fallback mechanism**: Uses configured rate if API fails
- **Real-time rates**: Fresh rates fetched when cache expires
- **Multiple currencies**: Supports KES, USD, EUR, GBP, and more

### Testing

```bash
# Test currency conversion
curl http://localhost:5000/api/currency/convert?amount=100000&from=KES&to=USD

# Response:
{
  "success": true,
  "data": {
    "originalAmount": 100000,
    "convertedAmount": 770.00,
    "from": "KES",
    "to": "USD",
    "timestamp": "2026-02-13T10:00:00.000Z"
  }
}
```

---

## Email Configuration

For sending emails (password reset, notifications, etc.)

### Using Gmail

1. **Enable 2-Factor Authentication**
   - Go to your Google Account settings
   - Security > 2-Step Verification
   - Enable it

2. **Create App Password**
   - Go to Security > App passwords
   - Select app: "Mail"
   - Select device: "Other" (enter "BoldAdventures")
   - Click "Generate"
   - Copy the 16-character password

3. **Add to .env**
   ```
   EMAIL_SERVICE=gmail
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-16-char-app-password
   ```

### Using Other Services

You can also use Brevo, Mailgun, or any SMTP service:

```
# For Brevo (recommended - 300 free emails/day)
BREVO_API_KEY=your_brevo_api_key
BREVO_FROM=noreply@boldadventures.com

# For other SMTP services
EMAIL_SERVICE=smtp
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=your-username
EMAIL_PASSWORD=your-password
```

---

## Security Settings

### Rate Limiting

Controls how many requests a user can make:

```
RATE_LIMIT_WINDOW_MS=900000       # 15 minutes in milliseconds
RATE_LIMIT_MAX_REQUESTS=100       # Max 100 requests per window
```

### Password Hashing

```
BCRYPT_ROUNDS=12                  # Number of bcrypt salt rounds (10-12 recommended)
```

---

## Complete .env Template

Create a `.env` file in the root directory with all the variables:

```env
# Server Configuration
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:3000

# Database
MONGODB_URI=mongodb://localhost:27017/boldadventures

# JWT Secret Keys
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Google OAuth2.0
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# Payment Gateways
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
PAYPAL_MODE=sandbox
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret

# Currency Conversion API
EXCHANGE_RATE_API_KEY=your_exchange_rate_api_key_here
KES_TO_USD_RATE=0.0077

# Email Configuration
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Security
BCRYPT_ROUNDS=12
```

---

## Verification

After setting up all environment variables:

1. **Check the configuration:**
   ```bash
   cp .env.example .env
   # Edit .env with your actual values
   ```

2. **Test database connection:**
   ```bash
   npm start
   # You should see "MongoDB connected successfully" in the logs
   ```

3. **Test Google OAuth:**
   - Visit `http://localhost:5000/login.html`
   - Click "Sign in with Google"
   - You should be redirected to Google's login page

4. **Test Payment Integration:**
   - Create a test booking
   - Try making a payment with Stripe test card
   - Check if payment is processed correctly

---

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running locally or Atlas cluster is accessible
- Check network access settings in MongoDB Atlas
- Verify username and password are correct

### Google OAuth Issues
- Verify redirect URIs match exactly (including http/https)
- Check that Google+ API is enabled
- Ensure OAuth consent screen is properly configured

### Payment Gateway Issues
- Verify API keys are correct
- Check that you're using test keys for development
- Ensure webhook URLs are properly configured

### Email Issues
- Use app-specific passwords for Gmail
- Check SMTP settings for other providers
- Verify firewall isn't blocking email ports

---

## Security Best Practices

1. **Never commit `.env` file to version control**
   - Add `.env` to `.gitignore`
   - Use `.env.example` as a template

2. **Use different credentials for development and production**

3. **Rotate secrets regularly in production**

4. **Use environment-specific configurations**
   - Different database for dev/staging/production
   - Different API keys for each environment

5. **Keep dependencies updated**
   ```bash
   npm audit
   npm audit fix
   ```

---

## Additional Resources

- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [Google OAuth2.0 Guide](https://developers.google.com/identity/protocols/oauth2)
- [Stripe API Documentation](https://stripe.com/docs/api)
- [PayPal Developer Documentation](https://developer.paypal.com/docs/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

---

## Support

If you encounter any issues with environment setup:

1. Check the [API Documentation](./API_DOCUMENTATION.md)
2. Review [Security Guidelines](./SECURITY.md)
3. Consult [Deployment Guide](./DEPLOYMENT.md)
4. Create an issue on GitHub

---

**Last Updated:** February 2026
