# Database Runbook

RaidBase now treats PostgreSQL plus Prisma migrations as the production source of truth.

## Required Commands

- Generate client: `npm run prisma:generate`
- Apply checked-in migrations: `npm run prisma:migrate:deploy`
- Seed non-production data: `npm run db:seed`
- Reset a non-production database: `npm run db:reset`

## Production Rules

- Never use `prisma db push` in production.
- Never run `db:reset` against staging or production.
- Every schema change must be represented by a checked-in migration in `prisma/migrations/`.
- Review migration SQL before merging.

## Staging Procedure

1. Set `DATABASE_URL` to the staging PostgreSQL instance.
2. Run `npm run prisma:migrate:deploy`.
3. Run `npm run db:seed` only if staging depends on fixture data.
4. Verify `/api/health` responds with `ok`.

## Production Procedure

1. Confirm a recent backup exists.
2. Confirm the application version to deploy.
3. Run `npm run prisma:migrate:deploy` against production.
4. Verify no migration errors are reported.
5. Confirm the app boots and `/api/health` returns `ok`.

## Failure Handling

- If migration deploy fails before changes apply, stop the release and fix the migration.
- If migration deploy fails after partial application, freeze deploys and follow the recovery flow in `docs/operations/backup-and-recovery.md`.
- If the app deploy succeeds but runtime fails, roll back the application first, then evaluate whether the schema change requires recovery.
