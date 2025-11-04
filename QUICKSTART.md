# Quick Start Guide

## 🚀 Get Started in 3 Steps

### Step 1: Setup Environment

```bash
# Copy environment file
cp .env.example .env

# IMPORTANT: Edit .env and change BETTER_AUTH_SECRET to a secure random string!
# You can generate one with: openssl rand -base64 32
```

### Step 2: Start Services

```bash
# Build and start everything
docker-compose up --build

# Wait for "Server is running" message
```

### Step 3: Test It

```bash
# Make the script executable
chmod +x test-api.sh

# Run the test script
./test-api.sh
```

## 📱 Quick Test with cURL

### Create Account

```bash
curl -X POST http://localhost:3000/api/auth/sign-up/email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "you@example.com",
    "password": "YourSecurePass123!",
    "name": "Your Name"
  }' \
  -c cookies.txt -v
```

### Login

```bash
curl -X POST http://localhost:3000/api/auth/sign-in/email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "you@example.com",
    "password": "YourSecurePass123!"
  }' \
  -b cookies.txt -c cookies.txt -v
```

### Access Protected Route

```bash
curl http://localhost:3000/api/protected -b cookies.txt
```

## 🔍 What's Running?

- **API**: http://localhost:3000
- **PostgreSQL**: localhost:5432
- **Database Name**: authdb
- **User/Password**: postgres/postgres

## 🛠️ Development Mode

For development with hot reload:

```bash
# Use the development compose file
docker-compose -f docker-compose.dev.yml up --build

# Your code changes will automatically reload!
```

## 📊 View Database

### Using psql

```bash
docker-compose exec db psql -U postgres -d authdb

# List tables
\dt

# Query users
SELECT * FROM "user";

# Exit
\q
```

### Using Drizzle Studio

```bash
# Install dependencies locally first
npm install

# Start Drizzle Studio
npm run db:studio

# Opens at http://localhost:4983
```

## 🗂️ Key Files

- `src/index.ts` - Main Hono app
- `src/auth.ts` - BetterAuth config
- `src/db/schema.ts` - Database schema
- `docker-compose.yml` - Production setup
- `docker-compose.dev.yml` - Development setup

## ⚠️ Important Notes

1. **Change BETTER_AUTH_SECRET** in production!
2. Session cookies are **httpOnly** and **secure** (in production)
3. BetterAuth creates tables automatically on first request
4. Data persists in Docker volumes

## 🐛 Troubleshooting

### Can't connect to database

```bash
# Check if containers are running
docker-compose ps

# Check logs
docker-compose logs db
```

### Port already in use

```bash
# Stop existing services
docker-compose down

# Or change port in docker-compose.yml
```

### Want to reset database

```bash
# WARNING: This deletes all data!
docker-compose down -v
docker-compose up --build
```

## 📚 Next Steps

1. Try the API with Postman or Thunder Client
2. Add more routes in `src/index.ts`
3. Customize the user schema in `src/db/schema.ts`
4. Enable email verification in `src/auth.ts`
5. Add OAuth providers (Google, GitHub, etc.)

## 🎯 Common Tasks

### Add a new protected route

Edit `src/index.ts`:

```typescript
app.get("/api/my-route", async (c) => {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  });

  if (!session) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  return c.json({ message: "Success!", user: session.user });
});
```

### Access current user in any route

```typescript
const session = await auth.api.getSession({
  headers: c.req.raw.headers,
});

if (session) {
  const userId = session.user.id;
  const userEmail = session.user.email;
  // Use user data...
}
```

### Query database with Drizzle

```typescript
import { db } from "./db/db";
import { user } from "./db/schema";
import { eq } from "drizzle-orm";

// Get all users
const users = await db.select().from(user);

// Get user by email
const foundUser = await db
  .select()
  .from(user)
  .where(eq(user.email, "test@example.com"));
```

Happy coding! 🎉
