# New Developer Setup — Accelance AI Platform

## What you're running

A single Express.js server (Flowise 3.1.2 fork) with enterprise auth enabled, backed by PostgreSQL on Neon. There is no Docker, no Redis, no separate frontend — one process at `localhost:3002`.

---

## Prerequisites

| Tool    | Version | Install                                |
| ------- | ------- | -------------------------------------- |
| Node.js | 24.x    | `nvm install 24.15.0 && nvm use`       |
| pnpm    | latest  | `corepack enable` (after Node install) |
| Git     | any     | —                                      |

---

## Step 1 — Clone and install

```bash
git clone <repo-url>
cd AI-Platform-Internal
corepack enable
pnpm install
```

---

## Step 2 — Get a Neon database

1. Sign up at [neon.tech](https://neon.tech) — free, no credit card
2. Create a new project
3. Go to **Connection Details** → select **Direct connection** (NOT the pooler — TypeORM migrations require it)
4. Copy the host, user, password, and database name

---

## Step 3 — Create your `.env` file

```bash
cp packages/server/.env.example packages/server/.env
```

Open `packages/server/.env` and fill in these **required** values:

```env
# Must stay exactly as-is — enables enterprise auth
FLOWISE_PLATFORM=enterprise
PORT=3002

# Neon database — use Direct connection (not pooler)
DATABASE_TYPE=postgres
DATABASE_HOST=your-project.c-9.us-east-1.aws.neon.tech
DATABASE_PORT=5432
DATABASE_USER=neondb_owner
DATABASE_PASSWORD=your_neon_password
DATABASE_NAME=neondb
DATABASE_SSL=true

# Local paths — change to real absolute paths on your machine
SECRETKEY_PATH=C:/Users/yourname/.accelance
BLOB_STORAGE_PATH=C:/Users/yourname/.accelance/storage
STORAGE_TYPE=local

# Generate each secret individually:
#   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
# Run that command 3 separate times — never reuse values.
JWT_AUTH_TOKEN_SECRET=<64-char hex>
JWT_REFRESH_TOKEN_SECRET=<different 64-char hex>
EXPRESS_SESSION_SECRET=<any strong random string>
```

> **Windows path tip:** Use forward slashes (`C:/Users/...`) or double backslashes (`C:\\Users\\...`).

> **SECRETKEY_PATH warning:** This folder stores encryption keys for saved credentials. If you wipe it, any credentials stored in the DB become unreadable. Pick a stable path.

---

## Step 4 — Build

```bash
pnpm build
```

This builds all packages (server + components + UI). Takes 2–5 minutes on first run.

---

## Step 5 — Start

```bash
cd packages/server
node bin/run start
```

Or from the repo root:

```bash
pnpm start:windows   # Windows
pnpm start:default   # Linux / Mac
```

On first start, TypeORM migrations run automatically and create all tables in your Neon DB.

---

## Step 6 — Register your admin account

The `/` route shows a login page — this is expected. You need to register first.

1. Go to `http://localhost:3002/register`
2. Fill in:
    - **Organisation Name:** Accelance AI Platform
    - **Your Name:** your name
    - **Email:** your work email
    - **Password:** strong password
3. Submit → you are now the `OWNER` (org admin)
4. Sign in at `http://localhost:3002/signin`

> Only the **first** registration creates an org. After that, new users must be invited by an admin.

---

## Step 7 — Invite teammates (optional)

In the UI: workspace settings → Members → Invite

Or via API (while logged in):

```http
POST http://localhost:3002/api/v1/account/invite
Content-Type: application/json
Cookie: <your session cookie>

{
  "user": { "email": "colleague@accelance.io" },
  "workspace": { "id": "<workspaceId>" },
  "role": { "id": "<roleId>" }
}
```

Without SMTP configured, the invite link is printed to the server console instead of emailed.

---

## Common errors

| Error                                           | Likely cause                           | Fix                                                                  |
| ----------------------------------------------- | -------------------------------------- | -------------------------------------------------------------------- |
| Port 3000 instead of 3002                       | `.env` in wrong location               | Confirm file is at `packages/server/.env`                            |
| `ECONNREFUSED` on Neon                          | SSL not set                            | Confirm `DATABASE_SSL=true`                                          |
| `column OrganizationUser.roleId does not exist` | Old schema in DB                       | Drop all enterprise tables and restart (migrations recreate them)    |
| `Role not found` after login                    | Migrations didn't fully run            | Check `migrations` table in Neon; drop enterprise tables and restart |
| Login page at `/` on first start                | Normal — enterprise mode requires auth | Go to `/register` first                                              |

---

## Key files to know

| File                                       | Purpose                                           |
| ------------------------------------------ | ------------------------------------------------- |
| `packages/server/.env`                     | Your local config (gitignored — never commit)     |
| `packages/server/src/IdentityManager.ts`   | Enterprise mode bypass (`FLOWISE_PLATFORM` check) |
| `packages/server/src/DataSource.ts`        | TypeORM DB connection                             |
| `packages/server/src/enterprise/services/` | Auth, org, workspace, invite logic                |
| `rules/`                                   | Project decisions, architecture, known issues     |

---

## What to read next

-   `rules/architecture.md` — service layout and decisions
-   `rules/services.md` — what the server does and all its routes
-   `rules/known-issues.md` — bugs already encountered and solved
-   `rules/changes.md` — log of every structural change made to the repo
