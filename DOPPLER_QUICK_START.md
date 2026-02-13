# Doppler Quick Reference

Quick commands and tips for using Doppler with Bold Adventures.

## Local Development

### Quick Start (3 steps)
```bash
# 1. Install Doppler CLI (macOS)
brew install dopplerhq/cli/doppler

# 2. Login and setup
doppler login
doppler setup

# 3. Run your app
doppler run -- npm start
```

## Common Commands

### Setup
```bash
# Login to Doppler
doppler login

# Setup project (run in project directory)
doppler setup

# Check current configuration
doppler configure get
```

### Running Applications
```bash
# Start server with Doppler
doppler run -- npm start

# Development mode
doppler run -- npm run dev

# Run tests
doppler run -- npm test

# Run any command with Doppler
doppler run -- node script.js
```

### Managing Secrets
```bash
# List all secrets
doppler secrets

# Get a specific secret
doppler secrets get JWT_SECRET

# Set a secret
doppler secrets set NEW_SECRET="secret_value"

# Download all secrets to .env (for debugging only)
doppler secrets download --no-file --format env > .env
```

### Switching Environments
```bash
# Switch to production config
doppler setup --config prd

# Switch to staging
doppler setup --config stg

# Switch back to development
doppler setup --config dev

# Run with specific config (without changing setup)
doppler run --config prd -- npm start
```

## Service Tokens

### Generate Token
1. Go to Doppler Dashboard
2. Select Project → Config
3. Click "Access" → "Service Tokens"
4. Click "Generate" and name it
5. Copy the token (starts with `dp.st.`)

### Use Token
```bash
# Set as environment variable
export DOPPLER_TOKEN=dp.st.your_token_here

# Or use in command
DOPPLER_TOKEN=dp.st.your_token npm start
```

## Without Doppler CLI

If you don't want to install the CLI, just set the service token:

```bash
# macOS/Linux
export DOPPLER_TOKEN=dp.st.your_token_here
npm start

# Windows PowerShell
$env:DOPPLER_TOKEN = "dp.st.your_token_here"
npm start
```

The app will automatically fetch secrets from Doppler using the SDK.

## Fallback to .env

If no Doppler token is found, the app automatically falls back to `.env` file:

```bash
# Copy example
cp .env.example .env

# Edit with your values
nano .env

# Run normally
npm start
```

## CI/CD Integration

### GitHub Actions
Add `DOPPLER_TOKEN` to your repository secrets:
- Settings → Secrets and variables → Actions
- New repository secret
- Name: `DOPPLER_TOKEN`
- Value: Your service token

### Render
Add environment variable in Render dashboard:
- Key: `DOPPLER_TOKEN`
- Value: Your production service token

## Troubleshooting

### "No DOPPLER_TOKEN found"
This is normal! The app falls back to `.env` file automatically.

### Secrets not updating
```bash
# Clear Doppler cache
doppler run --no-cache -- npm start

# Or restart with latest secrets
doppler run -- npm start
```

### Wrong secrets loading
Check which config you're using:
```bash
doppler configure get
```

## Environment Variables

### Required Variables
- `MONGODB_URI` - Database connection string
- `JWT_SECRET` - JWT signing secret
- `JWT_REFRESH_SECRET` - Refresh token secret

### Optional Variables
- `STRIPE_SECRET_KEY` - Stripe payments
- `GOOGLE_CLIENT_ID` - Google OAuth
- `BREVO_API_KEY` - Email service
- See `.env.example` for complete list

## Best Practices

1. ✅ **Use `doppler run`** for local development
2. ✅ **Use service tokens** for CI/CD and production
3. ✅ **Different configs** for different environments
4. ✅ **Rotate secrets** regularly in Doppler dashboard
5. ❌ **Never commit** `.env` or `.doppler.yaml` files
6. ❌ **Never hardcode** secrets in your code

## Getting Help

- Full documentation: `docs/DOPPLER_SETUP.md`
- Doppler docs: https://docs.doppler.com
- Doppler support: support@doppler.com
