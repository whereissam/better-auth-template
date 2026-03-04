# Telegram Login Setup Guide

Complete guide to set up Telegram OIDC authentication via Generic OAuth.

## How It Works

Telegram provides an OAuth 2.0 / OIDC login flow. We use Better Auth's `genericOAuth` plugin to integrate it, since Better Auth doesn't have a built-in Telegram provider.

**Important**: Telegram's token endpoint returns `Content-Type: text/plain` instead of `application/json`, which breaks automatic OIDC discovery. That's why we specify `authorizationUrl` and `tokenUrl` explicitly instead of using `discoveryUrl`.

## 1. Create a Telegram Bot

1. Open Telegram and search for **@BotFather**
2. Send `/newbot`
3. Choose a **name** (display name, e.g. "My Auth App")
4. Choose a **username** (must end in `bot`, e.g. `myauthapp_bot`)
5. BotFather will give you a **bot token** — save it, but this is NOT what you need for OAuth

## 2. Enable Telegram Login

1. In the BotFather chat, send `/mybots`
2. Select your bot
3. Go to **Bot Settings** → **Allow in Web Apps** → Enable
4. Then go to **Bot Settings** → **Domain** → Add your domain:
   - Development: your public HTTPS tunnel domain (Cloudflare Tunnel or ngrok)
   - Production: `yourdomain.com`

## 3. Register as OAuth Application

1. Go to [https://core.telegram.org/api/obtaining_api_id](https://core.telegram.org/api/obtaining_api_id) and register your app to get an **API ID**
2. Visit **@BotFather** again and send `/setdomain` to set your bot's allowed domain
3. Go to [https://oauth.telegram.org/auth](https://oauth.telegram.org/auth) — this is the authorization endpoint

To get your **Client ID** and **Client Secret** for OAuth:
1. Go to [https://oauth.telegram.org](https://oauth.telegram.org)
2. Log in and register your bot for OAuth
3. Set the **redirect URI** (see below)
4. You'll receive a **Client ID** (your bot's numeric ID) and **Client Secret**

## 4. Configure Redirect URI

Telegram OAuth callbacks require a **public HTTPS URL**. `localhost` and plain `http://` callbacks are not supported by Telegram OAuth.

The redirect URI must be set to:

- **Development (Cloudflare Tunnel)**: `https://your-backend-tunnel-domain/api/auth/oauth2/callback/telegram`
- **Development (ngrok)**: `https://your-backend-ngrok-domain/api/auth/oauth2/callback/telegram`
- **Production**: `https://api.yourdomain.com/api/auth/oauth2/callback/telegram`

**Note**: The path is `/api/auth/oauth2/callback/telegram` (not `/api/auth/callback/telegram`) because this uses the `genericOAuth` plugin, not a built-in social provider.

## 5. Add Environment Variables

### Backend

For Cloudflare Workers, add to `.dev.vars`:
```env
TELEGRAM_CLIENT_ID=your_bot_numeric_id
TELEGRAM_CLIENT_SECRET=your_client_secret
```

For Node.js, add to `.env`:
```env
TELEGRAM_CLIENT_ID=your_bot_numeric_id
TELEGRAM_CLIENT_SECRET=your_client_secret
```

### Restart Backend

```bash
cd backend
bun run dev       # Cloudflare Workers
# or
bun run dev:node  # Node.js
```

## 6. Test Authentication

1. Start your app locally
2. Expose frontend and backend with HTTPS public URLs (Cloudflare Tunnel or ngrok)
3. Open your **HTTPS frontend URL** in browser (not localhost)
4. Ensure Telegram redirect URI uses your **HTTPS backend URL**
5. Click "Continue with Telegram"
6. You should be redirected to Telegram's OAuth page
7. Authorize the app
8. You'll be redirected back to your app, logged in!

### Testing on Mobile

Telegram login works best on mobile (where the Telegram app handles the auth flow). Use ngrok to expose your local dev server:

```bash
# Frontend
ngrok http 4000

# Backend (separate tunnel)
ngrok http 4200
```

Then update your frontend `.env`:
```env
VITE_API_URL=https://your-backend-ngrok-domain
VITE_APP_URL=https://your-frontend-ngrok-domain
VITE_ALLOWED_HOSTS=your-frontend-ngrok-domain
```

And your backend `.dev.vars` / `.env`:
```env
# Backend public URL (used for Telegram callback)
BETTER_AUTH_URL=https://your-backend-ngrok-domain
# Frontend public URL
APP_URL=https://your-frontend-ngrok-domain
# Allow frontend origin(s)
TRUSTED_ORIGINS=https://your-frontend-ngrok-domain
```

## Troubleshooting

### Error: "invalid_client"

**Problem**: Client ID or Secret is wrong

**Solution**:
- Double-check `TELEGRAM_CLIENT_ID` is the bot's numeric ID
- Verify `TELEGRAM_CLIENT_SECRET` is correct
- Make sure there are no extra spaces (the template trims whitespace automatically)

### Error: "redirect_uri_mismatch"

**Problem**: Redirect URI doesn't match what's registered

**Solution**:
- Ensure the redirect URI registered with Telegram matches exactly
- Path must be `/api/auth/oauth2/callback/telegram`
- Must be a public `https://` URL

### Error: `Invalid callbackURL` in backend logs

**Problem**: Current request origin is not allowed by Better Auth

**Solution**:
- Set `APP_URL` to your current frontend HTTPS URL (ngrok or Cloudflare Tunnel)
- Include that same URL in `TRUSTED_ORIGINS` (comma-separated if multiple)
- Set `BETTER_AUTH_URL` to your current backend HTTPS URL
- Restart backend after `.env` changes

### Token endpoint returns unparseable response

**Problem**: Telegram returns `Content-Type: text/plain` instead of `application/json`

**Solution**: This is a known Telegram bug. Our implementation works around it by using explicit `authorizationUrl` and `tokenUrl` instead of `discoveryUrl`. If you see this error, make sure you haven't switched to using `discoveryUrl`.

### User has no email after login

**Expected behavior**: Telegram doesn't provide email addresses. Users who log in via Telegram will have either:
- A phone-based synthetic email (`+1234567890@telegram.local`) if they shared their phone number
- No email at all

The app handles this gracefully by hiding synthetic emails in the UI.

### Login button doesn't appear

**Problem**: Environment variables not set

**Solution**:
- Check that `TELEGRAM_CLIENT_ID` and `TELEGRAM_CLIENT_SECRET` are set
- Telegram login button visibility may be controlled by the frontend — check `LoginButton.tsx`

## Technical Details

### Why Generic OAuth Instead of Built-in Provider

Better Auth doesn't have a built-in Telegram provider. We use the `genericOAuth` plugin with manual configuration:

- **Authorization URL**: `https://oauth.telegram.org/auth`
- **Token URL**: `https://oauth.telegram.org/token`
- **PKCE**: Enabled
- **Authentication**: Basic (HTTP Basic Auth for token exchange)
- **Scopes**: `openid`, `profile`, `phone`

### User Info Extraction

Telegram returns user info as a JWT `id_token`. We decode it manually to extract:
- `sub` → user ID
- `name` / `preferred_username` → display name
- `picture` → avatar URL
- `phone_number` → used to generate synthetic email

See `backend/src/lib/auth.ts` for the full `getUserInfo` implementation.

## Production Deployment

### 1. Update Redirect URI

Register your production callback URL with Telegram:
```
https://api.yourdomain.com/api/auth/oauth2/callback/telegram
```

### 2. Update Environment Variables

For Cloudflare Workers:
```bash
wrangler secret put TELEGRAM_CLIENT_ID
wrangler secret put TELEGRAM_CLIENT_SECRET
```

For Node.js, edit `.env`:
```env
TELEGRAM_CLIENT_ID=your_bot_numeric_id
TELEGRAM_CLIENT_SECRET=your_client_secret
```

### 3. Set Bot Domain

In @BotFather, update the domain to your production domain.

## Resources

- [Telegram Login Widget (Official)](https://core.telegram.org/bots/telegram-login) — official docs for Telegram Login
- [Telegram OAuth Documentation](https://core.telegram.org/api/url-authorization)
- [Telegram Bot API](https://core.telegram.org/bots/api)
- [Better Auth Generic OAuth Plugin](https://www.better-auth.com/docs/plugins/generic-oauth)
- [@BotFather](https://t.me/BotFather)
