# Architecture — Accelance AI Platform

## Status: v0.0 In Progress

## Service Map

| Service | Tech               | Port  | Network  | Hosted          | Status   |
| ------- | ------------------ | ----- | -------- | --------------- | -------- |
| gateway | Nginx              | :80   | public   | TBD (see below) | Complete |
| web     | Next.js 15         | :3001 | internal | TBD             | Complete |
| api     | NestJS 10          | :3000 | internal | TBD             | Complete |
| engine  | Flowise (stripped) | :3002 | internal | TBD             | Complete |

## Data Services

| Service    | Version | Purpose                          | Option A (Docker)  | Option B (Cloud Managed)        |
| ---------- | ------- | -------------------------------- | ------------------ | ------------------------------- |
| PostgreSQL | 16+     | Primary DB for all services      | postgres:16-alpine | Azure Database for PostgreSQL   |
| Redis      | 7+      | Queues (BullMQ), cache, sessions | redis:7-alpine     | Azure Cache for Redis / Upstash |
| MinIO/S3   | latest  | Files, audit archive             | minio/minio        | Azure Blob Storage / AWS S3     |

**Decision on data services:** Cloud-managed preferred for staging/prod (no container overhead, managed backups, HA built-in).
For local dev: Docker Compose runs all three locally.

## Monorepo Layout

```
AI-Platform-Internal/
├── apps/
│   ├── gateway/          # Nginx config
│   ├── web/              # Next.js product UI
│   ├── api/              # NestJS — auth, tenancy, proxy
│   └── engine/           # Flowise stripped (AI execution only)
├── packages/
│   ├── shared/           # TypeScript types (all services import from here)
│   ├── components/       # LangChain node integrations (from Flowise)
│   └── [other Flowise packages]
├── rules/                # This folder — Claude reads/writes here
├── CLAUDE.md             # Claude entry point
└── docker-compose.yml    # Local dev only
```

## Coupling Rules

-   Services communicate over HTTP only — never import each other's code
-   `engine` trusts `X-Workspace-Id` header injected by `api` — no self-auth in engine
-   `packages/shared` is the only code shared across services
-   Engine has NO public IP — only reachable from `api` on internal network

## Why Docker for App Services (local dev)

For **local development**: Docker Compose runs everything consistently across developer machines.
For **staging/prod**: App services (gateway, web, api, engine) can run as:

-   Azure Container Apps (recommended — serverless, auto-scale)
-   Azure App Service (simpler, less flexible)
-   Docker on a VM (cheapest, most control)
-   Kubernetes (from v0.5+ when Temporal is added)

Data services (Postgres, Redis, Blob) should be **cloud-managed** from staging onward.
