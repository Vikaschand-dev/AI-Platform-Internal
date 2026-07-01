# Step 02 — Render Deployment

**Status:** ✅ Config ready (2026-07-01)  
**Goal:** Deploy Accelance AI Platform to Render as a production web service.

---

## What was done

Created `render.yaml` at the repo root. Render reads this file automatically when the repo is connected — no manual service configuration needed.

### Build pipeline

```
npm install -g pnpm        →   installs pnpm in Render's Node environment
pnpm install               →   installs all workspace packages
pnpm build                 →   turbo builds server + UI + all packages
node packages/server/bin/run start   →   starts Express on PORT=3002
```

### Non-secret config (in render.yaml, safe to commit)

| Variable           | Value             | Why                             |
| ------------------ | ----------------- | ------------------------------- |
| `FLOWISE_PLATFORM` | `enterprise`      | Enables org/workspace/user auth |
| `PORT`             | `3002`            | Flowise server port             |
| `NODE_VERSION`     | `24.15.0`         | Matches .nvmrc                  |
| `DATABASE_TYPE`    | `postgres`        | PostgreSQL driver               |
| `DATABASE_SSL`     | `true`            | Required for Neon               |
| `STORAGE_TYPE`     | `local`           | Files to /tmp (ephemeral)       |
| `SECRETKEY_PATH`   | `/tmp/.accelance` | Writable on Render              |

### Secrets (must be set in Render dashboard)

| Variable                      | How to get it                                                              |
| ----------------------------- | -------------------------------------------------------------------------- |
| `DATABASE_HOST`               | Neon → Connection Details → Direct connection                              |
| `DATABASE_USER`               | Neon connection details                                                    |
| `DATABASE_PASSWORD`           | Neon connection details                                                    |
| `DATABASE_NAME`               | Neon connection details                                                    |
| `FLOWISE_SECRETKEY_OVERWRITE` | `openssl rand -hex 16` (exactly 32 chars)                                  |
| `JWT_AUTH_TOKEN_SECRET`       | `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"` |
| `JWT_REFRESH_TOKEN_SECRET`    | Same as above (run again)                                                  |
| `EXPRESS_SESSION_SECRET`      | Any strong random string                                                   |
| `APP_URL`                     | `https://accelance-ai-platform.onrender.com` (set after first deploy)      |

---

## Deploy steps

### 1. Push render.yaml to GitHub

```bash
git add render.yaml .env.example packages/server/.env.example CLAUDE.md rules/
git commit -m "Add Render deployment config"
git push
```

### 2. Create Render Web Service

1. Sign in at render.com
2. New → Web Service
3. Connect GitHub repository: `AI-Platform-Internal`
4. Render detects `render.yaml` and auto-fills: build command, start command, plan, region
5. Click **Continue** — do NOT deploy yet

### 3. Set secrets in Environment tab

In the service's Environment tab, add each `sync: false` variable from render.yaml:

-   DATABASE_HOST / USER / PASSWORD / NAME (from Neon → Direct connection)
-   FLOWISE_SECRETKEY_OVERWRITE (32 chars — `openssl rand -hex 16`)
-   JWT_AUTH_TOKEN_SECRET (64 hex chars)
-   JWT_REFRESH_TOKEN_SECRET (64 hex chars)
-   EXPRESS_SESSION_SECRET (any strong string)
-   APP_URL (set to `https://accelance-ai-platform.onrender.com`)
-   SMTP\_\* variables if email is needed

### 4. Deploy

Click **Deploy**. First build takes 8–12 min (pnpm install + turbo build).

Watch the build log for:

-   "Running migrations" → TypeORM is creating the PostgreSQL tables
-   "Server is listening on port 3002" → app is ready

### 5. First-time registration

Go to `https://accelance-ai-platform.onrender.com/register`

Fill: Organisation Name, Your Name, Email, Password → Submit.

First user becomes the OWNER.

---

## Post-deploy checklist

-   [ ] `APP_URL` set to the actual Render URL (for invite email links)
-   [ ] Verify `/register` creates the org and redirects to `/signin`
-   [ ] Test login at `/signin`
-   [ ] Create a workspace and invite a teammate (check SMTP if configured)

---

## Known limitations

### Storage is ephemeral

`STORAGE_TYPE=local` with `/tmp` means uploaded files (PDFs, images, etc.) are lost on every redeploy. For production:

```
STORAGE_TYPE=s3
S3_STORAGE_BUCKET_NAME=your-bucket
S3_STORAGE_ACCESS_KEY_ID=your-key
S3_STORAGE_SECRET_ACCESS_KEY=your-secret
S3_STORAGE_REGION=us-east-1
```

### Plan recommendation

| Plan     | RAM   | Cost   | Verdict                             |
| -------- | ----- | ------ | ----------------------------------- |
| Free     | 512MB | $0     | Spins down after 15 min, likely OOM |
| Starter  | 512MB | $7/mo  | Works for dev/testing               |
| Standard | 2GB   | $25/mo | Recommended for production          |

Flowise loads 200+ AI component packages at startup. The free tier (512MB) commonly OOMs during startup. Starter works for most dev/staging use cases.

### Cold starts (free + starter)

Starter plan stays on 24/7 (no spin-down). Free tier spins down after 15 min of inactivity and takes ~30 sec to wake up.

---

## Updating the deployment

Any `git push` to the connected branch triggers an automatic redeploy. The TypeORM migrations run automatically on each startup — no manual migration step needed.

To update env vars: Render dashboard → Environment → save → Manual deploy (or wait for next push).
