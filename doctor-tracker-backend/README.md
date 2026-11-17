# Doctor Tracker Backend

Express and MongoDB backend for the Doctor Tracker SaaS application.

## Development

1. Copy `.env.example` to `.env`.
2. Set `MONGODB_URI`, `FRONTEND_ORIGIN`, and `JWT_SECRET`.
3. Run `npm install`.
4. Run `npm run dev`.

## Scripts

- `npm run dev` - start in watch mode
- `npm run build` - compile TypeScript
- `npm start` - run compiled output
- `npm run typecheck` - type-check without emitting
- `npm test` - run tests

## Phase 1 endpoints

- `GET /api/health`
- `GET /api/health/ready`

## Architecture

Phase 1 provides environment validation, MongoDB connection helpers, security middleware,
centralized error handling, health endpoints, structured logging, and graceful shutdown.
