# Project Structure

```
hono-betterauth-project/
│
├── src/                          # Source code
│   ├── db/
│   │   ├── db.ts                # Database connection & Drizzle setup
│   │   └── schema.ts            # Database schema definitions
│   ├── auth.ts                  # BetterAuth configuration
│   └── index.ts                 # Main Hono application & routes
│
├── drizzle/                     # Generated migration files (auto-created)
│   └── *.sql                    # Migration SQL files
│
├── docker-compose.yml           # Production Docker setup
├── docker-compose.dev.yml       # Development Docker setup with hot reload
├── Dockerfile                   # Production container image
├── Dockerfile.dev              # Development container image
│
├── package.json                 # Dependencies & scripts
├── tsconfig.json               # TypeScript configuration
├── drizzle.config.ts           # Drizzle ORM configuration
│
├── .env                        # Environment variables (not in git)
├── .env.example                # Environment template
├── .dockerignore               # Docker ignore rules
├── .gitignore                  # Git ignore rules
│
├── test-api.sh                 # API testing script
│
├── README.md                   # Full documentation
├── QUICKSTART.md               # Quick start guide
└── ARCHITECTURE.md             # Architecture overview
```

## Key Files Explained

### Source Code (`src/`)

**`src/index.ts`** - Main Application

- Hono server setup
- Route definitions
- BetterAuth integration
- Protected route examples

**`src/auth.ts`** - Authentication Config

- BetterAuth initialization
- Drizzle adapter setup
- Email/password configuration
- Session settings

**`src/db/db.ts`** - Database Connection

- PostgreSQL connection via postgres.js
- Drizzle ORM initialization
- Migration client setup

**`src/db/schema.ts`** - Database Schema

- User table definition
- Session table definition
- Account table definition
- Verification table definition

### Configuration Files

**`package.json`**

```json
{
  "scripts": {
    "dev": "tsx watch src/index.ts", // Hot reload dev
    "build": "tsc", // Compile TypeScript
    "start": "node dist/index.js", // Run production
    "db:generate": "drizzle-kit generate", // Generate migrations
    "db:push": "drizzle-kit push", // Push schema to DB
    "db:studio": "drizzle-kit studio" // Visual DB browser
  }
}
```

**`drizzle.config.ts`**

- Schema file location
- Migration output directory
- Database credentials

**`docker-compose.yml`**

- PostgreSQL service (port 5432)
- Hono app service (port 3000)
- Named volume for data persistence
- Health checks
- Service dependencies

### Docker Files

**`Dockerfile`** - Production Build

1. Copy package files
2. Install dependencies
3. Copy source code
4. Build TypeScript
5. Run compiled JavaScript

**`Dockerfile.dev`** - Development Build

1. Copy package files
2. Install dependencies
3. Copy source code
4. Run with tsx watch (hot reload)

### Environment Files

**`.env`** - Your Configuration

```bash
DATABASE_URL=postgresql://postgres:postgres@db:5432/authdb
BETTER_AUTH_SECRET=your-secret-key
BETTER_AUTH_URL=http://localhost:3000
PORT=3000
NODE_ENV=development
```

**`.env.example`** - Template for others

### Testing & Documentation

**`test-api.sh`** - Automated Testing

- Health check
- Sign up
- Sign in
- Protected routes
- Session validation

**`README.md`** - Complete Documentation

- Setup instructions
- API endpoints
- Docker commands
- Troubleshooting

**`QUICKSTART.md`** - Fast Start Guide

- 3-step setup
- Quick test commands
- Common tasks

**`ARCHITECTURE.md`** - System Design

- Architecture diagrams
- Authentication flows
- Security features
- Scaling considerations

## File Sizes

| File               | Purpose       | Lines |
| ------------------ | ------------- | ----- |
| src/index.ts       | Main app      | ~70   |
| src/auth.ts        | Auth config   | ~20   |
| src/db/db.ts       | DB connection | ~10   |
| src/db/schema.ts   | Schema        | ~60   |
| docker-compose.yml | Docker setup  | ~40   |
| package.json       | Dependencies  | ~30   |

Total source code: ~200 lines

## Generated Files (After First Run)

```
hono-betterauth-project/
├── node_modules/              # Dependencies (npm install)
├── dist/                      # Compiled JavaScript (npm run build)
├── drizzle/*.sql             # Migration files (npm run db:generate)
└── docker volumes            # Persistent data
    └── postgres_data/        # Database files
```

## Not Included in Git

The `.gitignore` excludes:

- `node_modules/` - Dependencies
- `dist/` - Compiled code
- `.env` - Secrets
- `*.log` - Log files
- `.DS_Store` - Mac files

## Quick File Reference

Need to...

- **Add a route?** → Edit `src/index.ts`
- **Change auth settings?** → Edit `src/auth.ts`
- **Modify database?** → Edit `src/db/schema.ts`
- **Update dependencies?** → Edit `package.json`
- **Configure Docker?** → Edit `docker-compose.yml`
- **Set environment?** → Edit `.env`

## Typical Development Flow

1. **Start**: `docker-compose up` or `npm run dev`
2. **Code**: Edit files in `src/`
3. **Test**: Run `./test-api.sh` or use Postman
4. **Schema changes**: Edit `src/db/schema.ts`, run `npm run db:push`
5. **Deploy**: `docker-compose up --build`

## Volume Persistence

Docker volumes ensure your data survives container restarts:

```
postgres_data/
├── base/                     # Database files
├── global/                   # Global tables
├── pg_wal/                   # Write-ahead logs
└── ...                       # Other PostgreSQL files
```

To remove volumes (deletes all data):

```bash
docker-compose down -v
```

To keep volumes (preserves data):

```bash
docker-compose down
```
