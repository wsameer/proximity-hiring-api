Phasing Strategy

  Phase 0: Foundation (START HERE)

  Goal: Proper structure + tooling ready + schema complete

  Tasks:
  1. Restructure directories
  2. Install deps: PostGIS, Redis, H3, Expo push, social OAuth libs
  3. Docker Compose: PostgreSQL (PostGIS), Redis, API
  4. Complete schema design (all tables, even unused)
  5. Run migrations
  6. Update CLAUDE.md

  Why this phase: Get foundation right. Schema changes later = painful migrations.

  Phase 1: Auth & Profiles

  Goal: Users can sign up, create profile

  Tasks:
  1. BetterAuth social OAuth (LinkedIn, Apple) - OR keep email-only for true MVP?
  2. Profile form: image, name, currentEmployer, jobTitle, experience, topSkills
  3. Account type selection: seeker vs giver
  4. Profile CRUD endpoints
  5. Profile validation (Zod)

  Deliverable: User can register, fill profile, view/edit profile

  Phase 2: Location & Presence

  Goal: Online/offline toggle, location tracking

  Tasks:
  1. Online/offline toggle endpoint
  2. Location update endpoint (lat/lng → H3 cell)
  3. Redis presence tracking
  4. Periodic location sync (mobile sends every 1-2min when online)

  Deliverable: User goes "online", location tracked in H3 cells

  Phase 3: Discovery & Matching

  Goal: See nearby people/listings, request matches

  Tasks:
  1. Discovery feed endpoint (geospatial query + same-employer filter)
  2. Match request flow (send/accept/decline)
  3. WebSocket for real-time match notifications
  4. Out-of-range logic

  Deliverable: Users discover each other, request matches, get notified

  Phase 4: Listings

  Goal: Givers post listings/referrals

  Tasks:
  1. Create listing endpoint (type: listing vs referral)
  2. Listing limits enforcement (10 listings, 3 referrals)
  3. List user's own listings
  4. Activate/deactivate listings
  5. Listings appear in discovery feed

  Deliverable: Givers post opportunities, Seekers see them

  Phase 5: Chat (Simple)

  Goal: Matched users chat, expires in 7 days

  Tasks:
  1. REST chat endpoints (send/fetch messages)
  2. Chat conversation creation on match accept
  3. Background job: archive after 7 days
  4. Expiry warning (12hrs before)

  Deliverable: Basic chat with expiry

  Phase 6: Safety

  Goal: Report, block users

  Tasks:
  1. Report endpoints (pre-match, post-match)
  2. Block user
  3. Admin moderation endpoints (v2?)

  ---
  My Recommendation: Start Phase 0

  Immediate next steps:

  1. Restructure dirs - Get clean architecture
  2. Install tools - PostGIS, Redis, H3, deps
  3. Docker Compose - Multi-container setup
  4. Schema - Design all tables NOW (easier to migrate empty tables)
  5. Config - Redis, PostGIS extension, env vars

  Questions for Phase 0:

  1. Social OAuth: LinkedIn + Apple for MVP? Or just email to ship faster?
    - BetterAuth supports social but needs provider setup
    - If email-only, we skip OAuth config complexity
  2. Image upload: Store where? S3? Cloudinary? Local filesystem?
    - Need to decide now for schema (user.image = URL)
  3. pnpm lock: Keep pnpm or switch to npm? (You have pnpm-lock.yaml)
  4. Monorepo? API-only now, but planning React Native app?
    - Keep separate repos or monorepo (pnpm workspaces)?

  My vote:
  - Email-only auth for true MVP (add social later)
  - Image upload: skip for Phase 0, just allow URL string (add S3 in Phase 1)
  - Keep pnpm
  - Separate repos (API vs mobile)

  Want me to start Phase 0 now? I'll:
  1. Create new directory structure
  2. Update package.json with new deps
  3. Write docker-compose.yml (PostgreSQL + PostGIS, Redis)
  4. Design complete schema (all phases, mark what's unused)
  5. Move existing code to new structure

  Confirm approach, then I'll begin. Takes ~15-20 steps.


  ----

  Let's begin with PHase 0. 

   1. Social OAuth: LinkedIn + Apple for MVP? Or just email to ship faster?
    - BetterAuth only. Skip OAuth and Apple and LinkedIn for now.  
  2. Image upload: Store where? S3? Cloudinary? Local filesystem?
    - Need to decide now for schema (user.image = URL)
    - Let's skip image and instead assign random avatar. we will create a way for doing this later. But for now, we will assign avatar based on first name and last name. 
  3. pnpm lock: Keep pnpm or switch to npm? (You have pnpm-lock.yaml)
    - I actually want to use bun since I have heard it is fast and simple. But I am going to deploy everything on `railway` so not sure if that is a good choice. Use pnpm if that's a bad choice.
  4. Monorepo? API-only now, but planning React Native app?
    - Separate repos. Already done. This repo is API only. I want to create frontend agnostic service.
