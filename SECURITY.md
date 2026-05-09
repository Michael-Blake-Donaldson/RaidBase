# Security Policy

## Supported Release Line

Only the current `main` release line is supported.

## Reporting A Vulnerability

Do not open a public issue for security vulnerabilities.

Report security concerns privately to the project owner with:

- affected route or feature
- impact summary
- reproduction steps
- proof-of-concept details if available

## Internal Security Expectations

- production secrets must be stored outside the repository
- releases must pass `npm run audit:prod`
- database changes must ship through checked-in Prisma migrations
- Stripe webhooks must be validated with the configured signing secret
- production runtime must use distributed rate limiting
