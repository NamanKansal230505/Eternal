# Auth0 Authentication Setup Guide

This guide will walk you through setting up Auth0 authentication for the Chakravyuh Dashboard.

## ✅ Step 1: Create Auth0 Account and Application

1. **Sign up for Auth0**
   - Go to [https://auth0.com/signup](https://auth0.com/signup)
   - Create a free account (free tier supports up to 7,000 users)

2. **Create a new Application**
   - After logging in, go to **Applications** → **Applications** in the sidebar
   - Click **Create Application**
   - Name it: `Chakravyuh Dashboard`
   - Select **Single Page Web Applications** as the application type
   - Click **Create**

## ✅ Step 2: Configure Auth0 Application Settings

1. **Get your Domain and Client ID**
   - In your application settings, you'll see:
     - **Domain**: `your-tenant.auth0.com` (copy this)
     - **Client ID**: `xxxxxxxxxxxxxxxxxxxx` (copy this)

2. **Configure Application URLs**
   - Scroll down to **Application URIs** section
   - Set the following URLs:
   
   **Allowed Callback URLs:**
   ```
   http://localhost:8080/callback
   http://localhost:8080
   http://localhost:8081/callback
   http://localhost:8081
   http://localhost:5173/callback
   http://localhost:5173
   ```
   (Add multiple ports to handle different configurations. For production, add your production URLs like `https://yourdomain.com/callback`)

   **Allowed Logout URLs:**
   ```
   http://localhost:8080
   http://localhost:8081
   http://localhost:5173
   ```
   (For production, add `https://yourdomain.com`)

   **Allowed Web Origins:**
   ```
   http://localhost:8080
   http://localhost:8081
   http://localhost:5173
   ```
   (For production, add `https://yourdomain.com`)

   **Allowed Origins (CORS):**
   ```
   http://localhost:8080
   http://localhost:8081
   http://localhost:5173
   ```
   (For production, add `https://yourdomain.com`)

3. **Save Changes**
   - Click **Save Changes** at the bottom of the page

## ✅ Step 3: Configure Environment Variables

1. **Create/Update `.env` file**
   - In your project root (`Chakravyuh_dashboard-main/Chakravyuh_dashboard-main/`), create or update `.env`:

```env
# Auth0 Configuration
VITE_AUTH0_DOMAIN=your-tenant.auth0.com
VITE_AUTH0_CLIENT_ID=your-client-id-here
VITE_AUTH0_AUDIENCE=your-api-identifier (optional - only if using Auth0 API)

# Existing Gemini API Key (keep this)
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

2. **Replace the values:**
   - Replace `your-tenant.auth0.com` with your actual Auth0 domain
   - Replace `your-client-id-here` with your actual Client ID
   - `VITE_AUTH0_AUDIENCE` is optional - only needed if you're using Auth0 APIs

## ✅ Step 4: Install Dependencies (Already Done)

The `@auth0/auth0-react` package has already been installed. If you need to reinstall:

```bash
npm install @auth0/auth0-react
```

## ✅ Step 5: Restart Development Server

1. **Stop the current dev server** (if running) with `Ctrl+C`

2. **Start the dev server again:**
   ```bash
   npm run dev
   ```

   This is important because environment variables are only loaded when the server starts.

## ✅ Step 6: Test the Authentication

1. **Open your browser** and go to `http://localhost:5173`

2. **Click "Login with Auth0"** button

3. **You should see the Auth0 Universal Login page:**
   - First time: You can sign up for a new account
   - Or use your existing Auth0 account

4. **After login, you'll be redirected** to `/dashboard`

5. **Logout:**
   - Click the **Logout** button in the dashboard header
   - You'll be redirected back to the login page

## 🎨 Customizing Auth0 Login (Optional)

### Enable Social Logins (Google, GitHub, etc.)

1. Go to **Authentication** → **Social** in Auth0 Dashboard
2. Enable social connections (Google, GitHub, etc.)
3. Configure each connection with API keys from the provider
4. Users will see these options on the login page

### Customize Login Page

1. Go to **Branding** → **Universal Login** in Auth0 Dashboard
2. Click **Customize** to edit the login page template
3. Customize colors, logos, and text to match your brand

## 🔒 Security Features Enabled

- ✅ **Token Refresh**: Automatically refreshes tokens when expired
- ✅ **Local Storage**: Securely stores tokens in browser localStorage
- ✅ **Protected Routes**: All dashboard routes require authentication
- ✅ **Automatic Redirect**: Unauthenticated users are redirected to login
- ✅ **Secure Logout**: Properly clears tokens and redirects to login

## 📝 Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_AUTH0_DOMAIN` | Your Auth0 tenant domain (e.g., `dev-xxxxx.auth0.com`) | Yes |
| `VITE_AUTH0_CLIENT_ID` | Your Auth0 application Client ID | Yes |
| `VITE_AUTH0_AUDIENCE` | API identifier (for API access) | No |

## 🐛 Troubleshooting

### Issue: "Auth0 domain and client ID must be configured"

**Solution:** Make sure your `.env` file has the correct values and you've restarted the dev server.

### Issue: "Invalid callback URL" or "403 Forbidden"

**Solution:** 
1. Check your Auth0 Application settings
2. Make sure your callback URL is in **Allowed Callback URLs**
   - Your app is running on `http://localhost:8081` (check your browser URL)
   - Add: `http://localhost:8081/callback` and `http://localhost:8081`
   - Also add common ports: `http://localhost:5173/callback`, `http://localhost:8080/callback`
3. Also add the base URL (without `/callback`) to **Allowed Logout URLs** and **Allowed Web Origins**
4. After updating, wait 10-15 seconds for changes to propagate, then try again

### Issue: Page stays on loading after login

**Solution:**
1. Check browser console for errors
2. Verify the callback URL is correctly configured
3. Make sure the `/callback` route is working

### Issue: "Access Denied" or "Unauthorized"

**Solution:**
1. Check that you've enabled the correct scopes in Auth0
2. Verify your application is set to "Single Page Application" type
3. Clear browser cache and localStorage, then try again

## 🚀 Production Deployment

When deploying to production:

1. **Update Auth0 Application URLs:**
   - Add production URLs to Allowed Callback URLs
   - Add production URLs to Allowed Logout URLs
   - Add production URLs to Allowed Web Origins

2. **Update Environment Variables:**
   - Set `VITE_AUTH0_DOMAIN` to your production domain (can be the same)
   - Set `VITE_AUTH0_CLIENT_ID` (can be the same or create a new app for production)

3. **Consider creating a separate Auth0 application** for production to keep development and production isolated.

## 📚 Additional Resources

- [Auth0 React SDK Documentation](https://auth0.com/docs/libraries/auth0-react)
- [Auth0 Dashboard](https://manage.auth0.com/)
- [Auth0 Community](https://community.auth0.com/)

## ✅ Implementation Complete!

Auth0 authentication is now fully integrated into your Chakravyuh Dashboard. All protected routes require authentication, and users can securely log in and out.

