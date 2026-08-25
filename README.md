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

## Live AI answers (OpenRouter workaround)

1. Create a key at https://openrouter.ai/keys  
2. Open `apps/web/.env.local` and set:

```env
OPENROUTER_API_KEY=sk-or-v1-your-key-here
OPENROUTER_MODEL=openai/gpt-4o-mini
AUTH_BYPASS=true
NEXT_PUBLIC_AUTH_BYPASS=true
```

3. Restart the app (`Ctrl+C`, then `npm run dev` or `scripts\fix-windows.bat`)  
4. Refresh http://localhost:3000 — the demo banner should disappear

Provider order: **OpenRouter → Anthropic → Azure OpenAI → demo**.  
Never commit API keys. If a key was pasted into chat, rotate it in the provider console.

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
