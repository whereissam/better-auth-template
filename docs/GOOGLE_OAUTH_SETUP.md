# Google OAuth Setup Guide

Complete guide to set up Google OAuth authentication.

## 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select existing)
   - Click "Select a project" dropdown at the top
   - Click "New Project"
   - Enter project name (e.g., "Better Auth App")
   - Click "Create"

## 2. Enable Google+ API

1. In your project, go to **APIs & Services** → **Library**
2. Search for "Google+ API"
3. Click on it and click "Enable"
   - This is required for OAuth to work
   - Gives access to basic profile information

## 3. Configure OAuth Consent Screen

1. Go to **APIs & Services** → **OAuth consent screen**
2. Choose **External** (unless you have Google Workspace)
3. Click "Create"

### App Information
- **App name**: Your app name (e.g., "My Auth App")
- **User support email**: Your email
- **App logo**: Optional
- **App domain**: Leave blank for development
- **Authorized domains**: For production, add your domain

### Developer contact
- Add your email address

4. Click "Save and Continue"

### Scopes
1. Click "Add or Remove Scopes"
2. Select these scopes:
   - `userinfo.email`
   - `userinfo.profile`
   - `openid`
3. Click "Update" → "Save and Continue"

### Test Users (for development)
1. Click "Add Users"
2. Add your Gmail address(es) for testing
3. Click "Save and Continue"

4. Review and click "Back to Dashboard"

## 4. Create OAuth Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click "Create Credentials" → "OAuth client ID"
3. Choose **Web application**

### Configure the OAuth client

**Name**: "Better Auth Web Client" (or any name)

**Authorized JavaScript origins** (for CORS):
- Development: `http://localhost:3000`
- Production: `https://yourdomain.com`

**Authorized redirect URIs**:
- Development: `http://localhost:3000/api/auth/callback/google`
- Production: `https://yourdomain.com/api/auth/callback/google`

**Important**: The redirect URI must match exactly, including:
- Protocol (http vs https)
- Domain
- Port (for localhost)
- Path

4. Click "Create"

## 5. Get Credentials

After creating:
1. You'll see a modal with your credentials
2. Copy the **Client ID** (looks like: `xxxxx.apps.googleusercontent.com`)
3. Copy the **Client Secret**
4. Click "OK"

You can always view these later from the Credentials page.

## 6. Add to Environment Variables

### Backend `.env`

```env
# Google OAuth
GOOGLE_CLIENT_ID=your_client_id_here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret_here
```

### Restart Backend

```bash
cd backend
npm run dev
```

## 7. Test Authentication

1. Start your app: `http://localhost:3000`
2. Click "Continue with Google"
3. You should be redirected to Google's login page
4. Sign in with a test user account
5. Grant permissions
6. You'll be redirected back to your app, logged in!

## Troubleshooting

### Error: "Access blocked: This app's request is invalid"

**Problem**: OAuth consent screen not configured properly

**Solution**:
- Go back to OAuth consent screen
- Ensure all required fields are filled
- Add yourself as a test user
- Save changes

### Error: "redirect_uri_mismatch"

**Problem**: Redirect URI doesn't match exactly

**Solution**:
1. Check the error message for the exact URI being used
2. Go to Credentials → Edit OAuth client
3. Add the EXACT URI shown in the error
4. Include protocol, domain, port, and path

Common mistakes:
- `http://localhost:3000/api/auth/callback/google` ✅
- `http://localhost:3000/api/auth/callback/google/` ❌ (trailing slash)
- `http://127.0.0.1:3000/api/auth/callback/google` ❌ (use localhost, not 127.0.0.1)

### Error: "This app has not been verified"

**Problem**: App is in testing mode

**For Development**:
- Click "Advanced" → "Go to [App name] (unsafe)"
- This is normal for apps in testing mode
- Only shows up for users not in the test users list

**For Production**:
- Submit app for verification through Google Cloud Console
- Or stay in testing mode and manually add users

### Error: "Error 400: invalid_request"

**Problem**: Missing required OAuth scopes

**Solution**:
- Go to OAuth consent screen → Edit app
- Add required scopes in the Scopes section
- Save changes
- Clear browser cache/cookies
- Try again

### Cookies Not Working

**Symptoms**: Login works but session not persisted

**Solutions**:
1. Ensure Vite proxy is configured (should be by default)
2. Check `credentials: "include"` in auth client
3. Verify CORS settings in backend
4. Clear browser cookies and try again

## Production Deployment

### 1. Update Authorized Origins

Add your production domain:
```
https://yourdomain.com
```

### 2. Update Redirect URIs

Add production callback:
```
https://yourdomain.com/api/auth/callback/google
```

### 3. Update Environment Variables

```env
# Production backend .env
GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret
APP_URL=https://yourdomain.com
ALLOWED_ORIGINS=https://yourdomain.com
```

### 4. App Verification (Optional but Recommended)

For public apps, verify your app with Google:

1. Go to OAuth consent screen
2. Click "Publish App"
3. Click "Prepare for verification"
4. Follow the verification process:
   - Add privacy policy URL
   - Add terms of service URL
   - Explain why you need each scope
   - Submit for review

**Note**: Verification can take several weeks. You can use unverified apps, but users will see a warning.

## Security Best Practices

### 1. Keep Secrets Secret
- Never commit Client Secret to git
- Use environment variables
- Rotate secrets if exposed

### 2. Validate Redirect URIs
- Only add URIs you control
- Use HTTPS in production
- Don't use wildcards

### 3. Limit Scopes
- Only request scopes you need
- More scopes = more permissions users must grant
- Users trust apps that request fewer permissions

### 4. Test User Management
- In testing mode, manually add users
- For production, get verified or keep limited user base

## Multiple Environments

You can create separate OAuth clients for each environment:

### Development OAuth Client
- **Name**: "My App (Development)"
- **Origins**: `http://localhost:3000`
- **Redirect**: `http://localhost:3000/api/auth/callback/google`

### Staging OAuth Client
- **Name**: "My App (Staging)"
- **Origins**: `https://staging.yourdomain.com`
- **Redirect**: `https://staging.yourdomain.com/api/auth/callback/google`

### Production OAuth Client
- **Name**: "My App (Production)"
- **Origins**: `https://yourdomain.com`
- **Redirect**: `https://yourdomain.com/api/auth/callback/google`

Then use different Client IDs/Secrets in each environment's `.env` file.

## Common Use Cases

### Get User's Email

Google automatically provides email in the user profile:

```typescript
const { user } = useTwitterAuth(); // Works for Google too
console.log(user.email); // User's Gmail address
```

### Get User's Profile Picture

```typescript
console.log(user.avatar); // Profile picture URL
```

### Link Google to Existing Account

Better Auth automatically handles account linking. If a user signs in with Twitter, then later with Google using the same email, they'll be linked to the same account.

## Resources

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Google Cloud Console](https://console.cloud.google.com/)
- [Better Auth Documentation](https://www.better-auth.com/docs)
- [OAuth 2.0 Playground](https://developers.google.com/oauthplayground/)

## Support

If you encounter issues:
1. Check this troubleshooting guide
2. Review Google's error messages carefully
3. Check browser console for errors
4. Review backend logs
5. Open an issue on GitHub

## Next Steps

✅ Google OAuth configured
📖 Add more providers (GitHub, Discord, etc.)
🔐 Implement email/password authentication
👤 Add user profile management
🚀 Deploy to production
