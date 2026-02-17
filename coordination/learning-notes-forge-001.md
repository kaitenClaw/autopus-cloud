# Learning Notes: Backend Infrastructure (task-w1-forge-001)

## Key Findings

### 1. Layered Architecture (from nodebestpractices & nodejs-patterns skill)
- **Routes**: Define endpoints and apply middleware (auth, validation).
- **Controllers**: Extract request data, call services, and return responses using helper classes.
- **Services**: Contain business logic, handle complex operations, and interact with repositories.
- **Repositories**: Abstract Prisma calls. This allows for easier testing and potential DB swaps.
- **Middleware**: Centralized logic for auth, validation, logging, and error handling.

### 2. Express Server Setup
- Use `helmet` for security headers.
- Use `cors` with restricted origins.
- Use `compression` for performance.
- Centralized error handling using a custom `AppError` class and an `asyncHandler` wrapper to catch async errors.

### 3. Prisma & PostgreSQL
- **Schema**: Use enums for statuses (e.g., `AgentStatus`). Implement `deletedAt` for soft deletes.
- **Migrations**: Always use `prisma migrate dev` during development and `prisma migrate deploy` in production.
- **Type Safety**: Leverage generated types from `@prisma/client`.

### 4. JWT Authentication Best Practices
- **Access Token**: Short-lived (15 minutes), passed in `Authorization: Bearer` header.
- **Refresh Token**: Long-lived (7 days), stored in an `httpOnly`, `secure`, `sameSite: strict` cookie.
- **Rotation**: Issue a new refresh token whenever an access token is refreshed. Invalidate the old refresh token.
- **Revocation**: Store refresh tokens in the database to allow user logout (deleting the token) or global logout.

### 5. Validation
- Use **Zod** for schema validation.
- Create a reusable `validate` middleware that takes a Zod schema and parses `req.body`, `req.query`, and `req.params`.

---

## Implementation Plan

### Phase 1: Scaffolding
1. Initialize Node.js project with TypeScript.
2. Install dependencies: `express`, `helmet`, `cors`, `compression`, `dotenv`, `zod`, `jsonwebtoken`, `bcrypt`, `cookie-parser`.
3. Set up folder structure: `src/{controllers,services,repositories,models,middleware,routes,config,utils}`.
4. Configure TypeScript (`tsconfig.json`).

### Phase 2: Database Setup
1. Initialize Prisma: `npx prisma init`.
2. Define `User`, `Agent`, and `RefreshToken` models in `schema.prisma`.
3. Run initial migration to set up PostgreSQL tables.

### Phase 3: Authentication System
1. Implement `AuthService` for login, signup, and token refreshing.
2. Implement `authenticate` middleware to verify JWTs.
3. Implement `AuthRoute` with Zod validation.
4. Securely handle refresh tokens in cookies.

### Phase 4: Agent Management API
1. Implement `AgentService` and `AgentController`.
2. Create endpoints: `POST /api/agents` (create), `GET /api/agents` (list).
3. Add initial scaffolding for agent creation (integration with OpenClaw profiles).

### Phase 5: Quality Check
- [ ] Centralized error handling active.
- [ ] All inputs validated with Zod.
- [ ] Security headers active via Helmet.
- [ ] Proper environment variable usage.
- [ ] Comprehensive logging (structured).

---
**Target Quality**: 9/10
**Status**: Learning complete. Ready to implement.
