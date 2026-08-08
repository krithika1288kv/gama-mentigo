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

### Windows: styles missing

This app now uses **plain CSS** with UST brand tokens (no Tailwind), so Windows does not need special native packages.

1. Stop the server (`Ctrl + C`).
2. In GitHub Desktop: **Fetch origin** → **Pull origin**.
3. Double-click `scripts\fix-windows.bat`  
   (or run `rmdir /s /q node_modules` then `rmdir /s /q apps\web\node_modules` then `rmdir /s /q apps\web\.next` then `npm install` then `npm run dev`)
4. Hard-refresh the browser: `Ctrl + F5` on http://localhost:3000

You should see a soft off-white background and teal navigation/buttons.

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
