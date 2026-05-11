# RaidBase Launch Readiness

This checklist tracks the final v1.0 candidate gate.

## Product Core

- [x] Registration, verification, login, and logout flows
- [x] Profile pages and profile editing
- [x] LFG loop: create, apply, accept or decline, close
- [x] Squad loop: create and join flow with membership controls
- [x] Clips upload and clip gallery experience
- [x] Notifications are user-scoped and actionable
- [x] Reputation eligibility checks and trust summary surfaces

## Safety

- [x] Reports support for core user-generated targets
- [x] Moderation routes and admin queue protections
- [x] Moderation actions are audit logged
- [x] Suspended and banned users are blocked server-side
- [x] Community guidelines and support contacts are published

## Security

- [x] Write routes validate inputs
- [x] Authz checks are server-side on protected routes
- [x] Rate limiting guards high-risk mutations
- [x] Secret material is environment-driven

## UX and Accessibility

- [x] Loading, empty, and error states across primary surfaces
- [x] Responsive layouts for primary pages
- [x] Legal and support trust surfaces in footer navigation

## Testing and Build Health

- [x] Lint passes
- [x] Typecheck passes
- [x] Test suite passes
- [x] Build is validated by release gate workflow

## Infrastructure and Operations

- [x] Release gate workflow exists and is required pre-release
- [x] Database backup and recovery runbook exists
- [x] Staging rollout runbook exists
- [x] Health checks and release checklist are documented

## Release Decision

Use this checklist with the release gate run in GitHub Actions and the operational checklist in `docs/release/release-checklist.md` before approving a production tag.
