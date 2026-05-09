# Raidbase

I built Raidbase as a desktop-first PC gaming squad platform for people who are tired of wasting nights on random teammates with no context, no accountability, and no continuity. The idea is simple: give players a better way to prove who they are, find compatible squads, track reputation after real sessions, and keep good teams together.

This project is now an MVP+ application shell with working authentication, settings persistence, guarded APIs, health checks, and CI quality gates. It still has roadmap items, but the core release workflow is functional.

## What The App Does

Raidbase is positioned as a competitive player identity layer rather than a generic chat app or simple LFG board.

The current app includes:

- A command-center style landing page that frames the product and shows key platform signals
- An LFG board focused on compatibility, not just open slots
- Squad pages that present recurring team identity and synergy
- Dynamic player profile routes at `/profile/[username]`
- A clip showcase for skill proof and player style
- Settings, moderation, privacy, and terms pages
- Public-release support pages and metadata such as a custom 404 page, manifest, robots, and sitemap

## How It Works Right Now

The app combines seeded/live PostgreSQL data via Prisma with shared domain presentation data for product storytelling surfaces.

That gives me a few advantages at this stage:

- I can define the product structure before locking in backend contracts
- I can build and validate the full user flow across pages quickly
- I can refine the UI, information architecture, and route design before adding persistence

The current version includes live credential authentication, profile settings persistence, session-protected APIs, billing endpoint wiring (Stripe-config dependent), and end-to-end smoke validation.

## Framework And Architecture Details

Raidbase is built with the following stack:

- Next.js 16 with the App Router
- React 19
- TypeScript
- Tailwind CSS 4
- Framer Motion
- Lucide React

### Why Next.js App Router

I used Next.js App Router because this app benefits from route-based composition, server rendering, built-in metadata handling, and clear file-system routing.

That matters here because Raidbase has multiple distinct product surfaces that should behave like a real platform, including:

- `/` for the main command center
- `/lfg` for squad discovery
- `/squads` for persistent team views
- `/clips` for showcases
- `/settings` for control surfaces
- `/admin` for moderation
- `/profile/[username]` for public player identity

The App Router also makes it straightforward to add platform-level files like:

- `robots.ts`
- `sitemap.ts`
- `manifest.ts`
- `not-found.tsx`

Those are already part of this implementation because I wanted the app to feel like a real product shell instead of a disconnected demo.

### Why TypeScript

I used TypeScript because this project has a lot of structured domain data and route-driven UI. Even before adding the backend, there are already clear data contracts around:

- player profiles
- LFG posts
- squads
- clips
- moderation reports
- navigation and site configuration

TypeScript keeps those contracts explicit and makes it much safer to expand into Prisma models, auth, billing, and validation later.

### Styling Approach

I used Tailwind CSS 4 for layout, spacing, typography, and visual system control. The visual direction is intentionally built around a premium PC-gaming feel: dark surfaces, cyan highlights, layered gradients, glassy panels, and strong contrast.

Framer Motion is used for lightweight entry motion so the interface feels alive without depending on animation for understanding.

## Project Structure

The current structure is organized around App Router routes, reusable UI shell components, and shared domain data.

Main areas include:

- `src/app` for routes and top-level app files
- `src/components` for reusable interface building blocks
- `src/lib/site-data.ts` for the current mock domain layer
- `src/lib/site-config.ts` for site-wide metadata and route configuration

The shared shell component is used to keep navigation, framing, and layout consistent across the platform pages.

## Running The Project

Install dependencies:

```bash
npm install
```

Start the local development server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## Environment Configuration

Copy `.env.example` to `.env` and set values for your environment.

For local development, run a PostgreSQL instance and point `DATABASE_URL` at it before running Prisma commands or authenticated flows.

For production deploys, this app now enforces strict environment validation by default. Missing required variables will fail startup early.

Required in production:

- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRO_PRICE_ID`
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`

Recommended behavior:

- Keep `STRICT_ENV_VALIDATION=true` in production
- Use randomly generated secrets from your secret manager
- Never commit real secrets to the repository

## Validation Commands

Database workflow:

```bash
npm run prisma:migrate:deploy
npm run db:seed
```

For a full local reset:

```bash
npm run db:reset
```

For code quality:

```bash
npm run lint
```

For unit and route tests:

```bash
npm run test
```

For a production build check:

```bash
npm run build
```

For end-to-end smoke coverage against the built app:

```bash
npm run test:e2e
```

For Lighthouse performance budget enforcement:

```bash
npm run perf:budget
```

## Production UX Baseline Implemented

The home experience and shell were refactored to improve readability, speed, and interaction quality:

- Reduced information density on the command page so primary actions are obvious
- Reworked content hierarchy so users scan high-value actions first, supporting detail second
- Added explicit empty-state handling for teammates, LFG posts, clips, squads, and activity feed
- Simplified shell typography and reduced all-caps/tracking-heavy labels
- Tightened entry animations and added reduced-motion fallback behavior
- Added a route loading skeleton at `src/app/loading.tsx` for better perceived performance
- Improved global focus-visible styling for clearer keyboard navigation
- Reduced visual noise from background overlay density, especially on smaller viewports

### Recommended Production Gates

Before deployment, run these checks in CI:

- `npm run lint`
- `npm run test`
- `npm run build`
- `npm run test:e2e`
- `npm run perf:budget`

And track runtime metrics in production:

- LCP under 2.5s
- INP under 200ms
- CLS under 0.1

## Current State

What is implemented now:

- Real route structure for the main product areas
- Session-aware command center personalization
- First-session checklist flow for onboarding completion
- Trust-transparency explanations for recommendation surfaces
- Dynamic profile routing
- Shared desktop-first layout shell
- Product-specific visual system
- Public-release supporting pages and metadata files
- Credential authentication via NextAuth with Prisma adapter
- User registration API with validation and rate limiting
- Functional settings page with DB-backed profile updates
- Settings safety UX with reset-unsaved and undo-last-save actions
- Interactive LFG board with create-post and request-to-join actions
- Interactive squads hub with create-squad and join-squad actions
- Privacy-aware squad membership flow with invite-code enforcement
- Health check endpoint at `/api/health`
- Route-level loading and error boundaries for key flows
- Global application error boundary
- Web-vitals ingest endpoint and client reporter
- Playwright smoke tests and Lighthouse performance-budget CI gate

What is still intentionally mocked or pending:

- Stripe billing
- persistent moderation data
- live notifications
- clip storage and upload handling
- broader domain-specific server actions and deeper integration tests

## Next Backend Phase

The next serious implementation step should be turning the mock product layer into a real application backend.

That phase should include:

- Prisma models for users, profiles, LFG posts, squads, sessions, reviews, clips, notifications, subscriptions, and reports
- Authentication and session handling
- server-side validation for profile and LFG creation flows
- moderation persistence and trust-scoring logic
- Stripe integration for the Pro tier
- storage integration for profile assets and clip media

## Summary

Raidbase is already structured like a real product, not just a landing page. The frontend now explains the platform, demonstrates the intended experience, and gives me a strong framework base for building the real data layer next.
