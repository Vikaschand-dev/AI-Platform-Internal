# Known Issues

## #001 — column OrganizationUser.roleId does not exist

**Symptom:** Server crashes with `column OrganizationUser.roleId does not exist`

**Root cause:** `organization_user` table was created by the old custom NestJS code without `roleId`/`status` columns. Flowise enterprise entity expects them.

**Fix:** Delete all enterprise tables (or use a fresh DB) so Flowise migrations recreate them from scratch.

**Prevention:** Always use a fresh/clean database when switching to the Flowise enterprise migration chain.

---

## #002 — Login page appears at / on first start (expected)

**Symptom:** `http://localhost:3002/` shows `/signin` login page

**Root cause:** ENTERPRISE mode requires authentication — this is correct behavior.

**First-time flow:**

1. Go to `http://localhost:3002/register`
2. Enter Organisation Name, Your Name, Email, Password
3. Submit → org + admin user + default workspace created
4. Redirected to login → sign in

---

## #003 — Server starts on port 3000 instead of 3002

**Symptom:** Port 3000 used even though `PORT=3002` in `.env`

**Root cause 1:** `.env` is in the wrong folder (must be `packages/server/.env`, not root)  
**Root cause 2:** Flowise's `bin/run` script doesn't load `.env` before reading PORT

**Fix:** Confirm `packages/server/.env` exists and has `PORT=3002`. Check that `dotenv` is initialized before the HTTP server starts in `packages/server/src/index.ts`.

---

## #004 — csstype TypeScript error in @flowiseai/agentflow build

**Symptom:** `Type '"auto"' is not assignable to type 'AlignmentBaseline | undefined'` in `NodeOutputHandles.tsx`

**Root cause:** Two csstype versions installed (`3.1.3` wanted by agentflow, `3.2.3` pulled by other deps). TypeScript picks up the stricter `3.2.3` definitions.

**Fix:** `"csstype": "3.1.3"` in `pnpm.overrides` in root `package.json` ✅ (already applied)

---

## #005 — "Role not found" after login

**Symptom:** Login succeeds but immediately throws "Role not found"

**Root cause:** The `role` table doesn't have the general roles seeded (`owner`, `member`, `personal workspace`). These are inserted by the `RefactorEnterpriseDatabase1737076223692` migration.

**Fix:** Ensure all migrations ran completely. Check `migrations` table in PostgreSQL for any failed/missing entries. Drop enterprise tables and restart if needed.

---

## #006 — Database connection fails to Neon

**Symptom:** `ECONNREFUSED` or SSL errors connecting to Neon PostgreSQL

**Root cause 1:** `DATABASE_SSL=true` required but not set  
**Root cause 2:** Neon requires direct connection URL (not pooler) for TypeORM migrations

**Fix:** Confirm `DATABASE_SSL=true` in `packages/server/.env`. Use the direct host (`ep-lively-firefly-...`) not the pooler URL.
