# Doppler Secrets Management Setup Guide

This guide explains how to use Doppler for managing secrets in the Bold Adventures application.

## What is Doppler?

Doppler is a universal secrets manager that helps you keep your API keys, database credentials, and other sensitive configuration data secure and synchronized across all environments.

**Benefits:**
- 🔒 **Secure**: Encrypted at rest and in transit
- 🔄 **Synchronized**: Keep secrets in sync across all environments
- 👥 **Team-friendly**: Share secrets securely with your team
- 🚀 **CI/CD Ready**: Easy integration with GitHub Actions, Render, and other platforms
- 📝 **Audit Trail**: Track who accessed or modified secrets
- 🔑 **Access Control**: Fine-grained permissions for team members

## Prerequisites

1. A Doppler account (free tier available at [doppler.com](https://doppler.com))
2. Doppler CLI installed locally (optional but recommended for local development)

## Installation

### 1. Install Doppler CLI (Optional for Local Development)

**macOS:**
```bash
brew install dopplerhq/cli/doppler
```

**Linux:**
```bash
# Debian/Ubuntu
sudo apt-get update && sudo apt-get install -y apt-transport-https ca-certificates curl gnupg
curl -sLf --retry 3 --tlsv1.2 --proto "=https" 'https://packages.doppler.com/public/cli/gpg.DE2A7741A397C129.key' | sudo apt-key add -
echo "deb https://packages.doppler.com/public/cli/deb/debian any-version main" | sudo tee /etc/apt/sources.list.d/doppler-cli.list
sudo apt-get update && sudo apt-get install doppler

# RedHat/CentOS
sudo rpm --import 'https://packages.doppler.com/public/cli/gpg.DE2A7741A397C129.key'
curl -sLf --retry 3 --tlsv1.2 --proto "=https" 'https://packages.doppler.com/public/cli/config.rpm.txt' | sudo tee /etc/yum.repos.d/doppler-cli.repo
sudo yum install doppler
```

**Windows:**
```powershell
# Using Scoop
scoop install doppler
```

For other installation methods, see [Doppler CLI Installation](https://docs.doppler.com/docs/install-cli)

### 2. Project Dependencies

The project already includes the Doppler Node.js SDK as a dependency:

```bash
npm install
```

## Doppler Project Setup

### 1. Create a Doppler Project

1. Log in to [Doppler Dashboard](https://dashboard.doppler.com)
2. Click "Create Project"
3. Name it `boldadventures` (or update `doppler.yaml` with your project name)
4. Create the following configs:
   - `dev` - For local development
   - `stg` - For staging environment (optional)
   - `prd` - For production

### 2. Add Secrets to Doppler

In the Doppler dashboard, add all the secrets from `.env.example`:

**Required Secrets:**

```
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:3000

# Database
MONGODB_URI=mongodb://localhost:27017/boldadventures

# JWT Secrets
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Security
BCRYPT_ROUNDS=12
CSRF_SECRET=your-csrf-secret-change-in-production

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# Payment Gateways (Optional)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_stripe_webhook_secret

PAYPAL_MODE=sandbox
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
PAYPAL_WEBHOOK_ID=your_paypal_webhook_id

# Currency API (Optional)
EXCHANGE_RATE_API_KEY=your_exchange_rate_api_key_here
KES_TO_USD_RATE=0.0077

# Email Configuration (Optional)
BREVO_API_KEY=your_brevo_api_key_here
BREVO_FROM=noreply@boldadventures.com

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password
EMAIL_FROM=noreply@boldadventures.com
EMAIL_FROM_NAME=Bold Adventures

# Cloudinary (Optional)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## Local Development Setup

### Option 1: Using Doppler CLI (Recommended)

1. **Authenticate with Doppler:**
   ```bash
   doppler login
   ```

2. **Setup the project:**
   ```bash
   cd /path/to/boldadventures
   doppler setup
   ```
   
   Select:
   - Project: `boldadventures`
   - Config: `dev`

3. **Run your application with Doppler:**
   ```bash
   doppler run -- npm start
   ```
   
   Or for development:
   ```bash
   doppler run -- npm run dev
   ```

The CLI will automatically inject all secrets as environment variables when running your application.

### Option 2: Using Service Token (Alternative)

1. **Generate a Service Token:**
   - Go to Doppler Dashboard → Your Project → Config (e.g., `dev`)
   - Click "Access" → "Service Tokens"
   - Click "Generate" and name it (e.g., "Local Development")
   - Copy the token (starts with `dp.st.`)

2. **Set the token as an environment variable:**
   
   **macOS/Linux:**
   ```bash
   export DOPPLER_TOKEN=dp.st.your_token_here
   ```
   
   **Windows (PowerShell):**
   ```powershell
   $env:DOPPLER_TOKEN = "dp.st.your_token_here"
   ```

3. **Run your application:**
   ```bash
   npm start
   ```

The application will automatically fetch secrets from Doppler using the token.

### Option 3: Fallback to `.env` (Local Only)

If you don't have Doppler configured, the application will automatically fall back to using `.env` file:

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` with your local configuration

3. Run your application:
   ```bash
   npm start
   ```

## Production Deployment

### Deploying to Render

1. **Generate a Service Token for Production:**
   - In Doppler Dashboard, go to `boldadventures` → `prd` config
   - Generate a Service Token named "Render Production"
   - Copy the token

2. **Add to Render:**
   - Go to your Render dashboard
   - Select your service
   - Go to "Environment" tab
   - Add environment variable:
     - Key: `DOPPLER_TOKEN`
     - Value: `dp.st.your_production_token`

3. **Deploy:**
   - Render will automatically use the Doppler token to fetch secrets
   - No need to add individual environment variables

### Deploying to Other Platforms

#### Heroku
```bash
heroku config:set DOPPLER_TOKEN=dp.st.your_token_here
```

#### Vercel
Add `DOPPLER_TOKEN` to your project's environment variables in the Vercel dashboard.

#### AWS/Docker/Kubernetes
See [Doppler Integrations](https://docs.doppler.com/docs/integrations) for platform-specific guides.

## CI/CD Integration

### GitHub Actions

Add Doppler to your GitHub Actions workflow:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Install Doppler CLI
        uses: dopplerhq/cli-action@v1
      
      - name: Install dependencies
        run: npm install
      
      - name: Run tests with Doppler secrets
        env:
          DOPPLER_TOKEN: ${{ secrets.DOPPLER_TOKEN }}
        run: doppler run -- npm test
```

Add your Doppler service token to GitHub repository secrets as `DOPPLER_TOKEN`.

## Managing Secrets

### Adding a New Secret

1. **Via Doppler Dashboard:**
   - Go to your project and config
   - Click "Add Secret"
   - Enter key and value
   - Save

2. **Via CLI:**
   ```bash
   doppler secrets set NEW_SECRET=new_value
   ```

### Updating a Secret

Simply update the value in Doppler Dashboard or CLI. Changes will be reflected immediately for new application starts.

### Rotating Secrets

1. Update the secret value in Doppler
2. Restart your application/service
3. The new value will be used automatically

## Doppler Project Structure

```
boldadventures/
├── dev (Development)
│   └── Secrets for local development
├── stg (Staging - Optional)
│   └── Secrets for staging environment
└── prd (Production)
    └── Secrets for production environment
```

## Best Practices

1. **Never commit secrets to Git:**
   - `.env` files are already in `.gitignore`
   - Never commit `.doppler.yaml` (user-specific configuration)

2. **Use different configs for different environments:**
   - `dev` for local development
   - `stg` for staging
   - `prd` for production

3. **Rotate secrets regularly:**
   - Update JWT secrets periodically
   - Rotate API keys when team members leave
   - Use Doppler's audit logs to track changes

4. **Use service tokens for automation:**
   - Generate separate tokens for each service/environment
   - Revoke tokens when no longer needed
   - Use read-only tokens when possible

5. **Review access regularly:**
   - Use Doppler's access controls to limit who can view/edit secrets
   - Enable audit logging to track changes
   - Set up alerts for critical secret changes

## Troubleshooting

### "No DOPPLER_TOKEN found" message

This is normal and expected for local development without Doppler CLI. The application will fall back to `.env` file.

### Secrets not loading

1. Verify your `DOPPLER_TOKEN` is correct
2. Check that the token has access to the specified project and config
3. Verify network connectivity to Doppler API
4. Check application logs for specific error messages

### CLI not found

Ensure Doppler CLI is properly installed:
```bash
doppler --version
```

### Wrong config being used

Check your setup:
```bash
doppler configure get
```

Update if needed:
```bash
doppler setup --project boldadventures --config dev
```

## Additional Resources

- [Doppler Documentation](https://docs.doppler.com)
- [Doppler Node.js SDK](https://github.com/DopplerHQ/node-sdk)
- [Doppler Best Practices](https://docs.doppler.com/docs/best-practices)
- [Doppler Integrations](https://docs.doppler.com/docs/integrations)

## Support

- **Doppler Support:** [support@doppler.com](mailto:support@doppler.com)
- **Documentation Issues:** Create an issue in the project repository
