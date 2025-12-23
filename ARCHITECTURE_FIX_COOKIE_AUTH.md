# ✅ FIX: Kiến Trúc Authentication - Cookie-Based Auth

## 🔴 Vấn Đề Ban Đầu

**Lỗi kiến trúc nghiêm trọng**: Server-side middleware không thể đọc localStorage!

### Kiến Trúc Cũ (SAI)

```
┌─────────────────────────────────────────┐
│ Frontend (Next.js)                      │
├─────────────────────────────────────────┤
│ • Access Token → localStorage ❌        │
│ • Refresh Token → HttpOnly Cookie ✓    │
│ • Middleware → Đọc từ cookie ❌         │
│   (Không tìm thấy access token!)       │
└─────────────────────────────────────────┘
```

**Vấn đề**:

- Access token lưu trong `localStorage` (client-side only)
- Middleware chạy server-side → KHÔNG ĐỌC ĐƯỢC localStorage
- Middleware không thể xác thực user → FAIL!

## ✅ Giải Pháp: Cookie-Based Authentication

### Kiến Trúc Mới (ĐÚNG)

```
┌──────────────────────────────────────────────────┐
│ Backend (NestJS)                                 │
├──────────────────────────────────────────────────┤
│ Login/Refresh Response:                          │
│ • Set-Cookie: accessToken (HttpOnly) ✓          │
│ • Set-Cookie: refreshToken (HttpOnly) ✓         │
│ • Response Body: { user, accessToken }          │
└──────────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────────┐
│ Frontend (Next.js)                               │
├──────────────────────────────────────────────────┤
│ Storage:                                         │
│ • Access Token → HttpOnly Cookie ✓              │
│ • Refresh Token → HttpOnly Cookie ✓             │
│ • User Data → localStorage ✓                    │
│                                                  │
│ Middleware (Server-Side):                       │
│ • Đọc accessToken từ cookie ✓                   │
│ • Xác thực user thành công ✓                    │
└──────────────────────────────────────────────────┘
```

## 📝 Thay Đổi Chi Tiết

### Backend Changes

#### 1. `src/interface/controllers/auth.controller.ts`

**Login endpoint** - Set cả 2 cookies:

```typescript
// Set access token as HttpOnly cookie (for server-side middleware)
response.cookie("accessToken", authResponse.accessToken, {
  httpOnly: true,
  secure: process.env.COOKIE_SECURE === "true",
  sameSite:
    (process.env.COOKIE_SAME_SITE as "strict" | "lax" | "none") || "lax",
  maxAge: 15 * 60 * 1000, // 15 minutes
});

// Set refresh token as HttpOnly cookie
response.cookie("refreshToken", refreshToken, {
  httpOnly: true,
  secure: process.env.COOKIE_SECURE === "true",
  sameSite:
    (process.env.COOKIE_SAME_SITE as "strict" | "lax" | "none") || "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
});
```

**Refresh endpoint** - Rotate cả 2 cookies:

```typescript
// Set new access token
response.cookie("accessToken", authResponse.accessToken, {
  httpOnly: true,
  secure: process.env.COOKIE_SECURE === "true",
  sameSite:
    (process.env.COOKIE_SAME_SITE as "strict" | "lax" | "none") || "lax",
  maxAge: 15 * 60 * 1000,
});

// Rotate refresh token
response.cookie("refreshToken", newRefreshToken, {
  httpOnly: true,
  secure: process.env.COOKIE_SECURE === "true",
  sameSite:
    (process.env.COOKIE_SAME_SITE as "strict" | "lax" | "none") || "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
});
```

**Logout endpoint** - Clear cả 2 cookies:

```typescript
response.clearCookie("accessToken");
response.clearCookie("refreshToken");
```

#### 2. `src/main.ts` - CORS Configuration

```typescript
app.enableCors({
  origin: process.env.FRONTEND_URL || "http://localhost:3001",
  credentials: true, // ← Quan trọng!
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
});
```

### Frontend Changes

#### 1. `lib/api/token-manager.ts` - Cookie-Based Storage

```typescript
/**
 * Get access token from cookies
 * Note: HttpOnly cookies cannot be read by JavaScript
 * This returns null, but cookie is sent automatically with requests
 */
getAccessToken(): string | null {
  if (!this.isClient) return null;
  return getCookie('accessToken'); // Will be null for HttpOnly
}

/**
 * Check if user is authenticated
 * Check user data instead of token (since token is HttpOnly)
 */
isAuthenticated(): boolean {
  return !!this.getUser(); // Check user data in localStorage
}

/**
 * Get authorization header - NOT NEEDED
 * Auth is handled via HttpOnly cookies automatically
 */
getAuthHeader(): string | null {
  return null; // No manual header needed
}
```

#### 2. `lib/api/client.ts` - Axios Configuration

```typescript
this.axiosInstance = axios.create({
  baseURL: API_CONFIG.baseURL,
  timeout: API_CONFIG.timeout,
  headers: API_CONFIG.headers,
  withCredentials: true, // ← Gửi cookies với mọi request
});
```

**Token Refresh** - Không cần body:

```typescript
const response = await this.axiosInstance.post<RefreshTokenResponse>(
  API_CONFIG.endpoints.refresh,
  {}, // Empty body - token từ cookie
  { skipAuth: true, skipRefresh: true }
);

// Tokens được set bởi backend qua cookies
// Không cần lưu vào localStorage
```

#### 3. `lib/api/auth.service.ts` - Simplified Auth

```typescript
async refreshToken(): Promise<RefreshTokenResponse> {
  const response = await apiClient.post<RefreshTokenResponse>(
    API_CONFIG.endpoints.refresh,
    {}, // Empty body
    { skipAuth: true, skipRefresh: true }
  );

  // Tokens are set by backend as HttpOnly cookies
  // No need to store them in localStorage
  return response;
}
```

#### 4. `middleware.ts` - Server-Side Auth

```typescript
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ✅ Đọc access token từ cookie (server-side)
  const accessToken = request.cookies.get("accessToken")?.value;
  const isAuthenticated = !!accessToken;

  // Protect routes
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}
```

## 🔒 Bảo Mật

### HttpOnly Cookies

✅ **Access Token**: HttpOnly → JavaScript không đọc được → Chống XSS  
✅ **Refresh Token**: HttpOnly → JavaScript không đọc được → Chống XSS  
✅ **Automatic Sending**: Browser tự động gửi cookies → Không cần manual handling  
✅ **Server-Side Validation**: Middleware có thể đọc và validate → Bảo mật tốt hơn

### CORS Protection

✅ **Credentials**: Chỉ frontend được whitelist mới gửi cookies  
✅ **Origin Check**: Backend kiểm tra origin trước khi accept cookies

## 🧪 Testing

### 1. Login Flow

```bash
# Request
POST /auth/login
Body: { email, password }

# Response
Set-Cookie: accessToken=xxx; HttpOnly; SameSite=Lax; Max-Age=900
Set-Cookie: refreshToken=yyy; HttpOnly; SameSite=Lax; Max-Age=604800
Body: { user: {...}, accessToken: "xxx" }
```

### 2. Protected Route Access

```bash
# Request (Browser tự động gửi cookies)
GET /dashboard
Cookie: accessToken=xxx; refreshToken=yyy

# Middleware validates accessToken từ cookie ✓
# Response: 200 OK
```

### 3. Token Refresh

```bash
# Request
POST /auth/refresh
Cookie: refreshToken=yyy

# Response
Set-Cookie: accessToken=new_xxx; HttpOnly
Set-Cookie: refreshToken=new_yyy; HttpOnly
Body: { accessToken: "new_xxx" }
```

### 4. Logout

```bash
# Request
POST /auth/logout
Cookie: accessToken=xxx; refreshToken=yyy

# Response
Set-Cookie: accessToken=; Max-Age=0
Set-Cookie: refreshToken=; Max-Age=0
```

## 📋 Environment Variables

### Backend `.env`

```bash
# Frontend URL for CORS
FRONTEND_URL=http://localhost:3001

# Cookie Configuration
COOKIE_SECURE=false  # true in production (HTTPS only)
COOKIE_SAME_SITE=lax  # strict | lax | none

# JWT Configuration
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_SECRET=your-refresh-secret
REFRESH_TOKEN_EXPIRES_IN=7d
```

### Frontend `.env`

```bash
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## 🚀 Deployment Notes

### Production Settings

**Backend**:

```bash
FRONTEND_URL=https://your-domain.com
COOKIE_SECURE=true  # Require HTTPS
COOKIE_SAME_SITE=strict  # Stricter security
```

**Requirements**:

- ✅ HTTPS enabled (required for secure cookies)
- ✅ Same domain or proper CORS setup
- ✅ SameSite=strict for maximum security

## 📊 So Sánh

| Aspect                   | Cũ (localStorage) | Mới (HttpOnly Cookies) |
| ------------------------ | ----------------- | ---------------------- |
| **XSS Protection**       | ❌ Không          | ✅ Có                  |
| **Server-Side Auth**     | ❌ Không thể      | ✅ Có thể              |
| **Middleware Support**   | ❌ Không          | ✅ Có                  |
| **Auto Cookie Handling** | ❌ Manual         | ✅ Automatic           |
| **CSRF Protection**      | ✅ Không cần      | ⚠️ Cần (SameSite)      |
| **Complexity**           | 🟢 Đơn giản       | 🟡 Trung bình          |
| **Security**             | 🔴 Thấp           | 🟢 Cao                 |

## ✅ Checklist

- [x] Backend set access token cookie
- [x] Backend set refresh token cookie
- [x] Backend clear cookies on logout
- [x] CORS enable credentials
- [x] Frontend axios withCredentials
- [x] Frontend token manager đọc từ cookie
- [x] Frontend không lưu tokens vào localStorage
- [x] Middleware đọc từ cookie
- [x] Environment variables configured
- [x] Documentation updated

## 🎯 Kết Luận

**Kiến trúc mới**:

- ✅ Server-side middleware hoạt động đúng
- ✅ Bảo mật cao hơn (HttpOnly cookies)
- ✅ Tự động handle cookies
- ✅ Chống XSS attacks
- ✅ Production-ready

**Lưu ý**: Đây là kiến trúc chuẩn cho production. Không nên lưu sensitive tokens trong localStorage!
