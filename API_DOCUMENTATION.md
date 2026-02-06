# BoldAdventures Backend API Documentation

## Table of Contents
- [Overview](#overview)
- [Getting Started](#getting-started)
- [Authentication](#authentication)
- [API Endpoints](#api-endpoints)
- [Security Features](#security-features)
- [Deployment](#deployment)

## Overview

BoldAdventures backend is a secure RESTful API built with Node.js, Express, and MongoDB. It provides authentication, authorization, and CRUD operations for tours and newsletter management.

### Technology Stack
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **JWT** - Token-based authentication
- **bcryptjs** - Password hashing
- **helmet** - Security headers
- **express-rate-limit** - Rate limiting
- **express-validator** - Input validation

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Zoe-life/boldadventures-landing_page.git
cd boldadventures-landing_page
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` file with your configuration:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/boldadventures
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
CLIENT_URL=http://localhost:3000
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

4. Start the development server:
```bash
npm run dev
```

The server will start on `http://localhost:5000`

## Authentication

### User Roles
- **user** - Regular user (default)
- **guide** - Tour guide (can create/update tours)
- **admin** - Administrator (full access)

### Authentication Flow

1. **Register** - Create a new account
2. **Login** - Receive access token (15 min) and refresh token (7 days)
3. **Protected Routes** - Include token in Authorization header
4. **Refresh Token** - Get new access token using refresh token
5. **Logout** - Invalidate tokens

### Token Usage

Include the access token in requests:

**Authorization Header:**
```
Authorization: Bearer <access_token>
```

**Or via Cookie:**
Tokens are automatically set as httpOnly cookies.

## API Endpoints

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "user"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "_id": "...",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user"
    },
    "accessToken": "...",
    "refreshToken": "..."
  }
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Logout
```http
POST /api/auth/logout
Authorization: Bearer <access_token>
```

#### Refresh Token
```http
POST /api/auth/refresh
Cookie: refreshToken=<refresh_token>
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <access_token>
```

#### Update Profile
```http
PUT /api/auth/me
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "name": "John Smith",
  "email": "johnsmith@example.com"
}
```

#### Change Password
```http
PUT /api/auth/change-password
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword456"
}
```

### Tour Endpoints

#### Get All Tours
```http
GET /api/tours?page=1&limit=10&category=hiking&featured=true
```

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Results per page (default: 10)
- `category` - Filter by category (hiking, biking, adventure-package)
- `difficulty` - Filter by difficulty (easy, moderate, difficult)
- `minPrice` - Minimum price
- `maxPrice` - Maximum price
- `featured` - Filter featured tours (true/false)
- `sort` - Sort field (default: -createdAt)

#### Get Featured Tours
```http
GET /api/tours/featured
```

#### Get Single Tour
```http
GET /api/tours/:id
```

#### Create Tour (Admin/Guide Only)
```http
POST /api/tours
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "title": "Tibet Adventure",
  "description": "Amazing hiking tour in Tibet",
  "location": {
    "country": "China",
    "city": "Lhasa"
  },
  "duration": 6,
  "price": 340000,
  "currency": "KSH",
  "maxGroupSize": 12,
  "difficulty": "difficult",
  "category": "hiking",
  "coverImage": "/images/tour-1.jpeg",
  "featured": true
}
```

#### Update Tour (Admin/Guide Only)
```http
PUT /api/tours/:id
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "title": "Updated Title",
  "price": 350000
}
```

#### Delete Tour (Admin Only)
```http
DELETE /api/tours/:id
Authorization: Bearer <access_token>
```

### Newsletter Endpoints

#### Subscribe to Newsletter
```http
POST /api/newsletter/subscribe
Content-Type: application/json

{
  "email": "subscriber@example.com"
}
```

#### Unsubscribe from Newsletter
```http
POST /api/newsletter/unsubscribe
Content-Type: application/json

{
  "email": "subscriber@example.com"
}
```

#### Get Subscribers (Admin Only)
```http
GET /api/newsletter/subscribers?page=1&limit=50&isActive=true
Authorization: Bearer <access_token>
```

### Health Check
```http
GET /api/health
```

## Security Features

### 1. Password Security
- Passwords hashed using bcrypt with configurable rounds
- Minimum password length: 8 characters
- Passwords never returned in API responses

### 2. JWT Authentication
- Access tokens expire in 15 minutes
- Refresh tokens expire in 7 days
- Tokens stored as httpOnly cookies (CSRF protected)
- Token verification on protected routes

### 3. Authorization
- Role-based access control (RBAC)
- Route protection based on user roles
- Admin-only endpoints for sensitive operations

### 4. Rate Limiting
- Prevents brute force attacks
- Default: 100 requests per 15 minutes per IP
- Configurable via environment variables

### 5. Security Headers
- Helmet.js for secure HTTP headers
- Content Security Policy (CSP)
- XSS Protection
- HSTS enabled in production

### 6. Input Validation
- express-validator for input sanitization
- Type checking and format validation
- SQL/NoSQL injection prevention

### 7. CORS Configuration
- Configurable origin whitelist
- Credentials support for cookies
- Preflight request handling

### 8. MongoDB Security
- Mongoose schema validation
- Indexed fields for query optimization
- Sanitized user inputs

## Deployment

### Deploying to Render

1. **Create a Render Account**
   - Sign up at [render.com](https://render.com)

2. **Set Up MongoDB Atlas** (if not using local MongoDB)
   - Create account at [mongodb.com/atlas](https://www.mongodb.com/atlas)
   - Create a new cluster
   - Get connection string

3. **Deploy to Render**

   **Option A: Using render.yaml (Blueprint)**
   - Push code to GitHub
   - In Render dashboard, click "New +" → "Blueprint"
   - Connect your repository
   - Render will auto-detect `render.yaml`
   - Add environment variables:
     - `MONGODB_URI` - Your MongoDB connection string
     - `CLIENT_URL` - Your frontend URL

   **Option B: Manual Setup**
   - In Render dashboard, click "New +" → "Web Service"
   - Connect your repository
   - Configure:
     - **Name:** boldadventures-backend
     - **Environment:** Node
     - **Build Command:** `npm install`
     - **Start Command:** `npm start`
     - **Plan:** Free (or paid for better performance)

4. **Environment Variables**
   Add these in Render dashboard:
   ```
   NODE_ENV=production
   MONGODB_URI=<your-mongodb-atlas-connection-string>
   JWT_SECRET=<generate-random-string>
   JWT_REFRESH_SECRET=<generate-random-string>
   CLIENT_URL=<your-frontend-url>
   ```

5. **Deploy**
   - Click "Create Web Service"
   - Render will build and deploy automatically
   - Access your API at: `https://your-service.onrender.com`

### Alternative: Deploying to Cloudflare Workers

For Cloudflare deployment, you would need to:
1. Refactor code for serverless/edge functions
2. Use Cloudflare D1 or external MongoDB
3. Use Cloudflare Workers KV for session storage
4. Update JWT handling for edge runtime

**Note:** Render is recommended for this Node.js/Express setup as it requires minimal changes.

### Post-Deployment

1. **Test Health Check:**
```bash
curl https://your-service.onrender.com/api/health
```

2. **Create Admin User:**
```bash
curl -X POST https://your-service.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin",
    "email": "admin@boldadventures.com",
    "password": "SecurePassword123!",
    "role": "admin"
  }'
```

3. **Update Frontend:**
   - Update API base URL in frontend to point to your deployed backend
   - Update CORS `CLIENT_URL` in backend environment variables

## Error Responses

All errors follow this format:
```json
{
  "success": false,
  "message": "Error message",
  "errors": []  // Optional, for validation errors
}
```

### Common Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `429` - Too Many Requests (rate limited)
- `500` - Internal Server Error

## Support

For issues and questions:
- GitHub Issues: [github.com/Zoe-life/boldadventures-landing_page/issues](https://github.com/Zoe-life/boldadventures-landing_page/issues)
- Email: support@boldadventures.com

## License

ISC
