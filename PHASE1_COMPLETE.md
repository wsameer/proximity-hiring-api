# Phase 1 Complete: Auth & Profiles ✅

## What's Ready

### Profile Management Endpoints

All users are **seekers by default**. Profile completion is required after signup.

#### 1. Complete Profile (After Signup)
```bash
POST /api/profile/complete
Authorization: Cookie (better-auth.session_token)
Content-Type: application/json

{
  "name": "John Doe",
  "currentEmployer": "Acme Corp",
  "currentJobTitle": "Software Engineer",
  "yearsOfExperience": 5,
  "topSkills": ["React", "Node.js", "TypeScript", "PostgreSQL", "Docker"]
}
```

**Response:**
```json
{
  "message": "Profile completed successfully",
  "profile": {
    "id": "user_xxx",
    "name": "John Doe",
    "email": "john@example.com",
    "avatarUrl": "https://ui-avatars.com/api/?name=John+Doe&size=256...",
    "currentEmployer": "Acme Corp",
    "currentJobTitle": "Software Engineer",
    "yearsOfExperience": 5,
    "topSkills": ["React", "Node.js", "TypeScript", "PostgreSQL", "Docker"],
    "verificationLevel": "level_0"
  }
}
```

#### 2. Get Profile
```bash
GET /api/profile
Authorization: Cookie (better-auth.session_token)
```

#### 3. Update Profile
```bash
PUT /api/profile
Authorization: Cookie (better-auth.session_token)
Content-Type: application/json

{
  "currentJobTitle": "Senior Software Engineer",
  "yearsOfExperience": 6
}
```

#### 4. Check Profile Status
```bash
GET /api/profile/status
Authorization: Cookie (better-auth.session_token)
```

**Response:**
```json
{
  "profileCompleted": true
}
```

## Key Features

### ✅ No Account Types
- All users are seekers by default
- No "giver" vs "seeker" selection needed
- "Giver" is an action (posting listings), not an identity

### ✅ Avatar Generation
- Automatically generated from user's name
- Uses UI Avatars API
- No image upload needed for MVP

### ✅ Validation
- Zod schema validation on all inputs
- Name: 2-100 chars
- Skills: 1-5 required, max 50 chars each
- Years of experience: 0-70

### ✅ Profile Completion Check
- Can verify if user completed profile via `/api/profile/status`
- Frontend can prompt incomplete profiles

## Complete User Flow

1. **Sign Up** (BetterAuth)
   ```bash
   POST /api/auth/sign-up/email
   {
     "email": "john@example.com",
     "password": "SecurePass123!",
     "name": "John Doe"
   }
   ```

2. **Email Verification**
   - BetterAuth sends verification email
   - User clicks link
   - Email verified

3. **Sign In**
   ```bash
   POST /api/auth/sign-in/email
   {
     "email": "john@example.com",
     "password": "SecurePass123!"
   }
   ```

4. **Check Profile Status**
   ```bash
   GET /api/profile/status
   # Returns: { "profileCompleted": false }
   ```

5. **Complete Profile**
   ```bash
   POST /api/profile/complete
   {
     "name": "John Doe",
     "currentEmployer": "Acme Corp",
     "currentJobTitle": "Software Engineer",
     "yearsOfExperience": 5,
     "topSkills": ["React", "Node.js", "TypeScript"]
   }
   ```

6. **User Ready to Use App**
   - Default state: `verificationLevel = level_0` (seeker)
   - Can browse opportunities
   - When posting listing: will be prompted for company email verification

## Testing the API

### Using cURL
```bash
# 1. Sign up
curl -X POST http://localhost:3000/api/auth/sign-up/email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123456!",
    "name": "Test User"
  }' \
  -c cookies.txt

# 2. Sign in (saves session cookie)
curl -X POST http://localhost:3000/api/auth/sign-in/email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123456!"
  }' \
  -b cookies.txt -c cookies.txt

# 3. Check profile status
curl http://localhost:3000/api/profile/status \
  -b cookies.txt

# 4. Complete profile
curl -X POST http://localhost:3000/api/profile/complete \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "name": "Test User",
    "currentEmployer": "Test Corp",
    "currentJobTitle": "Developer",
    "yearsOfExperience": 3,
    "topSkills": ["JavaScript", "Python", "SQL"]
  }'

# 5. Get profile
curl http://localhost:3000/api/profile \
  -b cookies.txt
```

## Database Schema Updates

### User Table (No Account Type!)
```sql
user:
  - id (text, PK)
  - name (text)
  - email (text, unique)
  - emailVerified (boolean)
  - avatarUrl (text) -- Auto-generated
  - currentEmployer (text)
  - currentJobTitle (text)
  - yearsOfExperience (integer)
  - topSkills (text[])
  - verificationLevel (enum: level_0, level_1_giver) -- Default: level_0
  - onlineStatus (enum: online, offline) -- Default: offline
  - createdAt, updatedAt
```

## What's Next: Phase 2

**Location & Presence**
- Online/offline toggle
- Location updates (H3 cells + PostGIS)
- Redis presence tracking
- Periodic location sync from mobile

## Start the Server

```bash
# Start Docker services
docker-compose up -d

# Or run locally
pnpm dev
```

Server will be at: **http://localhost:3000**

Check available endpoints: **GET http://localhost:3000/**
