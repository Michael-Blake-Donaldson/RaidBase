# RaidBase Release Checklist

Use this checklist for every production release.

## Go / No-Go Gates

The release does not ship unless all items below are complete:

- GitHub Actions `Release Gate` workflow completed successfully for the target tag

- `npm run lint` passes
- targeted API and env regression tests pass
- `npm run build` passes against a PostgreSQL `DATABASE_URL`
- `npm run prisma:migrate:deploy` succeeds in staging
- `npm run db:seed` succeeds in staging when seed data is required
- `/api/health` returns `ok` in staging
- Stripe checkout, portal, and webhook flows are validated in staging
- observability sink receives `web_vital_recorded` and `client_error_reported` events
- release notes and rollback owner are assigned

## Automated Gate

Run the manual GitHub Actions workflow before every release candidate:

- Workflow: `.github/workflows/release-gate.yml`
- Inputs:
	- `release_tag`: target version/tag identifier
	- `run_e2e`: set to `true` for full smoke validation

Expected result:

- Workflow is green
- `release-checklist` artifact is attached to the run
- No failed lint, test, migration, or build steps

## Pre-Release Preparation

1. Confirm the target commit SHA and tag.
2. Confirm `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, Stripe, Upstash, and observability variables are set in the production secret store.
3. Confirm the PostgreSQL backup for the production database completed successfully in the last 24 hours.
4. Confirm the latest Prisma migration has been reviewed.
5. Confirm staging uses the same env shape and external services as production.

## Deployment Sequence

1. Deploy the application artifact to staging.
2. Run `npm run prisma:migrate:deploy` against staging.
3. Run smoke checks for `/`, `/lfg`, `/profile/ghosttrace`, `/settings`, `/api/health`.
4. Validate Stripe checkout and billing portal manually in staging.
5. Deploy the same artifact to production.
6. Run `npm run prisma:migrate:deploy` against production.
7. Verify `/api/health` and production request IDs.
8. Monitor logs, vitals, and client error ingestion for 30 minutes.

## Post-Release Validation

- Load the home page and verify the main CTA renders.
- Authenticate with a seeded or staff account.
- Save profile settings and confirm persistence.
- Create an LFG post and verify it appears.
- Open the billing portal for a configured account.
- Confirm no spike in `billing_payment_failed`, `client_error_reported`, or 5xx responses.

## Rollback Criteria

Rollback immediately if any of the following happen:

- migrations fail or partially apply
- `/api/health` returns `degraded`
- auth or billing flows fail for verified test accounts
- client crash volume or 5xx error rate spikes above baseline
- request latency materially degrades after deployment

## Rollback Steps

1. Stop traffic ramp-up or disable the new release in the deployment platform.
2. Redeploy the last known good application artifact.
3. If a migration introduced a breaking change, execute the database recovery procedure from `docs/operations/backup-and-recovery.md`.
4. Re-run `/api/health` and smoke checks.
5. Post the incident summary and next steps.
