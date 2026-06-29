# Step 06 — Nginx Gateway Config (apps/gateway)

**Status:** COMPLETE ✓
**Date started:** 2026-06-29
**Depends on:** Step 05 ✓ (Next.js web shell)
**Unblocks:** Step 07 (Docker Compose — wire all services together)

---

## Goal

Replace the Step 01 placeholder `apps/gateway/nginx.conf` with a production-ready
routing config. The gateway is the sole public entry point; everything else is internal.

**Files changed:**

-   `apps/gateway/nginx.conf` — full config (was a placeholder)
-   `rules/services.md` — gateway status → complete
-   `rules/architecture.md` — gateway status → complete
-   `rules/changes.md` — Step 06 logged

---

## Routing Rules

| Path prefix | Upstream    | Notes                                                              |
| ----------- | ----------- | ------------------------------------------------------------------ |
| `/auth/*`   | api:3000    | Rate-limited (5 req/min per IP)                                    |
| `/api/*`    | api:3000    | NestJS proxies `/api/v1/*` to engine internally; SSE buffering off |
| `/_engine/` | — (blocked) | 403 — engine is internal only                                      |
| `/*`        | web:3001    | Next.js catch-all; WebSocket upgrade for HMR                       |

---

## Design Decisions

**Port 80 as primary (not 443)**
In production we sit behind Cloudflare which terminates TLS. Cloudflare forwards plain
HTTP to the gateway on port 80 — same config as local dev. No certs needed on the
container. The 443 direct-TLS block is in the file but commented out.

**`proxy_set_header Connection ""` pattern for keepalive**
Using a `map` directive so WebSocket connections (Upgrade header present) get
`Connection: upgrade`, and regular requests get `Connection: ""` (clears hop-by-hop
header, preserving upstream keepalive pool).

**`proxy_buffering off` on `/api/`**
LLM streaming responses use SSE — buffering would hold the response until complete
before forwarding. Disabled so tokens arrive at the browser as they stream.

**Rate limiting on `/auth/`**
5 req/min per IP, burst 20. Protects register/login/password-reset from brute force.
Doesn't apply to `/api/` (would break polling frontends).

---

## Build + Verify

Nginx has no build step but the config can be validated:

```bash
docker run --rm \
  -v "$(pwd)/apps/gateway/nginx.conf:/etc/nginx/nginx.conf:ro" \
  nginx:alpine nginx -t
```

Expected output:

```
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

Full smoke test (Step 07 — Docker Compose): all services running, `curl http://localhost/nginx-health` returns 200.

---

## Next Step

→ Step 07: Docker Compose — wire gateway, api, web, engine, postgres, redis together
