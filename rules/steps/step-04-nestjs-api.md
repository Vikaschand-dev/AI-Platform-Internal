# Step 04 — NestJS API (apps/api)

**Status:** COMPLETE ✓
**Date started:** 2026-06-25
**Depends on:** Step 01 ✓, Step 02 ✓, Step 03 ✓
**Unblocks:** Step 05 (Next.js web — needs auth endpoints), Step 07 (Docker Compose)

---

## Goal

Build `apps/api` — the NestJS service that owns all product logic for v0.0:

-   JWT auth (login, register)
-   Tenant (Organization) + Workspace creation on signup
-   RBAC guard on every request
-   Proxy middleware: forwards `/api/v1/*` to engine, injecting workspace context headers

The engine (packages/server) is NEVER called directly by the frontend.
All traffic flows: Browser → Gateway → Web/API → (if AI request) API proxies → Engine.

---

## Database Entity Strategy

NestJS API shares the SAME PostgreSQL database as the engine.
Entities are copied into `apps/api/src/entities/` for v0.0 (no coupling to packages/server).
Source of truth for entity reference: `packages/server/src/enterprise/database/entities/`

Entities used by apps/api:

-   User, Organization, Workspace, WorkspaceUser, Role, OrganizationUser

---

## File Structure

```
apps/api/
  package.json          ← updated with NestJS deps
  tsconfig.json
  tsconfig.build.json
  nest-cli.json
  src/
    main.ts             ← bootstrap + proxy middleware wired here
    app.module.ts
    entities/           ← TypeORM entity copies (User, Org, Workspace, etc.)
    database/
      database.module.ts
    auth/
      auth.module.ts
      auth.controller.ts
      auth.service.ts
      strategies/jwt.strategy.ts
      guards/jwt-auth.guard.ts
      dto/login.dto.ts
      dto/register.dto.ts
    proxy/
      proxy.module.ts   ← http-proxy-middleware wired in main.ts instead
    common/
      decorators/current-user.decorator.ts
```

---

## Proxy Design (critical)

The proxy lives in `main.ts` using `http-proxy-middleware`.
It runs AFTER the JWT guard so `req.user` is populated.

```
POST /api/v1/chatflows  → JWT guard validates token → inject headers → forward to engine:3002
GET  /api/v1/chatflows  → JWT guard validates token → inject headers → forward to engine:3002
```

Headers injected into every engine request:

-   `x-workspace-id` from JWT payload
-   `x-tenant-id` from JWT payload
-   `x-user-id` from JWT payload
-   `x-user-role` from JWT payload

---

## JWT Token Shape

```typescript
{
    sub: string // user.id
    email: string
    tenantId: string // organization.id
    workspaceId: string
    role: string // 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER'
    iat: number
    exp: number
}
```

Token stored in:

-   HttpOnly cookie `token` (for browser sessions)
-   Response body (for API/SDK clients)

---

## Auth Flow

### Register

1. Validate name + email + password
2. Check email not taken
3. Hash password (bcrypt, 10 rounds)
4. Create User (status: active — email verification is v0.1+)
5. Create Organization (name = "{user.name}'s Organization")
6. Create Workspace (name = "Personal Workspace")
7. Assign user as OWNER of workspace (WorkspaceUser row)
8. Sign JWT → return token + user info

### Login

1. Find user by email
2. bcrypt.compare(password, user.credential)
3. Load user's org + active workspace (first workspace they own)
4. Sign JWT → return token + user info

---

## Build + Test After This Step

```bash
pnpm --filter @accelance/api build
```

Manual smoke tests:

```bash
# Register
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"Test1234!"}'
# → 201 { token, user }

# Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test1234!"}'
# → 200 { token, user }

# Proxy to engine (requires engine running on :3002)
curl http://localhost:3000/api/v1/chatflows \
  -H "Authorization: Bearer <token>"
# → 200 [] (empty array, workspace has no flows yet)
```

---

## Files Created/Changed (exact list)

1.  `apps/api/package.json` — updated with NestJS deps
2.  `apps/api/tsconfig.json`
3.  `apps/api/tsconfig.build.json`
4.  `apps/api/nest-cli.json`
5.  `apps/api/src/main.ts`
6.  `apps/api/src/app.module.ts`
7.  `apps/api/src/entities/user.entity.ts`
8.  `apps/api/src/entities/organization.entity.ts`
9.  `apps/api/src/entities/workspace.entity.ts`
10. `apps/api/src/entities/workspace-user.entity.ts`
11. `apps/api/src/entities/role.entity.ts`
12. `apps/api/src/entities/organization-user.entity.ts`
13. `apps/api/src/database/database.module.ts`
14. `apps/api/src/auth/auth.module.ts`
15. `apps/api/src/auth/auth.controller.ts`
16. `apps/api/src/auth/auth.service.ts`
17. `apps/api/src/auth/strategies/jwt.strategy.ts`
18. `apps/api/src/auth/guards/jwt-auth.guard.ts`
19. `apps/api/src/auth/dto/login.dto.ts`
20. `apps/api/src/auth/dto/register.dto.ts`
21. `apps/api/src/common/decorators/current-user.decorator.ts`

---

## Rollback

Delete `apps/api/src/` and revert `apps/api/package.json` to the stub.
No DB changes until first `pnpm --filter @accelance/api start` runs migrations.

---

## Next Step

→ Step 05: Next.js web shell
See `rules/steps/step-05-nextjs-web.md`
