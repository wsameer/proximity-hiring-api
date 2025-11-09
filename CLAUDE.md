# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Jobximity** is a hyperlocal, privacy-first hiring platform that connects job seekers and job givers within a 2km radius. Built with Hono, BetterAuth, Drizzle ORM, PostgreSQL+PostGIS, Redis, and H3 geospatial indexing.

**Core Pillars:**
- **Hyperlocality**: 2km proximity-based matching
- **Privacy**: H3 zones hide exact locations, same-employer blocking
- **Urgency**: 7-day ephemeral chats force action
- **Real-time**: WebSocket for live match notifications

## Common Commands

### Development
```bash
# Start dev server with hot reload
pnpm dev

# Build TypeScript
pnpm build

# Start production
pnpm start
```

### Database Operations
```bash
# Generate migrations from schema
pnpm db:generate

# Apply migrations
pnpm db:migrate

# Push schema directly (dev only)
pnpm db:push

# Visual database browser (opens localhost:4983)
pnpm db:studio
```

### Docker Operations
```bash
# Start all services (PostgreSQL+PostGIS, Redis, API)
docker-compose up -d

# View logs
docker-compose logs -f api

# Rebuild after code changes
docker-compose up --build

# Stop services (keeps data)
docker-compose down

# Stop and remove volumes (deletes database!)
docker-compose down -v

# Access PostgreSQL directly
docker-compose exec postgres psql -U postgres -d jobximity

# Access Redis CLI
docker-compose exec redis redis-cli
```

## Project Structure

```
src/
├── config/          # Environment and service configs
│   ├── env.ts       # Environment variables
│   └── redis.ts     # Redis client
├── db/
│   ├── schema.ts    # Complete database schema
│   ├── migrations/  # SQL migration files
│   └── db.ts        # Database connection
├── lib/             # Shared utilities
│   ├── auth.ts      # BetterAuth configuration
│   ├── geospatial.ts # H3 privacy zones & distance calcs
│   └── avatar.ts    # Avatar URL generation
├── services/        # Business logic (Phase 1+)
├── validators/      # Zod validation schemas (Phase 1+)
├── middleware/
│   └── auth.ts      # Session & auth guards
├── routes/
│   ├── public.routes.ts
│   ├── auth.routes.ts
│   └── user.routes.ts
├── websocket/       # Real-time handlers (Phase 3+)
├── jobs/            # Background workers (Phase 5+)
├── types/
│   └── app.ts       # Hono context types
└── index.ts         # Main entry point
```

## Architecture Patterns

### 1. Complete Database Schema (Phase 0 - Ready)
All tables defined in `src/db/schema.ts` even if unused yet:

**User & Auth:**
- `user` - Profiles with seeker/giver type, employer, skills, online status
- `session`, `account`, `verification` - BetterAuth tables

**Location (Phase 2):**
- `user_location` - H3 cells + lat/lng + PostGIS geometry

**Listings (Phase 4):**
- `job_listing` - Listings and referrals (max 10 listings, 3 referrals)
- `listing_count` - Enforcement tracking

**Matching (Phase 3):**
- `match_request` - Pending/accepted/declined match requests

**Chat (Phase 5):**
- `chat_conversation` - 7-day expiring conversations
- `chat_message` - Individual messages

**Moderation (Phase 6):**
- `report`, `user_block` - Safety features

### 2. H3 Geospatial Privacy
**Library:** `h3-js` (Uber's hexagonal indexing)
**Resolution:** 8 (~175m edge for neighborhood-level privacy)

```typescript
import { latLngToH3Cell, getNeighboringCells } from './lib/geospatial.js';

// Convert user location to H3 cell
const h3Cell = latLngToH3Cell(lat, lng);

// Get nearby cells for 2km radius matching
const nearbyCells = getNeighboringCells(h3Cell, 3);
```

**PostGIS Integration:**
- Geometry column auto-synced via trigger (see `migrations/postgis-setup.sql`)
- Spatial queries use `ST_DWithin` for precise 2km filtering
- H3 cells used for quick pre-filtering, PostGIS for exact distance

### 3. Redis Usage
**Current:** Presence tracking, caching, job queues
**Client:** Native `redis` package (configured in `src/config/redis.ts`)

```typescript
import { redisClient } from './config/redis.js';

// Set online presence
await redisClient.set(`presence:${userId}`, JSON.stringify({
  h3Cell, lastSeen: Date.now()
}), { EX: 300 }); // 5min TTL
```

### 4. Authentication Flow (BetterAuth)
- Email-only for MVP (no social OAuth yet)
- Email verification required (`requireEmailVerification: true`)
- Session middleware runs on ALL routes, populates `c.get('user')`
- Use `requireAuth` middleware for protected routes

### 5. Avatar Generation
No image uploads in MVP. Avatars generated from names:
```typescript
import { generateAvatarUrl } from './lib/avatar.js';

const avatarUrl = generateAvatarUrl(user.name);
// https://ui-avatars.com/api/?name=John+Doe&size=256...
```

## Key Architectural Decisions

### Proximity Matching Strategy
1. User updates location → store H3 cell + lat/lng
2. Discovery query:
   - Get user's H3 cell + neighbors (3 rings)
   - Query users/listings in those cells
   - Filter by exact distance with PostGIS (`ST_DWithin`)
   - Apply same-employer block
   - Return matches

### Same-Employer Blocking
Users with identical `currentEmployer` string never see each other. Enforced at query level:
```sql
WHERE u.current_employer != $userEmployer
```

### Chat Expiry (7-Day)
- Background job (`jobs/chatArchival.job.ts` - Phase 5) runs daily
- Archives conversations where `expiresAt < NOW()`
- Archived chats retained 30 days for moderation
- Hard-deleted after 30 days

### Listing Limits Enforcement
- Givers: max 10 `job_listing`, max 3 `job_referral`
- Tracked in `listing_count` table
- Check before allowing new listing creation

## Development Phases

**Phase 0 (COMPLETE):** Foundation - schema, tools, Docker
**Phase 1 (NEXT):** Auth & profiles
**Phase 2:** Location & presence (online/offline toggle)
**Phase 3:** Discovery & matching (geospatial queries)
**Phase 4:** Listings (job posts & referrals)
**Phase 5:** Chat (REST-based, 7-day expiry)
**Phase 6:** Safety (reports, blocks)

## Development Workflows

### Adding Protected Routes
```typescript
// src/routes/example.routes.ts
import { requireAuth } from '../middleware/auth.js';

app.get('/api/protected', requireAuth, async (c) => {
  const user = c.get('user'); // Always present after requireAuth
  return c.json({ userId: user.id });
});
```

### Modifying Schema
1. Edit `src/db/schema.ts`
2. Generate migration: `pnpm db:generate`
3. Review SQL in `src/db/migrations/`
4. Apply: `pnpm db:migrate` (or `pnpm db:push` for dev)

### Adding Services (Business Logic)
1. Create file in `src/services/`
2. Import from routes, not in routes
3. Services handle queries, validation, business rules

### Background Jobs (Phase 5+)
Use BullMQ (already installed):
```typescript
import { Queue } from 'bullmq';
const chatQueue = new Queue('chat-archival', {
  connection: redisClient
});
```

## Environment Variables

Required (see `.env.example`):
```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/jobximity
REDIS_URL=redis://localhost:6379
BETTER_AUTH_SECRET=<32+ char random string>
BETTER_AUTH_URL=http://localhost:3000
PORT=3000
NODE_ENV=development
```

## Important Notes

### PostGIS Setup
- Extension enabled via `init-db.sh` on container start
- Geometry column added via `migrations/postgis-setup.sql`
- Trigger auto-updates geometry from lat/lng

### pnpm vs npm
Project uses **pnpm**. Dockerfile uses pnpm. Use `pnpm` commands consistently.

### ES Modules
- `"type": "module"` in package.json
- All imports need `.js` extension: `import { x } from './file.js'`

### CORS
Currently allows `localhost:3001` only. Update `trustedOrigins` in BetterAuth and CORS middleware when adding frontend.

### Monorepo
This is API-only. React Native app in separate repo.

### Railway Deployment
Project configured for Railway. Environment variables set via Railway dashboard. PostGIS extension auto-enabled.

## Common Pitfalls

1. **Circular imports**: Keep schema in single file (`schema.ts`), not split
2. **H3 resolution**: Using 8 (175m). Don't change without re-testing 2km radius math
3. **Same-employer blocking**: Case-sensitive string match. Users must enter exactly
4. **Listing limits**: Enforce BEFORE creating listing, not after
5. **Chat expiry**: Background job must run or chats never archive
6. **Redis connection**: Must call `connectRedis()` on startup (done in `index.ts`)

## Testing Strategy (Future)

- Unit tests: Services, utilities (geospatial, avatar)
- Integration tests: Routes with test database
- E2E tests: Full flows (signup → match → chat)
- Load tests: Geospatial queries at scale

## Package Manager

This project uses **pnpm**. Railway supports pnpm. All commands use `pnpm`.
