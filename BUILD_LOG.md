# AI Factory Learning Suite — Build Log

Audit trail for Plan → Act → Validate → Refine loops. One entry per unit of work.

---

## 2026-08-08 — M0 Foundations scaffold

### PLAN
- Restate: Scaffold production Next.js app for Tutor + Coach agents with shared Azure OpenAI wrapper, UST brand tokens, auth scaffolding, streaming plumbing, and BUILD_LOG.
- Test cases written first:
  - Unit: content index lookup returns expected resources / empty for unknown topics
  - Unit: rubric selection by artifact type returns draft criteria
  - Unit: level-to-prompt mapping injects Beginner/Intermediate/Advanced instructions
  - Unit: input validation rejects empty tutor/coach payloads
  - Integration: `/api/tutor` and `/api/coach` return typed error for empty input; mock stream path works without Azure keys
- Acceptance (M0): hello-world streamed chat path exists; auth layer ready; design tokens applied; lint/typecheck clean

### Assumptions (defaults pending stakeholder confirmation — Section 3)
1. **Architecture**: one Next.js app, routes `/tutor` and `/coach` (Section 5 default).
2. **Auth**: Azure AD via `next-auth`; `AUTH_BYPASS=true` allowed for local/dev until tenant details are provided.
3. **Branding**: full UST brand tokens (teal palette, Source Sans 3 / Source Serif 4 substitutes).
4. **Content index**: static curated lookup for v1 (no LMS API yet).
5. **Coach rubric**: draft starter rubric flagged `DRAFT — needs review` (not authoritative).
6. **Coach file upload**: deferred to v1.1 (text paste only).
7. **History**: session-only; no cross-device persistence for v1.
8. **Data handling**: no conversation persistence to DB in M0; LLM calls only to configured Azure OpenAI resource.
9. **Legacy**: existing GAMA Mentigo static app moved to `legacy/gama-mentigo/` (reference only).

### ACT
- Created `apps/web` Next.js 15 App Router + TypeScript + Tailwind.
- Added UST tokens, shared shell, Tutor/Coach UI shells, Azure OpenAI wrapper with mock stream fallback, next-auth Azure AD provider, OpenTelemetry-ready logging stubs, prompts/contentIndex/rubric, unit + API tests, eval stubs.

### VALIDATE
- `npm test` — 21/21 passed (contentIndex, rubric, prompts, validation, API routes with mock stream)
- `npm run typecheck` — clean
- `npm run lint` — clean
- `npm run build` — success; routes `/`, `/tutor`, `/coach`, `/api/tutor`, `/api/coach`, `/api/auth/[...nextauth]`

### REFINE
- Removed nested `apps/web/package-lock.json` to avoid dual-lockfile Turbopack root warning
- Demo stream path confirmed for unconfigured Azure OpenAI (M0 hello-world streaming UX)
