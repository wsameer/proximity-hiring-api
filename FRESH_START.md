🚀 Fresh Installation (Docker Only)

Prerequisites

1. Docker Desktop installed
2. TablePlus (or any Postgres client)
3. Git

No Node.js, pnpm, or PostgreSQL needed locally!

---

🚀 Quick Start (TLDR)

git clone <repo>
cd proximity-hiring-api
cp .env.example .env
# Edit .env: set BETTER_AUTH_SECRET
docker-compose up -d
docker-compose exec api pnpm db:push
curl http://localhost:3000/

TablePlus: Connect to localhost:5432, user: postgres, pass: postgres, db: jobximity

---
Installation Steps

# 1. Clone repository
git clone <your-repo-url>
cd proximity-hiring-api

# 2. Create environment file
cp .env.example .env

# 3. Generate secure auth secret
# On macOS/Linux:
openssl rand -base64 32

# On Windows (PowerShell):
# [Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))

# 4. Edit .env and paste the secret
nano .env  # or use any editor
# Set BETTER_AUTH_SECRET=<paste_generated_secret>
# Set APP_URL=http://localhost:3001 (or your frontend URL)

# 5. Start all services (PostgreSQL + Redis + API)
docker-compose up -d

# 6. View logs to confirm startup
docker-compose logs -f api

# Wait for: "✅ Redis connected" and "Server is running on http://localhost:3000"

# 7. Run database migrations (first time only)
docker-compose exec api pnpm db:push

# 8. Verify services are running
docker-compose ps

---
📊 TablePlus Connection

Connection Details

Host:       localhost
Port:       5432
User:       postgres
Password:   postgres
Database:   jobximity

Steps in TablePlus

1. Open TablePlus
2. Click Create a new connection
3. Select PostgreSQL
4. Fill in:
- Name: Jobximity Local
- Host: localhost
- Port: 5432
- User: postgres
- Password: postgres
- Database: jobximity
5. Click Test (should succeed)
6. Click Connect

You'll see all 12 tables ready!

---

# View logs
docker-compose logs -f        # All services
docker-compose logs -f api    # Just API
docker-compose logs -f postgres
docker-compose logs -f redis

# Stop services (keeps data)
docker-compose down

# Stop and delete all data
docker-compose down -v

# Restart after code changes
docker-compose restart api

# Rebuild after dependency changes
docker-compose up --build

# Access PostgreSQL shell
docker-compose exec postgres psql -U postgres -d jobximity

# Access Redis CLI
docker-compose exec redis redis-cli

# Run migrations
docker-compose exec api pnpm db:push

# Generate new migrations
docker-compose exec api pnpm db:generate

# Open Drizzle Studio (in Docker)
docker-compose exec api pnpm db:studio
# Then visit: http://localhost:4983

---
📦 Project Structure (What's Inside)

proximity-hiring-api/
├── docker-compose.yml       # Docker orchestration
├── Dockerfile              # API container
├── init-db.sh             # PostGIS setup script
├── .env                   # Your secrets (not in git)
├── src/
│   ├── index.ts          # Main entry point
│   ├── db/
│   │   ├── schema.ts     # All 12 tables
│   │   └── migrations/   # SQL files
│   ├── routes/           # API endpoints
│   ├── services/         # Business logic
│   ├── validators/       # Zod schemas
│   ├── lib/              # Utilities (H3, avatar)
│   ├── config/           # Redis, env
│   └── middleware/       # Auth guards
└── PHASE1_COMPLETE.md    # API documentation

---
🔥 Hot Reload (Dev Mode)

The Docker setup has hot reload enabled! Changes to src/ files automatically restart the server.

1. Edit any file in src/
2. Save
3. Watch logs: docker-compose logs -f api
4. Server restarts automatically

---
🐛 Troubleshooting

Port already in use

# Find what's using the port
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Change port in .env
PORT=3001

Can't connect to database from TablePlus

# Check if PostgreSQL is running
docker-compose ps

# Check PostgreSQL logs
docker-compose logs postgres

# Restart PostgreSQL
docker-compose restart postgres

Migrations not applied

# Push schema directly (dev)
docker-compose exec api pnpm db:push

# Or generate + migrate
docker-compose exec api pnpm db:generate
docker-compose exec api pnpm db:migrate

Redis connection errors

# Check Redis status
docker-compose exec redis redis-cli ping
# Should return: PONG

# Restart Redis
docker-compose restart redis

---
📝 Environment Variables (.env)

# Server
PORT=3000
NODE_ENV=development

# Database (Docker internal)
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/jobximity

# Redis (Docker internal)
REDIS_URL=redis://redis:6379

# BetterAuth
BETTER_AUTH_SECRET=<paste_your_generated_secret>
BETTER_AUTH_URL=http://localhost:3000

# Frontend URL for CORS
APP_URL=http://localhost:3001

---
🎯 What's Working Now

✅ Phase 0: Foundation (Docker, schema, tools)✅ Phase 1: Auth & Profiles (signup, login, profile management)

Next: Phase 2 - Location & Presence

---

Done! 🎉