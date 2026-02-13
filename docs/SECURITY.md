# Security Implementation Guide

## Overview

This document describes the comprehensive security measures implemented in the BoldAdventures application to protect against common web vulnerabilities including XSS, CSRF, SQL injection, DDoS attacks, and to ensure payment security.

## Table of Contents

1. [XSS Protection](#xss-protection)
2. [CSRF Protection](#csrf-protection)
3. [SQL/NoSQL Injection Prevention](#sqlnosql-injection-prevention)
4. [DDoS Protection](#ddos-protection)
5. [Payment Security](#payment-security)
6. [Nginx Reverse Proxy](#nginx-reverse-proxy)
7. [Additional Security Measures](#additional-security-measures)
8. [Configuration](#configuration)
9. [Testing](#testing)

---

## XSS Protection

### Implementation

1. **Helmet.js Content Security Policy (CSP)**
   - Restricts sources for scripts, styles, images, and other resources
   - Prevents inline script execution (with specific exceptions for payment providers)
   - Located in: `server.js`

2. **Input Validation**
   - All user inputs are validated using `express-validator`
   - Implemented in route handlers and middleware
   - Located in: `server/middleware/validate.js`

3. **Output Encoding**
   - Mongoose automatically escapes data when rendering
   - HTML special characters are handled by the framework

4. **Security Headers**
   - X-XSS-Protection: Enables browser XSS filtering
   - X-Content-Type-Options: Prevents MIME sniffing
   - Located in: `server/middleware/security.js`

### Usage

The XSS protection is automatically applied to all routes. No additional configuration needed.

---

## CSRF Protection

### Implementation

1. **Double Submit Cookie Pattern**
   - Uses `csrf-csrf` library
   - Generates unique CSRF tokens for each session
   - Validates tokens on state-changing operations (POST, PUT, DELETE)
   - Located in: `server/middleware/csrf.js`

2. **Token Generation Endpoint**
   - GET `/api/csrf-token` - Returns a CSRF token for the client
   - Token must be included in requests as `x-csrf-token` header or `_csrf` body field

3. **Protected Routes**
   - Authentication routes (login, register, logout)
   - Payment routes (all payment operations)
   - Profile update routes

### Usage

#### Client-Side Implementation

```javascript
// 1. Get CSRF token before making state-changing requests
const response = await fetch('/api/csrf-token', {
  credentials: 'include'
});
const { csrfToken } = await response.json();

// 2. Include token in requests
fetch('/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-csrf-token': csrfToken
  },
  credentials: 'include',
  body: JSON.stringify({ email, password })
});
```

---

## SQL/NoSQL Injection Prevention

### Implementation

1. **Mongoose ORM**
   - All database queries use Mongoose
   - Mongoose automatically sanitizes inputs
   - Prevents MongoDB injection attacks

2. **express-mongo-sanitize**
   - Removes keys that start with `$` or contain `.`
   - Applied to all request bodies
   - Located in: `server/middleware/security.js`

3. **Input Validation**
   - Type checking and validation using `express-validator`
   - Whitelist approach for allowed fields
   - Located in route handlers

### Usage

All routes are automatically protected. When creating new routes:

```javascript
// Example: Validate input
const { body } = require('express-validator');
const validate = require('../middleware/validate');

router.post('/endpoint', [
  body('email').isEmail(),
  body('amount').isNumeric(),
  validate
], controller);
```

---

## DDoS Protection

### Implementation

1. **Rate Limiting**
   - General API: 100 requests per 15 minutes
   - Authentication endpoints: 5 requests per 15 minutes
   - Payment endpoints: 10 requests per 15 minutes
   - Located in: `server/middleware/security.js`

2. **Speed Limiting (Slowdown)**
   - Progressively slows down responses after threshold
   - Prevents brute force attacks
   - Adds delay: 500ms per request after 50 requests
   - Located in: `server/middleware/security.js`

3. **Request Size Limits**
   - Maximum request body: 10MB
   - Prevents memory exhaustion attacks
   - Located in: `server.js`

4. **Connection Limits**
   - Configured in Nginx (10 connections per IP)
   - Prevents connection exhaustion

5. **HTTP Parameter Pollution (HPP) Protection**
   - Prevents duplicate parameters in query strings
   - Whitelist for allowed duplicate parameters
   - Located in: `server/middleware/security.js`

### Configuration

Adjust rate limits in `.env`:

```env
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes in milliseconds
RATE_LIMIT_MAX_REQUESTS=100
```

---

## Payment Security

### Implementation

1. **Webhook Signature Verification**
   - Stripe: Verifies webhook signature using `stripe.webhooks.constructEvent()`
   - PayPal: Verifies webhook headers and transmission signatures
   - Located in: `server/middleware/paymentSecurity.js`

2. **Payment Double Submission Prevention**
   - Checks for existing pending payments before processing
   - Validates booking payment status
   - Located in: `server/middleware/paymentSecurity.js`

3. **Payment Amount Validation**
   - Minimum amount: 1 unit
   - Maximum amount: 1,000,000 units
   - Type validation (must be numeric)
   - Located in: `server/middleware/paymentSecurity.js`

4. **Idempotency Keys**
   - Optional: Prevents duplicate payment processing
   - Client can send `Idempotency-Key` header (UUID format)
   - Located in: `server/middleware/paymentSecurity.js`

5. **Transaction Logging**
   - All payment transactions are logged
   - Includes: timestamp, user, IP, duration
   - Located in: `server/middleware/paymentSecurity.js`

6. **Payment Data Sanitization**
   - Removes sensitive fields that shouldn't be set by client
   - Validates amount format
   - Located in: `server/middleware/paymentSecurity.js`

7. **Stripe 3D Secure**
   - Automatically triggered by Stripe for eligible cards
   - Strong Customer Authentication (SCA) compliance
   - No additional configuration needed

8. **HTTPS Only**
   - All payment operations require HTTPS
   - Enforced via Helmet HSTS headers
   - Nginx configuration redirects HTTP to HTTPS

### Usage

#### Webhook Configuration

**Stripe:**
1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://yourdomain.com/api/webhooks/stripe`
3. Select events: `checkout.session.completed`, `payment_intent.succeeded`, `payment_intent.payment_failed`
4. Copy webhook secret to `.env` as `STRIPE_WEBHOOK_SECRET`

**PayPal:**
1. Go to PayPal Developer Dashboard → Webhooks
2. Add webhook: `https://yourdomain.com/api/webhooks/paypal`
3. Select events: `PAYMENT.CAPTURE.COMPLETED`, `PAYMENT.CAPTURE.DENIED`, `PAYMENT.CAPTURE.REFUNDED`
4. Copy webhook ID to `.env` as `PAYPAL_WEBHOOK_ID`

#### Client-Side Payment Implementation

```javascript
// 1. Get CSRF token
const csrfResponse = await fetch('/api/csrf-token', { credentials: 'include' });
const { csrfToken } = await csrfResponse.json();

// 2. Create payment session
const response = await fetch('/api/payments/stripe/create-session', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-csrf-token': csrfToken,
    'Authorization': `Bearer ${accessToken}`
  },
  credentials: 'include',
  body: JSON.stringify({
    bookingId: 'booking-id-here'
  })
});

const { data } = await response.json();
// Redirect to Stripe checkout
window.location.href = data.sessionUrl;
```

---

## Nginx Reverse Proxy

### Benefits

1. **Additional Rate Limiting Layer**
   - OS-level rate limiting (more efficient than application-level)
   - Protects against DDoS before requests reach the app

2. **SSL/TLS Termination**
   - Handles HTTPS encryption/decryption
   - Offloads SSL processing from Node.js

3. **Static File Serving**
   - Serves static assets directly (more efficient)
   - Reduces load on Node.js application

4. **Load Balancing**
   - Can distribute traffic across multiple Node.js instances
   - Improves scalability

5. **Security Headers**
   - Additional layer of security headers
   - Hides Node.js/Express information

### Configuration

The Nginx configuration is located in `nginx.conf` at the project root.

#### Installation Steps

1. **Install Nginx:**
   ```bash
   sudo apt-get update
   sudo apt-get install nginx
   ```

2. **Copy Configuration:**
   ```bash
   sudo cp nginx.conf /etc/nginx/sites-available/boldadventures
   sudo ln -s /etc/nginx/sites-available/boldadventures /etc/nginx/sites-enabled/
   ```

3. **Update Configuration:**
   - Replace `boldadventures.com` with your domain
   - Update SSL certificate paths
   - Update root directory path

4. **Test Configuration:**
   ```bash
   sudo nginx -t
   ```

5. **Reload Nginx:**
   ```bash
   sudo systemctl reload nginx
   ```

#### SSL Certificate Setup

**Option 1: Let's Encrypt (Free)**
```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d boldadventures.com -d www.boldadventures.com
```

**Option 2: Custom Certificate**
- Place certificate in `/etc/ssl/certs/boldadventures.crt`
- Place private key in `/etc/ssl/private/boldadventures.key`

---

## Additional Security Measures

### 1. Security Headers

All responses include these headers:
- `Strict-Transport-Security`: Forces HTTPS
- `X-Frame-Options`: Prevents clickjacking
- `X-Content-Type-Options`: Prevents MIME sniffing
- `X-XSS-Protection`: Enables browser XSS filter
- `Referrer-Policy`: Controls referrer information
- `Permissions-Policy`: Restricts browser features

### 2. Password Security

- Minimum 8 characters
- Hashed using bcrypt (12 rounds by default)
- Salted automatically
- Password change invalidates all sessions

### 3. JWT Security

- Access tokens: 15 minutes expiry
- Refresh tokens: 7 days expiry
- Tokens stored in httpOnly cookies
- Token validation on password change
- Multiple refresh tokens supported (multi-device login)

### 4. Session Management

- Secure cookies (httpOnly, sameSite: strict)
- Session invalidation on logout
- Session invalidation on password change
- Token expiry tracking

### 5. Database Security

- Connection string in environment variables
- No database credentials in code
- Mongoose sanitization
- Connection timeout and retry logic

### 6. Error Handling

- Generic error messages to clients
- Detailed logging on server
- No stack traces in production
- Error logging middleware

### 7. Security.txt

- Located at `/.well-known/security.txt`
- Provides security contact information
- Follows RFC 9116 standard

---

## Configuration

### Environment Variables

All security-related environment variables in `.env`:

```env
# JWT Secrets
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# CSRF Protection
CSRF_SECRET=your-csrf-secret-change-in-production

# Password Hashing
BCRYPT_ROUNDS=12

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Webhook Secrets
STRIPE_WEBHOOK_SECRET=whsec_your_stripe_webhook_secret
PAYPAL_WEBHOOK_ID=your_paypal_webhook_id

# Environment
NODE_ENV=production
```

### Production Checklist

- [ ] Change all default secrets and passwords
- [ ] Enable HTTPS (Nginx or hosting platform)
- [ ] Configure MongoDB connection string
- [ ] Set up Stripe webhook with secret
- [ ] Set up PayPal webhook with ID
- [ ] Configure CSRF secret
- [ ] Set NODE_ENV=production
- [ ] Enable Nginx reverse proxy
- [ ] Configure firewall rules
- [ ] Set up monitoring and logging
- [ ] Configure backup strategy
- [ ] Review and adjust rate limits
- [ ] Test all security measures

---

## Testing

### Manual Testing

1. **XSS Testing:**
   ```bash
   # Test script injection in inputs
   curl -X POST http://localhost:5000/api/newsletter/subscribe \
     -H "Content-Type: application/json" \
     -d '{"email": "<script>alert(\"XSS\")</script>@test.com"}'
   ```

2. **CSRF Testing:**
   ```bash
   # Test request without CSRF token (should fail)
   curl -X POST http://localhost:5000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email": "test@test.com", "password": "password"}'
   ```

3. **Rate Limiting Testing:**
   ```bash
   # Send multiple requests quickly
   for i in {1..10}; do
     curl http://localhost:5000/api/health
   done
   ```

4. **NoSQL Injection Testing:**
   ```bash
   # Test MongoDB injection
   curl -X POST http://localhost:5000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email": {"$gt": ""}, "password": {"$gt": ""}}'
   ```

### Automated Testing

Run security audits:

```bash
# NPM security audit
npm audit

# Check for outdated packages
npm outdated

# Check for known vulnerabilities
npx snyk test
```

### Security Scan Tools

Recommended tools:
- OWASP ZAP
- Burp Suite
- Snyk
- npm audit
- GitHub Security Scanning

---

## Maintenance

### Regular Updates

1. Update dependencies monthly:
   ```bash
   npm update
   npm audit fix
   ```

2. Review security advisories:
   - npm audit
   - GitHub Dependabot
   - Snyk alerts

3. Rotate secrets quarterly:
   - JWT secrets
   - CSRF secrets
   - API keys

4. Review logs weekly:
   - Failed authentication attempts
   - Rate limit violations
   - Payment errors

### Incident Response

1. **Security Breach:**
   - Rotate all secrets immediately
   - Review logs for compromise extent
   - Notify affected users
   - Apply security patches
   - Document incident

2. **DDoS Attack:**
   - Enable stricter rate limits
   - Block attacking IPs at firewall level
   - Contact hosting provider
   - Enable Cloudflare or similar CDN

---

## Support

For security issues, contact: security@boldadventures.com

For general support, visit: https://boldadventures.com/support

---

## License

This security implementation is part of the BoldAdventures application.
