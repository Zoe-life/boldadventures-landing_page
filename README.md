## Project: Bold Adventures Landing Page

This repository contains the full-stack source code for Bold Adventures, a web platform designed to connect outdoor enthusiasts with guided biking and hiking adventures.

## Technology Stack

### Frontend
- HTML5, CSS3, Vanilla JavaScript
- Responsive design
- FontAwesome icons

### Backend
- **Node.js** & **Express.js** - Server framework
- **MongoDB** with **Mongoose** - Database
- **JWT** - Authentication & Authorization
- **bcryptjs** - Password hashing
- **helmet** - Security middleware
- **express-rate-limit** - Rate limiting
- **express-validator** - Input validation

### Security Features
- JWT-based authentication with access & refresh tokens
- Role-based access control (User, Guide, Admin)
- Password hashing with bcrypt
- HTTP security headers via Helmet.js
- Rate limiting to prevent abuse
- Input validation and sanitization
- CORS protection
- httpOnly cookies for token storage

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas account)
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

Edit the `.env` file with your configuration (see `.env.example` for all options).

4. Start MongoDB (if running locally):
```bash
mongod
```

5. Seed the database with sample data (optional):
```bash
npm run seed
```

6. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5000`

## API Documentation

See [docs/API_DOCUMENTATION.md](./docs/API_DOCUMENTATION.md) for complete API reference including:
- Authentication endpoints
- Tour management
- Newsletter subscription
- Security features
- Deployment guide

## Project Structure

```
boldadventures-landing_page/
├── server/
│   ├── config/          # Database configuration
│   ├── controllers/     # Request handlers
│   ├── middleware/      # Auth, validation, error handling
│   ├── models/          # Mongoose schemas
│   ├── routes/          # API routes
│   └── utils/           # Helper functions
├── css/                 # Frontend stylesheets
├── js/                  # Frontend JavaScript
├── images/              # Static assets
├── index.html           # Landing page
├── server.js            # Express app entry point
├── seed.js              # Database seeding script
├── render.yaml          # Render deployment config
└── .env.example         # Environment variables template
```

Features:
- **Hero Section**: A visually-appealing hero section showcasing the beauty of outdoor adventures
- **Tour Categories**: Clear presentation of hiking and biking tour categories
- **Search Functionality**: Simple search bar for finding tours
- **Call to Action**: Prominent buttons encouraging users to explore tours
- **Newsletter Subscription**: Stay updated with latest tour information
- **Responsive Design**: Mobile-friendly layout

## Backend Features

### Authentication & Authorization
- User registration and login
- JWT-based authentication (access & refresh tokens)
- Role-based access control (User, Guide, Admin)
- Password change functionality
- Secure session management

### Tour Management
- Browse and filter tours
- Featured tours section
- CRUD operations for tours (Admin/Guide only)
- Tour categories: Hiking, Biking, Adventure Packages
- Price and difficulty filtering

### Newsletter Management
- Email subscription
- Unsubscribe functionality
- Subscriber list management (Admin only)

### Security
- Password hashing with bcrypt
- HTTP security headers
- Rate limiting
- Input validation and sanitization
- CORS protection
- XSS protection

Deployment:

The frontend is currently deployed on Vercel.
The backend can be deployed on **Render** (recommended) or Cloudflare Workers.

See [docs/API_DOCUMENTATION.md](./docs/API_DOCUMENTATION.md) for deployment instructions.

## Test Accounts

After running `npm run seed`, you can use these test accounts:

- **Admin**: admin@boldadventures.com / Admin123!
- **Guide**: guide@boldadventures.com / Guide123!
- **User**: user@example.com / User123!

Next Steps:

- Connect frontend to backend API endpoints
- Implement user authentication UI
- Add booking functionality
- Set up email notifications
- Deploy backend to Render
- Configure production environment variables
- Add payment integration (future enhancement)
