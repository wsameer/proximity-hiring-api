# Architecture Overview

## System Architecture

```
┌───────────────────────────────────────────────────────────┐
│                         Client                            │
│                   (Browser/API Client)                    │
└──────────────────────┬────────────────────────────────────┘
                       │ HTTP/HTTPS
                       │
┌──────────────────────▼───────────────────────────────────┐
│                    Hono Web Server                       │
│                   (Port 3000)                            │
│  ┌─────────────────────────────────────────────────────┐ │
│  │  Routes                                             │ │
│  │  • /api/auth/** → BetterAuth Handler                │ │
│  │  • /api/protected → Protected Routes                │ │
│  │  • /api/user/profile → User Info                    │ │
│  └─────────────────────────────────────────────────────┘ │
└──────────────────────┬───────────────────────────────────┘
                       │
                       │ BetterAuth API
                       │
┌──────────────────────▼────────────────────────────────────┐
│                    BetterAuth                             │
│  ┌──────────────────────────────────────────────────────┐ │
│  │  • Email/Password Authentication                     │ │
│  │  • Session Management                                │ │
│  │  • Password Hashing (bcrypt)                         │ │
│  │  • Cookie-based Sessions                             │ │
│  └──────────────────────────────────────────────────────┘ │
└──────────────────────┬────────────────────────────────────┘
                       │
                       │ Drizzle Adapter
                       │
┌──────────────────────▼────────────────────────────────────┐
│                    Drizzle ORM                            │
│  ┌──────────────────────────────────────────────────────┐ │
│  │  • Type-safe Database Operations                     │ │
│  │  • Schema Management                                 │ │
│  │  • Migration Generation                              │ │
│  │  • Query Builder                                     │ │
│  └──────────────────────────────────────────────────────┘ │
└──────────────────────┬────────────────────────────────────┘
                       │
                       │ postgres.js Driver
                       │
┌──────────────────────▼────────────────────────────────────┐
│                    PostgreSQL Database                    │
│                   (Port 5432)                             │
│  ┌──────────────────────────────────────────────────────┐ │
│  │  Tables:                                             │ │
│  │  • user           → User accounts                    │ │
│  │  • session        → Active sessions                  │ │
│  │  • account        → OAuth accounts                   │ │
│  │  • verification   → Email verification               │ │
│  └──────────────────────────────────────────────────────┘ │
│  ┌──────────────────────────────────────────────────────┐ │
│  │  Volume: postgres_data (Persistent Storage)          │ │
│  └──────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────┘
```

## Docker Container Architecture

```
┌────────────────────────────────────────────────────────────┐
│                     Docker Host                            │
│                                                            │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Container: hono_app                                │   │
│  │  ┌───────────────────────────────────────────────┐  │   │
│  │  │  Node.js 20 Alpine                            │  │   │
│  │  │  • Hono + BetterAuth + Drizzle                │  │   │
│  │  │  • Exposed Port: 3000                         │  │   │
│  │  └───────────────────────────────────────────────┘  │   │
│  │                         │                           │   │
│  │                         │ Network: default          │   │
│  │                         ▼                           │   │
│  │  ┌───────────────────────────────────────────────┐  │   │
│  │  │  Volume Mounts:                               │  │   │
│  │  │  • ./src → /app/src (for hot reload)          │  │   │
│  │  │  • ./drizzle → /app/drizzle (migrations)      │  │   │
│  │  └───────────────────────────────────────────────┘  │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                            │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Container: auth_postgres                           │   │
│  │  ┌───────────────────────────────────────────────┐  │   │
│  │  │  PostgreSQL 16 Alpine                         │  │   │
│  │  │  • Database: authdb                           │  │   │
│  │  │  • Exposed Port: 5432                         │  │   │
│  │  └───────────────────────────────────────────────┘  │   │
│  │                         │                           │   │
│  │                         ▼                           │   │
│  │  ┌──────────────────────────────────────────────┐   │   │
│  │  │  Volume: postgres_data                       │   │   │
│  │  │  Path: /var/lib/postgresql/data              │   │   │
│  │  │  Type: Named Volume (Persistent)             │   │   │
│  │  └──────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────┘
```

## Authentication Flow

### Sign Up Flow
```
1. Client → POST /api/auth/sign-up/email
   Body: { email, password, name }
   
2. Hono → BetterAuth
   
3. BetterAuth:
   a. Hash password with bcrypt
   b. Validate email uniqueness
   c. Create user record via Drizzle
   
4. Drizzle → PostgreSQL
   INSERT INTO user (email, password, name)
   
5. BetterAuth:
   a. Create session
   b. Generate session token
   c. Set httpOnly cookie
   
6. Response → Client
   Set-Cookie: better-auth.session_token=xxx; HttpOnly; Secure
   Body: { user, session }
```

### Sign In Flow
```
1. Client → POST /api/auth/sign-in/email
   Body: { email, password }
   
2. Hono → BetterAuth
   
3. BetterAuth:
   a. Query user by email via Drizzle
   b. Verify password hash
   
4. Drizzle → PostgreSQL
   SELECT * FROM user WHERE email = ?
   
5. BetterAuth:
   a. Create new session
   b. Generate session token
   c. Set httpOnly cookie
   
6. PostgreSQL ← INSERT INTO session
   
7. Response → Client
   Set-Cookie: better-auth.session_token=xxx
   Body: { user, session }
```

### Protected Route Access
```
1. Client → GET /api/protected
   Cookie: better-auth.session_token=xxx
   
2. Hono:
   a. Extract session token from cookie
   b. Call auth.api.getSession()
   
3. BetterAuth:
   a. Validate token
   b. Check expiration
   
4. Drizzle → PostgreSQL
   SELECT * FROM session WHERE id = ? AND expiresAt > NOW()
   JOIN user ON session.userId = user.id
   
5. Response:
   If valid: { user, session }
   If invalid: null
   
6. Hono:
   If session exists: Return protected data
   If no session: Return 401 Unauthorized
```

## Security Features

### Password Security
- **Hashing**: Bcrypt with automatic salt generation
- **Rounds**: 10 (configurable)
- **No plain text**: Passwords never stored in plain text

### Session Security
- **HttpOnly Cookies**: Prevents XSS attacks
- **Secure Flag**: HTTPS-only in production
- **SameSite**: CSRF protection
- **Expiration**: Configurable session lifetime
- **Token Rotation**: New tokens on each auth

### API Security
- **CORS**: Configured trusted origins
- **Rate Limiting**: Can be added with middleware
- **Input Validation**: Type-safe with TypeScript
- **SQL Injection**: Protected by Drizzle ORM

## Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Web Framework | Hono | Fast, lightweight HTTP server |
| Auth System | BetterAuth | Authentication & session management |
| ORM | Drizzle | Type-safe database queries |
| Database | PostgreSQL | Relational data storage |
| Driver | postgres.js | PostgreSQL client |
| Runtime | Node.js 20 | JavaScript runtime |
| Language | TypeScript | Type safety |
| Container | Docker | Containerization |
| Orchestration | Docker Compose | Multi-container management |

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| DATABASE_URL | PostgreSQL connection string | postgresql://... |
| BETTER_AUTH_SECRET | Secret key for JWT/sessions | Change in production! |
| BETTER_AUTH_URL | Base URL of the API | http://localhost:3000 |
| PORT | Server port | 3000 |
| NODE_ENV | Environment mode | development |

## Data Flow

### Request Lifecycle
```
1. HTTP Request arrives at Hono
2. Hono routes to appropriate handler
3. Handler calls BetterAuth API (if auth needed)
4. BetterAuth validates session/credentials
5. BetterAuth uses Drizzle adapter
6. Drizzle executes SQL query
7. PostgreSQL returns data
8. Data flows back through layers
9. JSON response sent to client
```

### Session Lifecycle
```
1. User signs in/up
2. BetterAuth creates session record
3. Session token stored in httpOnly cookie
4. Each request includes cookie automatically
5. BetterAuth validates token on protected routes
6. Session expires after configured time
7. User must sign in again after expiration
```