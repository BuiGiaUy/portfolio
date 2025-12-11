# Authentication System Documentation

Complete NestJS authentication system with JWT tokens, refresh token rotation, RBAC, and HttpOnly cookies.

## Features

- ✅ JWT-based authentication (access + refresh tokens)
- ✅ Refresh token rotation for enhanced security
- ✅ HttpOnly Secure cookies for refresh tokens
- ✅ Role-Based Access Control (RBAC): OWNER & VIEWER
- ✅ Password hashing with bcrypt
- ✅ Clean Architecture implementation
- ✅ Database seeding for admin users

## Architecture

This auth system follows Clean Architecture principles:

```
Domain Layer (Innermost)
├── Role enum (OWNER, VIEWER)
├── User entity (with role, refreshTokenHash, active)
└── IUserRepository interface

Application Layer
├── DTOs (LoginDto, AuthResponseDto)
└── Use Cases
    ├── LoginUseCase
    ├── RefreshTokenUseCase
    ├── LogoutUseCase
    └── GetMeUseCase

Infrastructure Layer
├── PrismaUserRepository (implements IUserRepository)
├── JwtStrategy (validates access tokens)
├── Guards (JwtAuthGuard, RolesGuard)
└── Decorators (@Roles, @CurrentUser)

Interface Layer
├── AuthController (login, refresh, logout, me)
└── AdminController (sample RBAC routes)
```

## User Roles & Permissions

### OWNER

- Full CRUD access to all resources
- Can perform GET, POST, PATCH, DELETE operations

### VIEWER

- Read-only access
- Can only perform GET requests
- Attempting POST/PATCH/DELETE will result in 403 Forbidden

## API Endpoints

### Authentication

#### POST /auth/login

Login with email and password.

**Request Body:**

```json
{
  "email": "admin@portfolio.com",
  "password": "Admin@123456"
}
```

**Response:**

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "admin@portfolio.com",
    "role": "OWNER"
  }
}
```

**Cookies Set:**

- `refreshToken` (HttpOnly, Secure, 7 days)

---

#### POST /auth/refresh

Refresh access token using refresh token cookie.

**Headers:**

- Cookie: `refreshToken=...`

**Response:**

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "admin@portfolio.com",
    "role": "OWNER"
  }
}
```

**Note:** Old refresh token is invalidated, new one is set in cookie.

---

#### POST /auth/logout

Logout and clear refresh token.

**Headers:**

- Authorization: `Bearer <access_token>`

**Response:**

```json
{
  "message": "Logged out successfully"
}
```

---

#### GET /auth/me

Get current authenticated user.

**Headers:**

- Authorization: `Bearer <access_token>`

**Response:**

```json
{
  "id": "uuid",
  "email": "admin@portfolio.com",
  "role": "OWNER",
  "active": true,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### Admin Routes (RBAC Examples)

#### GET /admin/projects

List projects (OWNER + VIEWER allowed).

**Headers:**

- Authorization: `Bearer <access_token>`

---

#### POST /admin/projects

Create project (OWNER only).

**Headers:**

- Authorization: `Bearer <access_token>`

---

#### PATCH /admin/projects/:id

Update project (OWNER only).

**Headers:**

- Authorization: `Bearer <access_token>`

---

#### DELETE /admin/projects/:id

Delete project (OWNER only).

**Headers:**

- Authorization: `Bearer <access_token>`

## Environment Variables

Add these to your `.env` file:

```bash
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production-minimum-32-characters
REFRESH_TOKEN_SECRET=your-super-secret-refresh-token-key-change-in-production-minimum-32-characters
ACCESS_TOKEN_EXPIRATION=15m
REFRESH_TOKEN_EXPIRATION=7d

# Admin Credentials (for seeding)
ADMIN_EMAIL=admin@portfolio.com
ADMIN_PASSWORD=Admin@123456

# Cookie Configuration
COOKIE_SECURE=false  # Set to true in production with HTTPS
COOKIE_SAME_SITE=lax  # Options: strict, lax, none
```

## Database Schema Changes

The User model has been updated with auth fields:

```prisma
enum Role {
  OWNER
  VIEWER
}

model User {
  id               String    @id @default(uuid())
  email            String    @unique
  passwordHash     String
  role             Role      @default(VIEWER)
  refreshTokenHash String?
  active           Boolean   @default(true)
  projects         Project[]
  comments         Comment[]
  createdAt        DateTime  @default(now())
  updatedAt        DateTime  @updatedAt
}
```

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Run Database Migration

```bash
npm run prisma:generate
npm run prisma:migrate
```

### 3. Seed Database

```bash
npm run prisma:seed
```

This will create:

- **OWNER user**: Email from `ADMIN_EMAIL` env variable
- **VIEWER user**: `viewer@example.com` / `viewer123`

### 4. Start Application

```bash
npm run start:dev
```

## Testing with cURL

### 1. Login as OWNER

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@portfolio.com","password":"Admin@123456"}' \
  -c cookies.txt
```

### 2. Access Protected Route

```bash
curl -X GET http://localhost:3000/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 3. Refresh Token

```bash
curl -X POST http://localhost:3000/auth/refresh \
  -b cookies.txt \
  -c cookies.txt
```

### 4. Test RBAC (OWNER can POST)

```bash
curl -X POST http://localhost:3000/admin/projects \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 5. Test RBAC (VIEWER cannot POST)

```bash
# First login as VIEWER
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"viewer@example.com","password":"viewer123"}' \
  -c viewer_cookies.txt

# Try to POST (should fail with 403)
curl -X POST http://localhost:3000/admin/projects \
  -H "Authorization: Bearer VIEWER_ACCESS_TOKEN"
```

### 6. Logout

```bash
curl -X POST http://localhost:3000/auth/logout \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -b cookies.txt
```

## Security Considerations

### Refresh Token Rotation

- Each refresh generates a new token pair
- Old refresh token is immediately invalidated
- Prevents token replay attacks

### HttpOnly Cookies

- Refresh tokens stored in HttpOnly cookies
- Not accessible via JavaScript
- Protects against XSS attacks

### Password Hashing

- Passwords hashed with bcrypt (10 salt rounds)
- Never stored in plain text

### Token Expiration

- Access tokens: Short-lived (15 minutes default)
- Refresh tokens: Long-lived (7 days default)
- Minimizes impact of token compromise

### Role-Based Access Control

- VIEWER role restricted to GET requests only
- Enforced at guard level
- Prevents unauthorized modifications

## Troubleshooting

### "Invalid credentials" on login

- Check email and password match seeded users
- Verify database was seeded successfully
- Check `ADMIN_EMAIL` and `ADMIN_PASSWORD` env variables

### "Invalid refresh token"

- Refresh token may have expired
- Token rotation may have invalidated it
- Try logging in again

### 403 Forbidden on admin routes

- Verify user has correct role (OWNER for write operations)
- Check access token is valid and not expired
- VIEWER users can only perform GET requests

### Lint errors about missing modules

- Run `npm install` to install all dependencies
- Run `npm run prisma:generate` to generate Prisma client
- Restart your IDE/editor

## Next Steps

- Implement password reset functionality
- Add email verification
- Implement 2FA (Two-Factor Authentication)
- Add rate limiting for auth endpoints
- Implement account lockout after failed attempts
- Add audit logging for auth events
