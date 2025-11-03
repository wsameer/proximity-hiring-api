# Hono + BetterAuth + Drizzle + PostgreSQL

A modern authentication API built with Hono, BetterAuth, Drizzle ORM, and PostgreSQL, fully containerized with Docker.

## 🚀 Features

- **Hono** - Fast, lightweight web framework
- **BetterAuth** - Secure email/password authentication
- **Drizzle ORM** - Type-safe database operations
- **PostgreSQL** - Reliable database with Docker volumes
- **Docker** - Fully containerized setup

## 📋 Prerequisites

- Docker & Docker Compose
- Node.js 20+ (for local development)

## 🛠️ Setup Instructions

### 1. Clone and Install

```bash
# Install dependencies (for local development)
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and update the values:

```bash
cp .env.example .env
```

**Important**: Change `BETTER_AUTH_SECRET` to a secure random string in production!

### 3. Run with Docker

```bash
# Build and start all services
docker-compose up --build

# Or run in detached mode
docker-compose up -d --build
```

This will:

- Start PostgreSQL on port 5432 with persistent volume
- Start the Hono API on port 3000
- Automatically create all necessary database tables

### 4. Initialize Database Tables

BetterAuth will automatically create the required tables on first request. You can trigger this by making any auth request or by accessing:

```bash
curl http://localhost:3000/api/auth/get-session
```

Alternatively, you can use Drizzle to push the schema:

```bash
# If running locally
npm run db:push

# If using Docker
docker-compose exec app npm run db:push
```

## 📡 API Endpoints

### Authentication

#### Sign Up

```bash
POST http://localhost:3000/api/auth/sign-up/email
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword123",
  "name": "John Doe"
}
```

#### Sign In

```bash
POST http://localhost:3000/api/auth/sign-in/email
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

Response includes a session token in cookies.

#### Sign Out

```bash
POST http://localhost:3000/api/auth/sign-out
Cookie: better-auth.session_token=<your-token>
```

#### Get Session

```bash
GET http://localhost:3000/api/auth/get-session
Cookie: better-auth.session_token=<your-token>
```

### Protected Routes

#### User Profile

```bash
GET http://localhost:3000/api/user/profile
Cookie: better-auth.session_token=<your-token>
```

#### Protected Example

```bash
GET http://localhost:3000/api/protected
Cookie: better-auth.session_token=<your-token>
```

### Health Check

```bash
GET http://localhost:3000/health
```

## 🗄️ Database Management

### View Database with Drizzle Studio

```bash
# Local development
npm run db:studio

# Opens at http://localhost:4983
```

### Generate Migrations

```bash
npm run db:generate
```

### Run Migrations

```bash
npm run db:migrate
```

## 🧪 Testing the API

### Using cURL

```bash
# Sign up
curl -X POST http://localhost:3000/api/auth/sign-up/email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123456!",
    "name": "Test User"
  }' \
  -c cookies.txt

# Sign in (saves session cookie)
curl -X POST http://localhost:3000/api/auth/sign-in/email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123456!"
  }' \
  -c cookies.txt

# Access protected route
curl http://localhost:3000/api/protected \
  -b cookies.txt

# Get user profile
curl http://localhost:3000/api/user/profile \
  -b cookies.txt
```

### Using Thunder Client / Postman

1. Create a POST request to `http://localhost:3000/api/auth/sign-up/email`
2. Set body to JSON with email, password, and name
3. Send request - cookies will be automatically saved
4. Make requests to protected routes - cookies will be sent automatically

## 🐳 Docker Commands

```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Stop and remove volumes (deletes database!)
docker-compose down -v

# Rebuild after code changes
docker-compose up --build

# Access database directly
docker-compose exec db psql -U postgres -d authdb
```

## 📂 Project Structure

```
.
├── src/
│   ├── db/
│   │   ├── db.ts          # Database connection
│   │   └── schema.ts      # Drizzle schema definitions
│   ├── auth.ts            # BetterAuth configuration
│   └── index.ts           # Hono app & routes
├── drizzle/               # Migration files (generated)
├── docker-compose.yml     # Docker services
├── Dockerfile            # App container
├── drizzle.config.ts     # Drizzle configuration
├── package.json
└── tsconfig.json
```

## 🔒 Security Notes

1. **Change the secret**: Update `BETTER_AUTH_SECRET` in `.env` to a secure random string
2. **Email verification**: Set `requireEmailVerification: true` in production
3. **HTTPS**: Use HTTPS in production, update `BETTER_AUTH_URL` accordingly
4. **Database password**: Change PostgreSQL password in production
5. **CORS**: Configure `trustedOrigins` in `auth.ts` for your frontend domains

## 🔧 Development Mode

For local development without Docker:

```bash
# Start PostgreSQL separately or use local installation
# Update DATABASE_URL in .env to point to localhost

# Install dependencies
npm install

# Run in development mode with hot reload
npm run dev
```

## 📊 Database Schema

BetterAuth automatically creates these tables:

- `user` - User accounts
- `session` - Active sessions
- `account` - OAuth accounts (for future use)
- `verification` - Email verification tokens

The schema is defined in `src/db/schema.ts` for type safety with Drizzle.

## 🚨 Troubleshooting

### Database connection errors

```bash
# Check if PostgreSQL is running
docker-compose ps

# View database logs
docker-compose logs db
```

### Port already in use

```bash
# Change ports in docker-compose.yml or stop conflicting services
```

### Tables not created

```bash
# Manually push schema
docker-compose exec app npm run db:push
```

## 📝 Next Steps

- Add email verification
- Implement OAuth providers (Google, GitHub, etc.)
- Add password reset functionality
- Implement rate limiting
- Add refresh token rotation
- Set up proper logging
- Add input validation with Zod

## 📚 Resources

- [Hono Documentation](https://hono.dev/)
- [BetterAuth Documentation](https://www.better-auth.com/)
- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

## 📄 License

MIT
