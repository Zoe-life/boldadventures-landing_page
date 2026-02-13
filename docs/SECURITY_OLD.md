# Security Documentation

## Overview

The BoldAdventures backend implements multiple layers of security to protect user data and prevent common web vulnerabilities.

## Security Features Implemented

### 1. Authentication Security

#### Password Security
- **Hashing**: All passwords are hashed using bcrypt with configurable salt rounds (default: 12)
- **Minimum Length**: 8 characters minimum enforced
- **Never Exposed**: Passwords are never returned in API responses (select: false in schema)
- **Pre-save Hook**: Automatic hashing before saving to database

#### Token-Based Authentication
- **JWT (JSON Web Tokens)**: Industry-standard token authentication
- **Access Tokens**: Short-lived (15 minutes) for API requests
- **Refresh Tokens**: Long-lived (7 days) for obtaining new access tokens
- **Token Rotation**: New refresh token on each refresh
- **Token Invalidation**: Tokens cleared on logout and password change

#### Session Security
- **httpOnly Cookies**: Tokens stored in httpOnly cookies to prevent XSS attacks
- **Secure Flag**: Cookies marked secure in production (HTTPS only)
- **SameSite**: Strict SameSite policy to prevent CSRF attacks
- **Token Verification**: All tokens verified on protected routes

### 2. Authorization

#### Role-Based Access Control (RBAC)
- **Three Roles**: user, guide, admin
- **Hierarchical Permissions**:
  - `user`: Basic access, view tours, subscribe to newsletter
  - `guide`: Can create and update tours
  - `admin`: Full access, including deletion and user management

#### Protected Routes
- Authentication middleware (`protect`) verifies JWT tokens
- Authorization middleware (`restrictTo`) checks user roles
- Automatic rejection of unauthorized requests

### 3. Input Validation & Sanitization

#### express-validator
- **Type Checking**: Email format, string length, numeric ranges
- **Sanitization**: Automatic trimming and normalization
- **Custom Validators**: Business logic validation
- **Error Reporting**: Detailed validation errors

#### Mongoose Schema Validation
- **Required Fields**: Enforced at database level
- **Data Types**: Strict type checking
- **Custom Validators**: Email regex, enum values
- **Length Limits**: Maximum character limits

### 4. Rate Limiting

#### Protection Against Brute Force
- **Window**: 15 minutes (configurable)
- **Max Requests**: 100 per window (configurable)
- **Per IP**: Rate limiting applied per IP address
- **Standard Headers**: Rate limit info in response headers
- **Applied To**: All `/api/*` endpoints

#### Benefits
- Prevents password guessing attacks
- Protects against DDoS attempts
- Reduces server load from abusive clients

### 5. HTTP Security Headers (Helmet.js)

#### Content Security Policy (CSP)
```javascript
{
  defaultSrc: ["'self'"],
  styleSrc: ["'self'", "'unsafe-inline'"],
  scriptSrc: ["'self'", "'unsafe-inline'"],
  imgSrc: ["'self'", "data:", "https:"]
}
```

#### Other Headers
- **X-DNS-Prefetch-Control**: Controls browser DNS prefetching
- **X-Frame-Options**: Prevents clickjacking (DENY)
- **X-Content-Type-Options**: Prevents MIME sniffing (nosniff)
- **X-XSS-Protection**: Enables XSS filter (1; mode=block)
- **Strict-Transport-Security**: Forces HTTPS in production

### 6. CORS (Cross-Origin Resource Sharing)

#### Configured Origins
- **Development**: `http://localhost:3000`
- **Production**: Configured via `CLIENT_URL` environment variable
- **Credentials**: Enabled for cookie support
- **Preflight**: Automatic OPTIONS handling

### 7. Database Security

#### MongoDB Security
- **Connection String**: Environment variable (never hardcoded)
- **Mongoose ODM**: Query sanitization
- **Indexes**: Optimized queries with proper indexes
- **NoSQL Injection**: Protected via Mongoose type casting

#### Data Integrity
- **Unique Constraints**: Email uniqueness enforced
- **Foreign Keys**: User references in tours
- **Timestamps**: Automatic createdAt/updatedAt tracking

### 8. Error Handling

#### Secure Error Messages
- **Production**: Generic error messages (no stack traces)
- **Development**: Detailed errors for debugging
- **No Sensitive Data**: Never expose passwords, tokens in errors
- **Consistent Format**: Standard error response structure

#### Error Types Handled
- Mongoose validation errors
- Duplicate key errors (11000)
- Cast errors (invalid ObjectId)
- JWT errors (invalid/expired tokens)
- Generic server errors

### 9. Environment Variables

#### Sensitive Data Protection
```
JWT_SECRET=<random-string>
JWT_REFRESH_SECRET=<random-string>
MONGODB_URI=<connection-string>
```

#### .env File Security
- **Never Committed**: Listed in .gitignore
- **Example Provided**: .env.example for documentation
- **Production Secrets**: Set via hosting platform environment

### 10. Additional Security Measures

#### Password Change Security
- **Requires Current Password**: Prevents unauthorized changes
- **Token Invalidation**: All tokens cleared after password change
- **Timestamp Tracking**: `passwordChangedAt` field updated
- **Token Verification**: New login required after password change

#### User Account Security
- **Active Status**: `isActive` flag for account deactivation
- **Email Verification**: `isEmailVerified` flag (ready for implementation)
- **Last Login**: Tracking for suspicious activity detection

#### Token Security
- **Separate Secrets**: Different secrets for access and refresh tokens
- **Short Expiry**: Access tokens expire quickly (15 min)
- **Stored Securely**: Refresh tokens stored in database (can be invalidated)
- **No Token Reuse**: Refresh tokens removed on use (if implementing rotation)

## Security Best Practices Followed

### 1. Principle of Least Privilege
- Users get minimal permissions by default
- Role escalation requires explicit assignment
- Protected routes require authentication

### 2. Defense in Depth
- Multiple layers of security (validation, authentication, authorization)
- No single point of failure
- Redundant security checks

### 3. Secure by Default
- Secure configurations out of the box
- Environment variables for sensitive data
- HTTPS enforced in production

### 4. Fail Securely
- Generic error messages to prevent information leakage
- Graceful degradation on security failures
- Automatic logout on token issues

## Known Security Considerations

### 1. Email Verification
- **Status**: Schema ready, implementation pending
- **Recommendation**: Implement email verification before production
- **Impact**: Prevents fake accounts

### 2. Password Reset
- **Status**: Schema ready, implementation pending
- **Fields Available**: `passwordResetToken`, `passwordResetExpires`
- **Recommendation**: Implement secure password reset flow

### 3. Two-Factor Authentication (2FA)
- **Status**: Not implemented
- **Recommendation**: Consider for admin accounts
- **Impact**: Additional layer of security

### 4. Account Lockout
- **Status**: Not implemented
- **Recommendation**: Lock accounts after multiple failed login attempts
- **Impact**: Prevents brute force attacks

### 5. Audit Logging
- **Status**: Basic logging only
- **Recommendation**: Implement comprehensive audit trail
- **Impact**: Security incident investigation

## Security Checklist for Production

- [ ] Change all default secrets in environment variables
- [ ] Use strong, random JWT secrets (32+ characters)
- [ ] Enable HTTPS (handled by Render)
- [ ] Set NODE_ENV=production
- [ ] Use MongoDB Atlas with authentication
- [ ] Implement email verification
- [ ] Add password reset functionality
- [ ] Consider 2FA for admin accounts
- [ ] Set up monitoring and alerting
- [ ] Regular security audits
- [ ] Keep dependencies updated
- [ ] Implement rate limiting per user (in addition to per IP)
- [ ] Add CAPTCHA for registration
- [ ] Implement account lockout policy
- [ ] Set up backup strategy

## Reporting Security Issues

If you discover a security vulnerability:

1. **Do NOT** open a public issue
2. Email: security@boldadventures.com (update with actual email)
3. Include: Description, steps to reproduce, potential impact
4. We will respond within 48 hours

## Security Updates

Keep the following packages updated regularly:

- `express` - Web framework
- `mongoose` - Database ODM
- `jsonwebtoken` - JWT library
- `bcryptjs` - Password hashing
- `helmet` - Security headers
- `express-validator` - Input validation
- `express-rate-limit` - Rate limiting

Check for updates:
```bash
npm outdated
npm audit
npm audit fix
```

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Checklist](https://blog.risingstack.com/node-js-security-checklist/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
