# Services — Current State

## apps/engine (Flowise)

**Status:** Exists as `packages/server` — not yet moved to `apps/engine`
**Tech:** Express + TypeORM + LangChain
**Port:** :3002 (target)
**What it does:** AI flow execution only — chatflows, agentflows, 200+ LangChain nodes, vector search
**What it must NOT do:** Auth, user management, tenant management (those move to apps/api)

**Key finding:** The current `packages/server/src/enterprise/` folder contains auth, org, workspace, RBAC code.
This gets stripped out when moving to apps/engine. The NestJS api owns that instead.

**workspaceId audit: COMPLETE (Step 03)**
All 15 top-level entities have workspaceId. Child records (ChatMessage, DatasetRow, etc.)
are scoped through parent FK. No migrations needed. See `rules/steps/step-03-workspace-id-audit.md`.

---

## apps/api (NestJS)

**Status:** Not created yet
**Tech:** NestJS 10, TypeORM, Passport-JWT
**Port:** :3000 (target)

**Modules to build:**

-   `auth/` — JWT login, register, password reset, email verification
-   `tenant/` — Organization (= tenant) CRUD
-   `workspace/` — Workspace CRUD, personal workspace on signup
-   `users/` — User management
-   `rbac/` — Owner, Admin, Member roles
-   `proxy/` — Forward engine calls, inject X-Workspace-Id header

**Reference:** `packages/server/src/enterprise/` has the existing implementation to reference.

---

## apps/web (Next.js)

**Status:** Not created yet
**Tech:** Next.js 15 (App Router)
**Port:** :3001 (target)

**Pages for v0.0:**

-   `/login` — auth form → NestJS /api/auth/login
-   `/register` — signup
-   `/dashboard` — list flows (via NestJS proxy)
-   `/canvas/[id]` — embeds Flowise flow builder from engine
-   `/settings` — profile/workspace settings

**Note:** Flow builder canvas is NOT rewritten — it embeds the existing Flowise React UI.

---

## apps/gateway (Nginx)

**Status:** Not created yet
**Tech:** Nginx (nginx:alpine)
**Port:** :443 public

**Routing rules:**

-   `/*` → web (:3001)
-   `/api/*` → api (:3000)
-   `/_engine/*` → blocked (internal only, never public)

---

## Data Services

### PostgreSQL

**Version:** 16+
**Extensions:** pgvector, uuid-ossp
**Used by:** api, engine
**Local:** Docker container
**Staging/Prod:** Azure Database for PostgreSQL (managed)

### Redis

**Version:** 7+
**Used by:** api (BullMQ queues, session cache, rate limiting)
**Local:** Docker container
**Staging/Prod:** Azure Cache for Redis or Upstash (managed)

### MinIO / Azure Blob Storage

**Used by:** engine (agent files, working data), future audit archive
**Local:** Docker (MinIO — S3-compatible)
**Staging/Prod:** Azure Blob Storage (native) or AWS S3
