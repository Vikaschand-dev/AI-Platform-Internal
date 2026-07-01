# Change Log

All structural changes to the project are logged here in reverse chronological order.

---

## 2026-07-01 — Render Deployment

**Goal:** Deploy Accelance AI Platform to Render as a web service.

**Changes:**

-   `render.yaml` — Created at repo root. Render IaC config: Node 24.15.0, starter plan, build/start commands, non-secret env vars inline, secrets flagged `sync: false` for manual dashboard entry.
-   `.env.example` (root) — Rewrote to remove deleted `apps/` references, align variable names with Flowise conventions.
-   `packages/server/.env.example` — Prepended Accelance quickstart block (FLOWISE_PLATFORM=enterprise pre-set, PORT=3002, REQUIRED/OPTIONAL sections, secret generation commands).
-   `CLAUDE.md` — Added Developer Setup section with 5-command quickstart.
-   `rules/steps/02-render-deployment.md` — Step documentation.

**Key decisions:**

-   `STORAGE_TYPE=local` with `/tmp` path — files are ephemeral (lost on redeploy). Acceptable for MVP; switch to S3 for production.
-   `FLOWISE_SECRETKEY_OVERWRITE` — secrets flag, must be set before first deploy to prevent credential decryption failure.
-   `plan: starter` — free tier (512MB) will likely OOM when Flowise loads 200+ components. Starter ($7/mo) is minimum viable.

---

## 2026-06-30 — Enterprise Auth Enable + PostgreSQL

**Goal:** Enable org/workspace/user management with PostgreSQL (no Flowise license)

**Changes:**

-   `packages/server/src/IdentityManager.ts` — Added `FLOWISE_PLATFORM` check at start of `_validateLicenseKey()`. If `FLOWISE_PLATFORM=enterprise`, sets `Platform.ENTERPRISE` and returns immediately, bypassing license validation.
-   `packages/server/.env` — Created (gitignored): `FLOWISE_PLATFORM=enterprise`, `PORT=3002`, PostgreSQL/Neon credentials, JWT secrets, SMTP/Brevo config
-   `CLAUDE.md` — Recreated (was deleted in revert)
-   `rules/` — Created: architecture.md, changes.md, services.md, known-issues.md, shared-database-entities.md
-   `rules/steps/01-enterprise-auth-setup.md` — Step documentation

**Result:**

-   Server runs on port 3002
-   PostgreSQL connected (TypeORM migrations run automatically on first startup)
-   Enterprise auth: registration at `/register`, login at `/signin`, workspaces, user invites

---

## 2026-06-29 — Full Revert to Original Flowise 3.1.2

**Goal:** Remove all previous custom code, restore clean Flowise 3.1.2

**What was deleted:**

-   `apps/` — custom NestJS API + Next.js frontend
-   `rules/` — previous architecture docs
-   `CLAUDE.md` — previous instructions
-   `docker-compose.yml`
-   `packages/server/src/accelance/` — custom engine mode code
-   `packages/server/src/middlewares/trustEngineHeaders.ts`
-   `packages/server/src/middlewares/canvasBootstrap.ts`
-   `packages/server/src/enterprise/database/entities/invite.entity.ts`
-   `scripts/` — custom DB migration scripts
-   `packages/server/.env` — had leftover PORT=3002 + ACCELANCE_ENGINE_MODE=true

**What was restored:**

-   `packages/server/src/index.ts` — via `git checkout 12937a5 -- packages/server/`
-   All enterprise auth files — restored to original Flowise state
-   `packages/server/src/enterprise/database/entities/organization-user.entity.ts`
-   `packages/server/src/enterprise/database/entities/workspace-user.entity.ts`

**Remaining intentional differences vs original Flowise:**

-   `package.json` — `"csstype": "3.1.3"` in pnpm.overrides (fixes agentflow build)
-   `packages/ui/index.html` — "Accelance" branding (pre-existing, kept)
-   `packages/ui/src/views/chatflows/EmbedChat.jsx` — Accelance branding (pre-existing, kept)
-   `packages/shared/` — empty scaffold (harmless, not imported by anything)

---

## 2026-06-25 — Initial Flowise 3.1.2 Fork

**Goal:** Fork Flowise 3.1.2 as the base for Accelance AI Platform

Commit: `12937a5 First commit`
