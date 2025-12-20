# Environment Variables Setup

## Client (.env)

Create `client/.env` for local development:

```env
VITE_API_URL=http://localhost:5000
```

Create `client/.env.production` for production builds:

```env
VITE_API_URL=https://your-railway-backend.up.railway.app
```

## Server (.env)

Create `server/.env`:

```env
# Database (Supabase)
DATABASE_URL="postgresql://postgres.xxx:password@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.xxx:password@aws-1-ap-south-1.pooler.supabase.com:5432/postgres"

# JWT Secret (generate a long random string)
JWT_SECRET="your_long_random_string_here"

# Google Gemini API Key (from https://aistudio.google.com/)
GEMINI_API_KEY="your_gemini_api_key"

# Email Service (Resend - from https://resend.com/)
RESEND_API_KEY="your_resend_api_key"
EMAIL_FROM=onboarding@resend.dev

# Frontend URL
CLIENT_URL=http://localhost:5173
# Production: https://your-vercel-app.vercel.app
```

## How to Get API Keys

### 1. Google Gemini API Key
- Go to https://aistudio.google.com/
- Click "Get API Key"
- Copy and paste into `GEMINI_API_KEY`

### 2. Resend API Key (Email Service)
- Sign up at https://resend.com/
- Get API key from dashboard
- Copy and paste into `RESEND_API_KEY`

### 3. Supabase Database
- Create project at https://supabase.com/
- Go to Settings → Database
- Copy connection strings to `DATABASE_URL` and `DIRECT_URL`

## Security Notes

⚠️ **NEVER commit `.env` files to Git**
- They are already in `.gitignore`
- Use Railway/Vercel dashboards for production secrets
- Share example files (`.env.example`) without actual values

## Verification

Test if environment variables are loaded:

```bash
# Frontend
cd client
npm run dev
# Check console for API URL

# Backend
cd server
npm run dev
# Should start without errors
```
