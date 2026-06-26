# Step 05 — Next.js Web Shell (apps/web)

**Status:** COMPLETE ✓
**Date started:** 2026-06-25
**Depends on:** Step 04 ✓ (NestJS API)
**Unblocks:** Step 06 (Nginx gateway), Step 07 (Docker Compose)

---

## Goal

Build `apps/web` — the Next.js 15 App Router product UI:

-   `/login` and `/register` pages (call NestJS auth endpoints)
-   `/dashboard` — lists chatflows via NestJS proxy (`GET /api/v1/chatflows`)
-   `/canvas/[id]` — embeds Flowise canvas via authenticated iframe
-   `/settings` — user/workspace settings stub

---

## Canvas Embed Architecture (Critical Design)

The Flowise canvas (drag-and-drop flow builder) is the existing React SPA inside `packages/ui`. We do NOT rewrite it. We embed it via an iframe pointing to the engine (port 3002).

**Challenge:** The engine in ENGINE_MODE strips all auth. The Flowise SPA uses `RequireAuth` (checks `localStorage.user`). If localStorage is empty, it redirects to `/login` — which doesn't exist in ENGINE_MODE.

**Solution — Canvas Token + Bootstrap:**

```
1. User clicks "Open Canvas" on dashboard
2. Next.js calls  GET /auth/canvas-token  (NestJS, authenticated)
3. NestJS signs short-lived JWT:  { workspaceId, tenantId, userId, role, type:'canvas', exp: +2min }
4. Returns  { token: SIGNED_JWT }
5. Next.js renders  <iframe src="http://localhost:3002/canvas/{id}?__ctkn=TOKEN" />
6. Engine receives request, verifies __ctkn JWT
7. Engine sets  accel_ctx  httpOnly cookie (base64-encoded workspace context)
8. Engine injects localStorage bootstrap script into index.html:
      localStorage.setItem('user', JSON.stringify({ isOrganizationAdmin: true, ... }))
      localStorage.setItem('isAuthenticated', 'true')
      ...
9. Flowise SPA loads — RequireAuth sees localStorage.user → passes
10. SPA API calls go to localhost:3002/api/v1/* → trustEngineHeaders reads accel_ctx cookie
```

**Iframe security:** Engine must have `IFRAME_ORIGINS=*` (or `http://localhost:3001`) so the SPA can be embedded.

---

## Engine Changes Required (packages/server)

### A. `packages/server/src/middlewares/trustEngineHeaders.ts`

Add cookie fallback: if X-Workspace-Id header is absent, read from `accel_ctx` cookie (set by canvasBootstrap).

### B. `packages/server/src/middlewares/canvasBootstrap.ts` (NEW)

Function called instead of `res.sendFile(uiHtmlPath)` when in ENGINE_MODE:

-   Read `__ctkn` query param → verify JWT → set `accel_ctx` cookie
-   OR read existing `accel_ctx` cookie
-   Inject localStorage bootstrap script into index.html
-   Return modified HTML

### C. `packages/server/src/index.ts`

In ENGINE_MODE, the catch-all `res.sendFile(uiHtmlPath)` is replaced with `canvasBootstrap(req, res, uiHtmlPath)`.
Also set `IFRAME_ORIGINS=*` default in ENGINE_MODE.

---

## NestJS Changes Required (apps/api)

### D. `apps/api/src/auth/strategies/jwt.strategy.ts`

Add cookie extraction: `ExtractJwt.fromExtractors([fromBearerToken, fromCookie('token')])`.
Flowise SPA sends `withCredentials:true` — its API calls go through NestJS rewrite which forwards the `token` cookie.

### E. `apps/api/src/auth/auth.controller.ts`

Add `GET /auth/canvas-token` endpoint (protected by JWT guard).

### F. `apps/api/src/auth/auth.service.ts`

Add `generateCanvasToken(user: JwtPayload)` — signs 2-minute JWT.

---

## Next.js File Structure

```
apps/web/
  package.json          ← Next.js 15, tailwindcss, typescript
  tsconfig.json
  next.config.ts        ← rewrites: /auth/* → NestJS, /api/v1/* → NestJS
  tailwind.config.ts
  postcss.config.js
  src/
    middleware.ts       ← protect routes via accel_auth cookie presence
    app/
      globals.css
      layout.tsx        ← root layout (HTML skeleton)
      page.tsx          ← redirect to /dashboard or /login
      login/
        page.tsx
      register/
        page.tsx
      dashboard/
        page.tsx        ← lists chatflows, links to canvas
      canvas/
        [id]/
          page.tsx      ← fetches canvas token, renders iframe
      settings/
        page.tsx
    lib/
      api.ts            ← fetch wrapper (adds Authorization header)
      auth.ts           ← login/register/logout + localStorage seeding
```

---

## Auth in Next.js (no next-auth)

-   Token stored in `localStorage.token` (client-side only)
-   After login: seed Flowise-compatible keys in localStorage
-   Middleware: checks for `accel_auth` cookie (non-httpOnly, set by client after login)
-   `accel_auth` cookie = presence indicator only (not the JWT itself)

---

## Next.js Rewrites

```typescript
async rewrites() {
    const api = process.env.API_URL || 'http://localhost:3000'
    return [
        { source: '/auth/:path*', destination: `${api}/auth/:path*` },
        { source: '/api/v1/:path*', destination: `${api}/api/v1/:path*` }
    ]
}
```

Client-side fetch calls `/auth/login` → Next.js rewrites to NestJS → NestJS sets `token` httpOnly cookie → forwarded back to browser.

---

## Build + Test After This Step

```bash
# Install deps
pnpm install

# Type check
pnpm --filter @accelance/web typecheck

# Build
pnpm --filter @accelance/web build
```

Manual smoke test (all 3 services running):

```
1. Open http://localhost:3001/register
2. Create account
3. Redirected to /dashboard — should show "No flows yet"
4. Create a flow at http://localhost:3001/dashboard → "New Flow"
5. Click "Open Canvas" → iframe loads Flowise builder
6. Open http://localhost:3001/settings — shows current user info
```

---

## Files Created/Changed (exact list)

**New:**

1.  `packages/server/src/middlewares/canvasBootstrap.ts`
2.  `apps/web/package.json` (updated from stub)
3.  `apps/web/tsconfig.json`
4.  `apps/web/next.config.ts`
5.  `apps/web/tailwind.config.ts`
6.  `apps/web/postcss.config.js`
7.  `apps/web/src/app/globals.css`
8.  `apps/web/src/app/layout.tsx`
9.  `apps/web/src/app/page.tsx`
10. `apps/web/src/app/login/page.tsx`
11. `apps/web/src/app/register/page.tsx`
12. `apps/web/src/app/dashboard/page.tsx`
13. `apps/web/src/app/canvas/[id]/page.tsx`
14. `apps/web/src/app/settings/page.tsx`
15. `apps/web/src/lib/api.ts`
16. `apps/web/src/lib/auth.ts`
17. `apps/web/src/middleware.ts`

**Modified:** 18. `packages/server/src/middlewares/trustEngineHeaders.ts` — add accel_ctx cookie fallback 19. `packages/server/src/index.ts` — ENGINE_MODE catch-all uses canvasBootstrap 20. `apps/api/src/auth/strategies/jwt.strategy.ts` — add cookie extraction 21. `apps/api/src/auth/auth.controller.ts` — add GET /auth/canvas-token 22. `apps/api/src/auth/auth.service.ts` — add generateCanvasToken

---

## Rollback

Delete `apps/web/src/` and revert `apps/web/package.json` to stub.
Revert packages/server changes to restore original catch-all.
Revert NestJS changes to restore original jwt.strategy.ts.

---

## Next Step

→ Step 06: Nginx gateway config
See `rules/steps/step-06-nginx-gateway.md`
