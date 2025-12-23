# Fix: Refresh Token Not Found Error

## Problem Summary

The backend was throwing "Refresh token not found" error when the frontend attempted to refresh the access token. This was caused by a mismatch in how the refresh token was being transmitted between frontend and backend.

## Root Cause

1. **Backend expectation**: Reading refresh token from HttpOnly cookies (`request.cookies.refreshToken`)
2. **Frontend behavior**: Sending refresh token in the request body as JSON
3. **CORS misconfiguration**: Not allowing credentials (cookies) in cross-origin requests

## Changes Made

### Backend Changes

#### 1. `src/main.ts`

- **Updated CORS configuration** to accept credentials and allow requests from frontend
- Added `credentials: true` to enable cookie transmission
- Added `origin` configuration to whitelist frontend URL
- Configured allowed methods and headers

```typescript
app.enableCors({
  origin: process.env.FRONTEND_URL || "http://localhost:3001",
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
});
```

#### 2. `src/interface/controllers/auth.controller.ts`

- **Improved error handling** by replacing generic `Error` with `UnauthorizedException`
- Added descriptive error message for missing refresh token
- Added import for `UnauthorizedException`

#### 3. `.env.example` (NEW FILE)

- Created environment variables template
- Documented all required configuration including `FRONTEND_URL`
- Added cookie configuration options

### Frontend Changes

#### 1. `lib/api/client.ts`

- **Enabled credentials** in axios instance with `withCredentials: true`
- **Removed refresh token from request body** in `handleTokenRefresh()`
- Updated to rely on HttpOnly cookies for refresh token transmission

#### 2. `lib/api/auth.service.ts`

- **Updated `refreshToken()` method** to send empty body (token comes from cookie)
- **Updated `logout()` method** to not send refresh token in body

## Environment Variables Required

### Backend (.env)

```bash
# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3001

# Cookie Configuration
COOKIE_SECURE=false  # Set to true in production with HTTPS
COOKIE_SAME_SITE=lax  # Options: strict | lax | none
```

## How It Works Now

### Login Flow

1. User logs in with credentials
2. Backend generates access token and refresh token
3. Backend sends access token in response body
4. Backend sets refresh token as HttpOnly cookie
5. Frontend stores access token in localStorage
6. Frontend automatically receives and stores the HttpOnly cookie

### Token Refresh Flow

1. Frontend makes request with expired/invalid access token
2. Backend returns 401 Unauthorized
3. Frontend interceptor catches 401
4. Frontend calls `/auth/refresh` endpoint
5. **Browser automatically sends refresh token cookie**
6. Backend reads refresh token from `request.cookies.refreshToken`
7. Backend validates and generates new tokens
8. Backend sends new access token in response
9. Backend sets new refresh token as HttpOnly cookie
10. Frontend updates access token in localStorage
11. Frontend retries original request with new access token

### Logout Flow

1. Frontend calls `/auth/logout` endpoint
2. **Browser automatically sends refresh token cookie**
3. Backend invalidates the refresh token
4. Backend clears the refresh token cookie
5. Frontend clears localStorage

## Security Benefits

1. **HttpOnly Cookies**: Refresh token is not accessible to JavaScript, preventing XSS attacks
2. **CORS Protection**: Only whitelisted origins can make authenticated requests
3. **Automatic Cookie Handling**: Browser manages cookie lifecycle, reducing attack surface
4. **Token Rotation**: Each refresh generates a new refresh token

## Testing Instructions

1. **Ensure environment variables are set**:

   ```bash
   # Backend .env
   FRONTEND_URL=http://localhost:3001
   COOKIE_SECURE=false
   COOKIE_SAME_SITE=lax
   ```

2. **Restart both services**:

   ```bash
   # Backend
   cd portfolio-backend
   npm run start:dev

   # Frontend
   cd portfolio-frontend
   npm run dev
   ```

3. **Test login**:

   - Navigate to login page
   - Login with credentials
   - Check browser DevTools > Application > Cookies
   - Verify `refreshToken` cookie exists with HttpOnly flag

4. **Test token refresh**:

   - Wait for access token to expire (15 minutes) OR manually delete access token from localStorage
   - Make an API request
   - Verify in Network tab that refresh endpoint is called
   - Verify new access token is returned
   - Verify original request is retried successfully

5. **Test logout**:
   - Logout
   - Verify `refreshToken` cookie is deleted
   - Verify localStorage is cleared

## Troubleshooting

### Issue: Cookies not being sent

- **Check**: CORS configuration includes `credentials: true`
- **Check**: Frontend axios has `withCredentials: true`
- **Check**: Frontend URL matches CORS origin whitelist

### Issue: CORS errors

- **Check**: `FRONTEND_URL` environment variable is correctly set
- **Check**: Frontend is running on the URL specified in `FRONTEND_URL`
- **Check**: Backend CORS configuration allows the frontend origin

### Issue: Cookie not being set

- **Check**: `COOKIE_SECURE` is `false` for local development (HTTP)
- **Check**: `COOKIE_SAME_SITE` is set to `lax` or `none`
- **Note**: In production with HTTPS, set `COOKIE_SECURE=true`

## Production Deployment Notes

For production deployment, update the following:

1. **Backend .env**:

   ```bash
   FRONTEND_URL=https://your-production-domain.com
   COOKIE_SECURE=true  # Requires HTTPS
   COOKIE_SAME_SITE=strict  # Stricter security
   ```

2. **Ensure HTTPS** is enabled for both frontend and backend

3. **Update frontend API URL** in `NEXT_PUBLIC_API_URL`
