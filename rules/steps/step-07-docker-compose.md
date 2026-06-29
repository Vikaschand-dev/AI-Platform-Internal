# Step 07 — Docker Compose (wire all services)

**Status:** COMPLETE ✓
**Date started:** 2026-06-29
**Depends on:** Step 06 ✓ (Nginx gateway config)
**Unblocks:** First full smoke test — `docker compose up` → open `http://localhost`

---

## Goal

Wire all v0.0 services into a single `docker-compose.yml` at the repo root.
After this step, a developer runs two commands and has a working platform:

```bash
cp .env.example .env   # fill in DB_PASSWORD and JWT_SECRET
docker compose up --build
```

---

## Canvas URL Fix (discovered during this step)

The canvas page (`apps/web/src/app/canvas/[id]/page.tsx`) used:

```typescript
const ENGINE_URL = process.env.NEXT_PUBLIC_ENGINE_URL || 'http://localhost:3002'
```

`NEXT_PUBLIC_*` vars are baked in at `next build` time. In Docker the engine is internal-only
(port 3002 not exposed to host), so the browser can't reach `localhost:3002` directly.

**Fix:**

1. Change `||` → `??` in the canvas page — empty string becomes falsy with `||` but not with `??`
2. Set `ENV NEXT_PUBLIC_ENGINE_URL=""` in web's Dockerfile — baked-in empty string → relative URL
3. Add nginx `/canvas/` route → engine:3002 (already internal) — secured by `__ctkn` JWT

Relative URL in iframe means browser requests `http://localhost/canvas/{id}?...` → nginx proxies
to engine → canvasBootstrap validates JWT → Flowise SPA loads.

---

## Health Endpoints

NestJS has no `GET /health` route. Added as a raw Express middleware in `main.ts` before
NestJS guards fire — no JWT required.

```typescript
app.use('/health', (_req, res) => res.status(200).json({ status: 'ok' }))
```

---

## Network Isolation

Two Docker networks:

-   `public_net` — gateway only (the single container with host port binding)
-   `internal_net` — all other containers (no direct internet access)

Gateway is on both networks so it can reach internal services.

---

## Secrets model

Only two values in `.env` (gitignored):

-   `DB_PASSWORD` — PostgreSQL password
-   `JWT_SECRET` — signs/verifies all JWTs across api + engine

All other config (ports, hosts, mode flags) is hardcoded in docker-compose.yml.

---

## Service startup order

```
postgres (healthy)
    └── api (healthy)    ← needs DB for user tables
    └── engine (healthy) ← needs DB for Flowise tables
         └── web (healthy)   ← depends on api
              └── gateway    ← depends on web + api healthy
```

---

## Files created/changed

**New:**

-   `docker-compose.yml` — root
-   `.env.example` — root
-   `apps/api/Dockerfile`
-   `apps/web/Dockerfile`
-   `apps/engine/Dockerfile`

**Modified:**

-   `.dockerignore` — add .git, .next, .env
-   `apps/gateway/nginx.conf` — add engine upstream + /canvas/ proxy route
-   `apps/api/src/main.ts` — add /health express middleware
-   `apps/web/src/app/canvas/[id]/page.tsx` — change `||` to `??` for ENGINE_URL

---

## Smoke test (after docker compose up --build)

```bash
# Verify gateway health
curl http://localhost/nginx-health           # → "OK"

# Verify api health
curl http://localhost/health                 # → {"status":"ok"}

# Verify engine reachable through api proxy
curl http://localhost/api/v1/ping            # → 401 (correct — not authenticated)

# Full flow
open http://localhost                        # → redirects to /login
# Register → login → dashboard → create flow → open canvas
```

---

## Next Step

→ Step 08: Production hardening (add pgvector extension init, Flowise DB migrations,
rate limiting improvements, environment-specific compose overrides)
