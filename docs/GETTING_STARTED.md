# 🚀 Complete Hono + BetterAuth + Drizzle + PostgreSQL Setup

## What You've Got

A production-ready authentication API with:
- ✅ **Hono** - Lightning-fast web framework
- ✅ **BetterAuth** - Secure email/password authentication
- ✅ **Drizzle ORM** - Type-safe database operations
- ✅ **PostgreSQL** - Rock-solid database
- ✅ **Docker** - Fully containerized with persistent volumes
- ✅ **TypeScript** - Full type safety

## 📦 Files Created

### Core Application (4 files)
1. `src/index.ts` - Hono server with routes
2. `src/auth.ts` - BetterAuth configuration
3. `src/db/db.ts` - Database connection
4. `src/db/schema.ts` - Database schema

### Configuration (7 files)
5. `package.json` - Dependencies
6. `tsconfig.json` - TypeScript config
7. `drizzle.config.ts` - Drizzle config
8. `.env` - Environment variables
9. `.env.example` - Environment template
10. `.dockerignore` - Docker ignore
11. `.gitignore` - Git ignore

### Docker (4 files)
12. `docker-compose.yml` - Production setup
13. `docker-compose.dev.yml` - Development setup
14. `Dockerfile` - Production image
15. `Dockerfile.dev` - Development image

### Documentation (4 files)
16. `README.md` - Complete guide
17. `QUICKSTART.md` - Fast start
18. `ARCHITECTURE.md` - System design
19. `PROJECT_STRUCTURE.md` - File layout

### Testing (1 file)
20. `test-api.sh` - API test script

## 🎯 Start in 3 Steps

### Step 1: Setup (30 seconds)
```bash
# 1. Extract the archive
tar -xzf hono-betterauth-project.tar.gz
cd hono-betterauth-project

# 2. Review .env file (already configured for Docker)
cat .env

# IMPORTANT: For production, change BETTER_AUTH_SECRET!
# Generate a secure secret:
# openssl rand -base64 32
```

### Step 2: Start (1 minute)
```bash
# Start everything with Docker
docker-compose up --build

# Wait for these messages:
# ✓ PostgreSQL ready
# ✓ Server is running on http://localhost:3000
```

### Step 3: Test (30 seconds)
```bash
# In a new terminal, run the test script
./test-api.sh

# Or test manually:
curl -X POST http://localhost:3000/api/auth/sign-up/email \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!","name":"Test User"}' \
  -c cookies.txt -v
```

## 📡 Your API Endpoints

**Authentication**
- `POST /api/auth/sign-up/email` - Create account
- `POST /api/auth/sign-in/email` - Login
- `POST /api/auth/sign-out` - Logout
- `GET /api/auth/get-session` - Get current session

**Protected Routes**
- `GET /api/protected` - Example protected route
- `GET /api/user/profile` - User profile

**Public**
- `GET /` - API info
- `GET /health` - Health check

## 🧪 Quick Test Examples

### Create Account
```bash
curl -X POST http://localhost:3000/api/auth/sign-up/email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "you@example.com",
    "password": "SecurePass123!",
    "name": "Your Name"
  }' \
  -c cookies.txt
```

### Login
```bash
curl -X POST http://localhost:3000/api/auth/sign-in/email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "you@example.com",
    "password": "SecurePass123!"
  }' \
  -b cookies.txt -c cookies.txt
```

### Access Protected Route
```bash
curl http://localhost:3000/api/protected -b cookies.txt
```

## 🔍 What's Running

After `docker-compose up`:
- **API Server**: http://localhost:3000
- **PostgreSQL**: localhost:5432
- **Database Name**: authdb
- **DB User/Pass**: postgres/postgres

## 📊 View Your Database

### Option 1: Drizzle Studio (Visual)
```bash
# Install dependencies locally
npm install

# Start Drizzle Studio
npm run db:studio

# Opens at http://localhost:4983
```

### Option 2: PostgreSQL CLI
```bash
# Connect to database
docker-compose exec db psql -U postgres -d authdb

# View tables
\dt

# Query users
SELECT * FROM "user";

# Exit
\q
```

## 🛠️ Common Commands

### Docker Operations
```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services (keeps data)
docker-compose down

# Stop and delete data
docker-compose down -v

# Rebuild after changes
docker-compose up --build
```

### Development
```bash
# Development mode with hot reload
docker-compose -f docker-compose.dev.yml up

# Run locally (needs local PostgreSQL)
npm install
npm run dev
```

### Database
```bash
# Push schema to database
npm run db:push

# Generate migrations
npm run db:generate

# Run migrations
npm run db:migrate
```

## 🎨 Customize Your API

### Add a Protected Route

Edit `src/index.ts`:
```typescript
app.get("/api/my-route", async (c) => {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  });
  
  if (!session) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  
  return c.json({ 
    message: "Success!",
    userId: session.user.id 
  });
});
```

Restart: `docker-compose restart app`

### Modify Database Schema

Edit `src/db/schema.ts`:
```typescript
export const user = pgTable("user", {
  // Add new field
  phoneNumber: text("phoneNumber"),
  // ... existing fields
});
```

Push changes: `npm run db:push`

### Change Authentication Settings

Edit `src/auth.ts`:
```typescript
export const auth = betterAuth({
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true, // Enable email verification
    minPasswordLength: 12,           // Stronger passwords
  },
  // ... rest of config
});
```

## 🔒 Security Checklist

Before deploying to production:

- [ ] Change `BETTER_AUTH_SECRET` to a secure random string
- [ ] Update `BETTER_AUTH_URL` to your production domain
- [ ] Enable HTTPS (update docker-compose for SSL certificates)
- [ ] Change PostgreSQL password
- [ ] Enable email verification
- [ ] Configure CORS for your frontend domain
- [ ] Add rate limiting middleware
- [ ] Set up monitoring and logging
- [ ] Enable database backups
- [ ] Review and restrict CORS origins

## 🐛 Troubleshooting

### "Port 3000 already in use"
```bash
# Check what's using the port
lsof -i :3000

# Stop the process or change port in docker-compose.yml
```

### "Cannot connect to database"
```bash
# Check PostgreSQL is running
docker-compose ps

# View database logs
docker-compose logs db

# Restart database
docker-compose restart db
```

### "Tables not found"
```bash
# Tables are auto-created, but you can manually push
docker-compose exec app npm run db:push
```

### Want to reset everything
```bash
# WARNING: Deletes all data!
docker-compose down -v
docker-compose up --build
```

## 📚 Documentation Files

Read these for more details:
- **README.md** - Complete documentation with all features
- **QUICKSTART.md** - Fast 3-step guide
- **ARCHITECTURE.md** - System design & flows
- **PROJECT_STRUCTURE.md** - File layout explanation

## 🚀 Next Steps

1. **Test the API** - Use Postman, Thunder Client, or curl
2. **Add your routes** - Extend `src/index.ts`
3. **Customize auth** - Update `src/auth.ts`
4. **Add features**:
   - OAuth (Google, GitHub)
   - Email verification
   - Password reset
   - User roles/permissions
   - Rate limiting
   - API documentation (Swagger)

## 💡 Pro Tips

1. **Development Mode**: Use `docker-compose.dev.yml` for hot reload
2. **Type Safety**: VSCode will give you autocomplete for database queries
3. **Session Cookies**: Automatically handled by BetterAuth
4. **Database Persistence**: Data survives container restarts
5. **Logs**: Always check logs with `docker-compose logs -f`

## 🎓 Learning Resources

- [Hono Docs](https://hono.dev)
- [BetterAuth Docs](https://www.better-auth.com)
- [Drizzle Docs](https://orm.drizzle.team)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)

## 📞 Need Help?

Check these in order:
1. Error logs: `docker-compose logs -f`
2. README.md troubleshooting section
3. Test script: `./test-api.sh`
4. Database state: `docker-compose exec db psql -U postgres -d authdb`

## ✅ What's Working

- ✅ Email/password authentication
- ✅ Secure session management
- ✅ Type-safe database operations
- ✅ Persistent data storage
- ✅ Protected routes
- ✅ Docker containerization
- ✅ Hot reload in dev mode
- ✅ Automated testing script

## 🎉 You're Ready!

You now have a production-ready authentication API. Start building your application!

```bash
# Start coding
docker-compose up -d
code src/index.ts

# Happy coding! 🚀
```
