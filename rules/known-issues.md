# Known Issues

When the app breaks, check here first.

---

## Template

```
## [DATE] — Issue Title
**Service:** which service broke
**Symptom:** what error or behavior you see
**Root cause:** what was actually wrong
**Fix:** what was changed to fix it
**Files changed:** list of files
```

---

## 2026-06-25 — cookie-parser import in NestJS

**Service:** apps/api
**Symptom:** `TS2349: This expression is not callable. Type 'typeof cookieParser' has no call signatures`
**Root cause:** `import * as cookieParser from 'cookie-parser'` creates a namespace import in TypeScript strict mode — namespace imports can't be called as functions.
**Fix:** Use `import cookieParser = require('cookie-parser')` instead
**Files changed:** `apps/api/src/main.ts`

<!-- Add issues below as they are encountered -->
