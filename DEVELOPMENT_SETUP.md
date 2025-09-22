# 🚀 Development Setup - Magic Link Fix

## ⚡ Quick Start

The magic link authentication now works in development mode. Here's how to run it:

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

This will start:
- **Frontend**: http://localhost:5173 (Vite)
- **API Server**: http://localhost:3001 (Express)

### 3. Test Magic Link
1. Click "Join Contest" or any auth-required action
2. Enter your email in the modal
3. Click "Send Magic Link"
4. **Check the terminal/console** - the magic link will be logged there
5. Copy and paste the magic link in your browser to complete authentication

## 🔧 How It Works

- **Development**: API requests are proxied to localhost:3001
- **Production**: API requests go to Vercel serverless functions
- **Magic Links**: Logged to console in development, emailed in production
- **Rate Limiting**: 5 requests per hour per email/device

## 🧪 Testing

The magic link will look like:
```
http://localhost:5173/auth/verify?token=abc123...&email=user@example.com
```

Just paste this URL in your browser to complete the authentication flow.

## 📝 Notes

- No email service needed in development
- All magic links are logged to the console
- Rate limiting is still enforced
- Session management works the same as production