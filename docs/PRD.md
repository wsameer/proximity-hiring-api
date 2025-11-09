# Product Requirements Document

## Product Requirements Document: "Jobximity"

- **Version:** 1.0 (MVP)

- **Status:** Draft

- **Author:** Sam Waskar (in collaboration with Gemini)

### Introduction & Overview

**Product:** Proximity is a hyperlocal, privacy-first hiring and referral platform.

**Problem:** Modern hiring is impersonal, algorithm-driven, and filled with friction (e.g., "resume black holes," ghosting). Job seekers, especially "passive" ones, risk their privacy by using public platforms. Hiring managers are inundated with irrelevant applications.

**Solution:** Proximity connects Job Seekers and Job Givers (Hiring Managers/Referrers) within a 2km radius. It operates on a "passive discovery" model, surfacing opportunities as users move about their daily lives. Its core pillars are **hyperlocality** (2km), **privacy** (no exact location, employer blocking), and **urgency** (ephemeral 7-day chats). It's a "networking event" in your pocket.

### Product Goals & Objectives

**Primary Goal:** Facilitate high-quality, fast, and direct introductions between local job seekers and hiring professionals.
**Secondary Goals:**

- **Drive Action:** Force a clear "next step" (e.g., exchange numbers, set a coffee meeting) via the 7-day chat limit.
- **Build Trust:** Ensure all Job Listings and Referrals are legitimate through a mandatory Giver verification process.
- **Protect Users:** Create a safe environment for "stealth" job seeking through robust privacy controls.
  **Business Goal:** Validate a "Giver-Pays" monetization model to fund the platform while keeping it 100% free for Seekers.

### Target Audience & Personas

- **Persona 1: The Seeker (Active/Passive)**

  - _Includes:_ Unemployed professionals, "stealth" seekers who are currently employed, freelancers, and students.
  - _Goal:_ To discover relevant, local opportunities (jobs or referrals) with minimal effort, maximum privacy, and without alerting their current employer.

- **Persona 2: The Giver (Hiring Manager / Referrer)**
  - _Includes:_ Talent acquisition (TA) staff, hiring managers, and employees looking to earn referral bonuses.
  - _Goal:_ To find qualified local talent, cut through application noise, and quickly vet candidates through an informal chat.

### Features & Requirements (MVP)

#### Onboarding & Profile Management

- **Auth:** Users can sign up via LinkedIn, Apple ID, or Email + Password.
- **Profile Setup (Required):** All users must create a minimal profile to use the app.
  - Image
  - Full Name
  - Current Employer (Self-reported text field, used for blocking)
  - Current Job Title (Self-reported, used for matching)
  - Years of Experience
  - Top Skills (e.g., Tag-based, max 5)
- **Consent:** Onboarding flow must get explicit consent for _approximate_ location usage.

#### Tiered User Verification

**Level 0 (Seeker / Default):** All users start here. Can sign up with any email (personal, etc.). Can browse, match with, and chat with Givers.
**Level 1 (Verified Giver):** To _post_ a Job Listing or Job Referral, a user must verify their identity. - **Flow:** User attempts to create a listing -> prompted for company email -> receives a one-time-password (OTP) to that email -> enters OTP. - **Benefit:** The Giver's listings are now marked as "Verified," and their profile receives a "Verified" badge (visible post-match). This builds trust.

#### Core Discovery & Visibility

- **"Online/Offline" Toggle:** The app's main screen features a toggle.
  - **"Online":** The user is an active "beacon." Their approximate location is used for matching, and this can run passively. They are discoverable and can discover others.
  - **"Offline":** The user is invisible. Location services are disabled for the app. They cannot discover or be discovered.
- **Proximity Limit:** All discovery is hard-capped at a 2km radius.
- **Privacy**
  - No exact coordinates are ever stored or displayed. All matching is done on approximate "zones."
  - **Same Employer Block:** A user will _never_ see or be seen by another user who has the _exact same string_ in their "Current Employer" profile field.

#### Matching Logic

- **Feed:** The discovery feed shows nearby _Opportunities_ (Listings/Referrals) or _Seekers_ (depending on user type).
- **No Algorithm:** The feed is not ranked by an algorithm. It is a simple, unranked view of what is in range.
- **Filters:** Users can apply basic filters (e.g., Skills, Job Title).
- **Match Flow:**

  1.  User A sees User B (or B's Listing) in their feed.

  2.  User A sends a "Match Request."

  3.  User B receives the request and must **Accept** or **Decline**.

  4.  Only upon **Acceptance** is a "Match" created, and a chat is opened.

#### Chat & Communication

- **7-Day Expiry:** All chats **permanently archive** 7 days after the match is accepted.
- **No Extensions:** There will be no feature to extend the chat. This is a core "act or move on" philosophy.
- **Expiry Warning:** Users will receive a push notification 12 hours before a chat is set to archive.
- **Post-Match Persistence:** Once a match is made, the chat is **locked**. It will _not_ disappear if users move out of range.
- **Chat Archival (Backend):** "Archived" means the chat is hidden from both users. It is **not** hard-deleted. It is retained on the backend for 30 days _solely_ for abuse reporting and moderation review.

#### Listings & Referrals (Giver Flow)

- **UI Differentiation:** The UI must clearly distinguish between a "Job Listing" and a "Job Referral."
  - **Job Listing (Max 10):** "I am hiring for this role. Match with me to discuss."
  - **Job Referral (Max 3):** "My company is hiring. Match with me, and I can refer you if it's a fit."
- **Listing Fields:** Job Title, Industry, Employer (Verified, but private until match), Location (City), Work Mode (Remote, Hybrid, Onsite), Employment Type, Experience/Pay (Optional).
- **Activation:** Givers can activate/deactivate their listings at any time.

#### User Experience (UX)

- **Low-Density Feedback:** If a user is "Online" in an area with zero matches, the app will display a message:

  > "You're in a low-discovery area. No opportunities are nearby. Proximity works best in dense commercial hubs, event spaces, or co-working centers. Check back when you're in a new area!"

- **"Out of Range" Tag:** _Potential_ matches (leads in the discovery feed that are not yet connected) will be marked "Out of Range" and hidden if the user moves too far away _before_ a match is accepted.

#### Moderation & Safety

- **Report from Card:** Users must be able to **Report** a profile _before_ matching (e.g., for an offensive photo or job title).
- **Report/Block Post-Match:** Users can Report or Block another user from within an active chat.
- **Punishment:** Confirmed abuse leads to a **permanent ban** of the account (tied to email and SSO ID). The abuser's data is purged, and they cannot "start fresh."

#### Monetization

- **Seekers:** 100% free. All features, always.
- **Givers:**
  - **Free Tier:** 1 (one) free "Job Referral" post.
  - **Paid:** - A one-time fee is required for _every_ "Job Listing" post. - A one-time fee is required for the 2nd, 3rd, etc., "Job Referral" post.

### Out of Scope (For MVP v1)

- Chat extensions or "re-matching."
- Algorithmic ranking, "boosts," or paid promotion of listings.
- "Anchor Locations" (e.g., setting a static "Home" or "Work" radius).
- Formal "Event Mode" (this is a V2 consideration).
- In-app resume parsing or formal application tools (the app facilitates _introductions_).
- A web or desktop client.
- Company-level profiles or analytics.

### Success Metrics (KPIs)

- **North Star Metric:** # of Successful Matches (Match accepted AND at least one message sent by _both_ parties).
- **Engagement:**
  - DAU/MAU.
  - Ratio of "Online" vs. "Offline" users.
  - Chat Response Rate (within the 7-day window).
- **Retention:**
  - New User Churn (Day 1, Day 7).
  - "Low-Density Churn" (User opens, sees empty room, never returns).
- **Monetization:** - Conversion Rate (Giver posts 1st free referral → posts 2nd paid referral). - Total # of paid Job Listings.
