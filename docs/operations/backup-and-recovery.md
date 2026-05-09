# Backup And Recovery

This runbook defines the minimum recovery process for RaidBase production data.

## Backup Policy

- Take automated PostgreSQL backups at least daily.
- Retain point-in-time recovery according to your hosting provider capability.
- Validate backup completion status before every release.
- Store backup ownership and alerting with the deployment owner.

## Recovery Triggers

Start recovery when any of the following occur:

- destructive migration applied incorrectly
- data corruption after release
- production database becomes unavailable and cannot be restored by the provider automatically
- billing or account data is lost or inconsistent after deployment

## Recovery Steps

1. Put the application into maintenance mode or stop rollout.
2. Capture the failing release SHA, migration name, and timeframe.
3. Restore to the last known good database snapshot or point-in-time timestamp.
4. Redeploy the last known good application artifact if needed.
5. Run `/api/health` and validate authentication, settings save, LFG creation, and billing status reads.
6. Announce recovery completion and start incident review.

## Recovery Verification

- a staff user can sign in
- settings profile reads and writes succeed
- `/api/health` reports `ok`
- Stripe webhook processing remains idempotent
- notifications and billing rows are readable for known users
