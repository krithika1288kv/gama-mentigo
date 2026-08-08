# UST AI Factory Learning Suite

Production web app for the **Tutor Agent** and **Coach Agent** — AI Factory learning tools for UST employees.

## Apps

| Path | Description |
|------|-------------|
| `apps/web` | Next.js 15 (App Router) — `/tutor`, `/coach`, shared Azure OpenAI gateway |
| `legacy/gama-mentigo` | Prior static Netlify tutor (reference only) |

## Quick start

**Mac / Linux**

```bash
npm install
cp apps/web/.env.example apps/web/.env.local
npm run dev
```

**Windows (Command Prompt)**

```bat
npm install
copy apps\web\.env.example apps\web\.env.local
npm run dev
```

Open http://localhost:3000

Without Azure OpenAI credentials, Tutor/Coach run in **demo stream mode** so UI and plumbing can be validated.

### Windows fix: `lightningcss.win32-x64-msvc.node` missing

If the browser shows a Build Error about `lightningcss.win32-x64-msvc.node`:

1. Stop the server (`Ctrl + C`).
2. In the project folder, run:

```bat
npm config delete os
rmdir /s /q node_modules
rmdir /s /q apps\web\node_modules
rmdir /s /q apps\web\.next
npm install
npm install lightningcss-win32-x64-msvc --workspace=web
npm run dev
```

3. If it still fails, install [Microsoft Visual C++ Redistributable (x64)](https://aka.ms/vs/17/release/vc_redist.x64.exe), then run `npm run dev` again.

## Scripts

```bash
npm run dev        # Next.js dev server
npm run test       # Vitest unit + API tests
npm run lint       # ESLint
npm run typecheck  # tsc --noEmit
npm run build      # production build
```

## Architecture (confirmed default)

- Single Next.js app, routes `/tutor` and `/coach`
- All LLM calls via `apps/web/src/lib/azureOpenAI.ts`
- Prompts in `apps/web/src/lib/prompts/`
- Static content index + draft coach rubric (flagged for review)
- Auth: Azure AD (`next-auth`) with optional `AUTH_BYPASS` for local/dev

See `BUILD_LOG.md` for Plan → Act → Validate → Refine audit trail and open assumptions.

## Milestones

- **M0** Foundations (this scaffold)
- **M1** Tutor Agent v1
- **M2** Coach Agent v1
- **M3** Production hardening
- **M4** Pilot review checkpoint
