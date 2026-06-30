# Accelance AI Platform — Claude Instructions

## Read This First

Before making any change, read the files in `rules/` to understand the current state of the project.
After making any change, update the relevant file in `rules/`.

**Rules folder:** `rules/`

-   `rules/architecture.md` — service layout, ports, decisions
-   `rules/changes.md` — log of every structural change made
-   `rules/services.md` — what each service does, where it lives, its status
-   `rules/known-issues.md` — bugs encountered and how they were resolved
-   `rules/shared-database-entities.md` — **CRITICAL: entity ownership + cross-service change checklist**

## Project Overview

Accelance AI Platform — a multi-tenant AI agent platform built on a Flowise OSS fork.
Root: `d:/Accelance AI Platform/AI-Platform-Internal/`

Current state: **Flowise 3.1.2** running in enterprise mode with PostgreSQL on Neon.
Enterprise auth is enabled via a `FLOWISE_PLATFORM=enterprise` env bypass (no license needed).

## Key Rules

-   Never modify files outside this repo
-   Always check `rules/changes.md` before starting work so you know what was already done
-   When a service breaks, check `rules/known-issues.md` first
-   `FLOWISE_PLATFORM=enterprise` in `packages/server/.env` enables enterprise auth — do not remove this
-   All auth flows use Flowise's built-in enterprise code — do not build custom auth
-   Shared TypeScript types live in `packages/shared` only
-   **After every step or change: run build + test and record the result**
-   **Save the full step plan to `rules/steps/` before touching any code**
-   **When you alter any entity/table, immediately check `rules/shared-database-entities.md`**
