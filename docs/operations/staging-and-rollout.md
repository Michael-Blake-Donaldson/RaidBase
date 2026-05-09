# Staging And Rollout Plan

## Staging Requirements

Staging must match production in these areas:

- PostgreSQL engine family
- Prisma migration state
- NextAuth base URL and secret behavior
- Stripe test-mode configuration
- Upstash rate-limit configuration
- observability webhook configuration

## Recommended Rollout

1. Deploy to staging.
2. Run migration deploy.
3. Validate smoke flows manually.
4. Roll out to production with a low initial traffic share if the platform supports it.
5. Watch `/api/health`, request IDs, client error events, and billing events.
6. Ramp traffic only after metrics remain stable.

## Manual Smoke Flow

- Visit `/`
- Visit `/lfg`
- Visit `/profile/ghosttrace`
- Sign in with a seeded account
- Open `/settings`
- Start checkout in Stripe test mode
- Open billing portal for the same user
