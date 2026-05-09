# Security Review Baseline

This repository includes a release baseline for transport and application security.

## Implemented Controls

- strict security headers and CSP in `next.config.ts`
- protected settings and admin surfaces via `middleware.ts`
- strict production env validation for auth, billing, and rate limiting
- distributed rate limiting required for production runtime
- webhook signature validation for Stripe billing events
- request ID propagation on protected routes
- structured observability hooks for vitals and client errors

## Required Release Checks

- review `npm run audit:prod` output before every release
- verify no secrets are committed to git
- verify production secrets are rotated through a managed secret store
- verify Stripe webhook endpoint is using the correct signing secret
- verify request logs and client-error ingestion are reachable by on-call staff

## Residual Risks To Track

- upstream `next-auth` / `@auth/core` `cookie` advisory pending vendor remediation
- dependency vulnerability remediation cadence
- broader integration coverage for auth and billing flows
- formal account deletion and data export workflow
- external incident alert routing for observability webhook delivery failures
