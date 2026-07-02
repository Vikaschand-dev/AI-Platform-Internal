# Change Log

All structural changes to the project are logged here in reverse chronological order.

---

## 2026-07-02 — Email Template Accelance Theme

**Goal:** Replace Flowise black/white email design with Accelance blue+teal brand theme across all 8 email templates (16 files total: `.hbs` + `.html`).

**Changes to all 16 template files:**

- Background color: `#151719` (Flowise dark) → `#0f1729` (Accelance deep navy)
- `bgcolor="#000000"` → `bgcolor="#0f1729"`
- Background image: removed Flowise S3 SVG reference / accelance.io placeholder URL → CSS gradient `linear-gradient(135deg, #0f1729 0%, #1a2e6b 60%, #0d4a44 100%)`
- Logo image src: Flowise S3 PNG → `https://accelance.io/assets/logo-email-white.png` (HTML files; HBS files already had text logo from prior session)
- CTA button gradient: `linear-gradient(to right, #673ab7, #2563eb)` (purple→blue) → `linear-gradient(to right, #2563eb, #0d9488)` (blue→teal)
- CTA button background fallback: `#673ab7` / `#f9fafb` → `#2563eb` (Accelance primary blue)
- Dark mode button override: `#ED00EB` (magenta) → `#0d9488` (Accelance teal)
- SVG decorative gradient stop-color: `#5D5DFF` → `#2563eb`
- Salutation: "The FlowiseAI Team" → "The Accelance Team"
- Reset password body text: "FlowiseAI password/account" → "Accelance password/account"
- Social links: Twitter `FlowiseAI` → `accelanceai`, GitHub `FlowiseAI/Flowise` → `accelance-io/platform`

**Build result:** 7/7 tasks successful ✓

---

## 2026-07-02 — Rebranding Phase 8: Docs & Legal

**Goal:** Rename all Flowise references in README, docs, and legal files.

**Changes:**

- `README.md`: badges, image refs, Quick Start commands (`npx flowise` → `npx accelance`), Docker commands, dev setup `git clone` URL, env var table (`FLOWISE_FILE_SIZE_LIMIT` → `FILE_SIZE_LIMIT`, `FLOWISE_SECRETKEY_OVERWRITE` → `SECRETKEY_OVERWRITE`), default paths (`.flowise` → `.accelance`), docs link, self-host section, GitHub issue/discussion URLs
- `CONTRIBUTING.md`: project name, GitHub URLs, Discord link, package filter names (`flowise-components` → `accelance-components`, `@flowiseai/agentflow` → `@accelance/agentflow`), env var table, contact email `hello@flowiseai.com` → `hello@accelance.io`
- `CODE_OF_CONDUCT.md`: contact email → `hello@accelance.io`
- `SECURITY.md`: all Flowise→Accelance references; contact email `security-team@flowiseai.com` → `security@accelance.io`; cloud URL → `cloud.accelance.io`
- `LICENSE.md`: added Accelance copyright line; Flowise legal attribution lines retained (Apache License requires attribution preservation)
- `docker/README.md`: project name, DockerHub URL, paths, docs link
- `docker/worker/README.md`: project name, main server README link, entrypoint reference

**Build result:** 7/7 tasks successful ✓

---

## 2026-07-02 — Rebranding Phase 7: Docker Files

**Goal:** Rename all Flowise references in Dockerfiles and docker-compose files.

**Changes:**

- `Dockerfile` (root): comments + `WORKDIR /usr/src/flowise` → `/usr/src/accelance`
- `docker/Dockerfile`: `npm install -g flowise` → `accelance`; `ENTRYPOINT ["flowise","start"]` → `["accelance","start"]`
- `docker/worker/Dockerfile`: comment updated
- `docker/docker-compose.yml`: service name `flowise` → `accelance`; image `flowiseai/flowise:latest` → `accelance/accelance:latest`; volume path `~/.flowise` → `~/.accelance`; entrypoint `flowise start` → `accelance start`
- `docker/docker-compose-queue-prebuilt.yml`: service names, container names, images, network, volume paths, queue name defaults, entrypoints, env vars
- `docker/docker-compose-queue-source.yml`: service names, container names, network, volume paths, queue name defaults
- `docker/worker/docker-compose.yml`: image `flowiseai/flowise-worker:latest` → `accelance/accelance-worker:latest`; volume, env vars

**Env var renames applied in docker-compose files (to match Phase 5 server code):**
- `FLOWISE_EE_LICENSE_KEY` → `ACCELANCE_EE_LICENSE_KEY`
- `FLOWISE_SECRETKEY_OVERWRITE` → `SECRETKEY_OVERWRITE`
- `FLOWISE_FILE_SIZE_LIMIT` → `FILE_SIZE_LIMIT`
- `DISABLE_FLOWISE_TELEMETRY` → `DISABLE_TELEMETRY`

**Build result:** 7/7 tasks successful ✓

---

## 2026-07-02 — Rebranding Phase 6: Server Internal Code

**Goal:** Rename internal server error class and metrics identifiers from Flowise → Accelance.

**Changes:**

-   `packages/server/src/errors/internalFlowiseError/` folder renamed to `internalAccelanceError/`
-   `packages/server/src/errors/internalAccelanceError/index.ts`: class `InternalFlowiseError` → `InternalAccelanceError`
-   124 server `.ts` files: `InternalFlowiseError`/`internalFlowiseError` → `InternalAccelanceError`/`internalAccelanceError`
-   12 server `.ts` files: `FLOWISE_METRIC_COUNTERS`→`ACCELANCE_METRIC_COUNTERS`, `FLOWISE_COUNTER_STATUS`→`ACCELANCE_COUNTER_STATUS`
-   `packages/server/src/Interface.Metrics.ts`: enum names updated
-   `packages/server/src/metrics/Prometheus.ts`: metric names + prefix `flowise_`→`accelance_`
-   `packages/server/src/metrics/OpenTelemetry.ts`: metric names
-   `packages/server/src/DataSource.ts`: `.flowise`→`.accelance` default path
-   `packages/server/src/utils/index.ts`: `.flowise`→`.accelance` (×3 default paths)
-   `packages/server/src/enterprise/middleware/passport/SessionPersistance.ts`: `.flowise`→`.accelance`

**Known issue fixed:** PowerShell case-insensitive `-replace` produced `errors/InternalAccelanceError` (capital I) in import paths; fixed via case-sensitive `-creplace` across 123 files.

**Build result:** 7/7 tasks successful ✓

---

## 2026-07-01 — Accelance Brand Theme

**Goal:** Replace Flowise's default violet/purple theme with Accelance's blue+teal brand palette.

**Changes:**

-   `packages/ui/src/assets/scss/_themes-vars.module.scss` — Updated colour values only; no structural changes:
    -   Primary (light mode): `#2196f3` → `#2563eb` (Accelance brand blue), full scale adjusted to blue-100/300/600/700/800
    -   Secondary (light mode): replaced violet `#673ab7` with teal `#0d9488`, full scale adjusted to teal-100/300/600/700/800
    -   Secondary (dark mode): replaced violet `#7c4dff` with teal `#2dd4bf`, surface tones adjusted to match

**Key decisions:**

-   Only the SCSS colour vars were changed — all MUI component overrides and palette mappings reference variables, so zero structural risk.
-   Dark-mode primary (used for surface backgrounds, not brand colour) left untouched.

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
