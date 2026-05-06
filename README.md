# Raidbase

Raidbase is a desktop-first PC gaming squad ecosystem built with Next.js, TypeScript, Tailwind CSS, and Framer Motion. The current MVP shell focuses on the product surfaces defined in the roadmap: player identity, LFG discovery, persistent squads, clip showcases, reputation, settings, and moderation.

## Current MVP Surfaces

- Command-center landing page with product framing and live platform metrics
- LFG board with compatibility-oriented filters and post cards
- Squad hub with recurring-team and synergy positioning
- Dynamic player profiles at `/profile/[username]`
- Clip showcase, settings, admin moderation, privacy, and terms routes
- Launch metadata, manifest, robots, sitemap, and custom 404 handling

## Stack

- Next.js 16 App Router
- TypeScript
- Tailwind CSS 4
- Framer Motion
- Lucide React

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Validation

```bash
npm run lint
npm run build
```

## Notes

- The current implementation uses shared mock data for product storytelling and route coverage.
- The next backend phase should add Prisma models, Auth.js, Stripe billing, storage, moderation persistence, and server-side validation.
