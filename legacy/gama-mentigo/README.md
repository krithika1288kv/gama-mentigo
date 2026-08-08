# GAMA Mentigo — Deployment Guide (no git install needed)

This guide uses only your browser. No command line, no git install.

---

## Part 1 — Put the code on GitHub

1. Go to https://github.com and log in (create a free account if you don't have one).
2. Click the **+** icon (top right) → **New repository**.
3. Name it `gama-mentigo`. Keep it **Public** (required for free Netlify deploys) or **Private** (also works, just one extra click later). Do NOT add a README/gitignore — leave it empty. Click **Create repository**.
4. On the new repo's page, click **uploading an existing file** (a link in the middle of the page).
5. Drag in **every file and folder** from this project, keeping the folder structure:
   - `index.html`
   - `netlify.toml`
   - `package.json`
   - `data/modules.json`
   - `netlify/functions/chat.js`
   - (GitHub's drag-and-drop preserves folder structure if you drag the whole `data` and `netlify` folders in at once.)
6. Scroll down, click **Commit changes**.

Your code is now on GitHub. No git command ever touched your machine.

---

## Part 2 — Get your Anthropic API key

1. Go to https://console.anthropic.com and log in / sign up.
2. Go to **Settings → Billing** and add a small amount of credit (e.g. $10).
3. **Set a hard spending limit** while you're there: **Settings → Billing → Usage limits** — set a monthly cap (e.g. $10). This is your safety net — once hit, the API simply stops responding, no bill beyond it, no need to monitor anyone.
4. Go to **Settings → API Keys → Create Key**. Copy the key (starts with `sk-ant-...`). You won't be able to see it again, so paste it somewhere safe for the next step.

---

## Part 3 — Deploy to Netlify

1. Go to https://app.netlify.com and log in (you can sign up with your GitHub account — one click).
2. Click **Add new site → Import an existing project**.
3. Choose **GitHub**, authorize Netlify if asked, then select your `gama-mentigo` repo.
4. Build settings: leave everything as detected (publish directory `.`, functions directory `netlify/functions`). Click **Deploy**.
5. Once it's deployed (takes ~1 minute), go to **Site configuration → Environment variables**.
6. Click **Add a variable**:
   - Key: `ANTHROPIC_API_KEY`
   - Value: paste the key from Part 2
   - Click **Create variable**.
7. Go to **Deploys** tab → **Trigger deploy → Deploy site** (so it picks up the new environment variable).
8. Once redeployed, click the site URL at the top (something like `https://random-name-123.netlify.app`). Your tutor is live.

**Optional:** In **Site configuration → Domain management**, you can rename the site (e.g. `gama-mentigo.netlify.app`) or connect a custom domain — still free.

---

## What each file does

| File | Purpose |
|---|---|
| `index.html` | The whole chat interface — module picker, quick-mode buttons, chat window. Pure HTML/CSS/JS, no build step. |
| `netlify/functions/chat.js` | Runs on Netlify's server. Holds your API key (hidden from users), builds the tutor's instructions for whichever module is selected, and calls the Claude API. |
| `data/modules.json` | Your 7 modules' content (concepts, misconceptions, Socratic question banks, practice exercises) — extracted from your Deliverable spreadsheets. |
| `netlify.toml` | Tells Netlify where the site files and functions live. |

---

## Safety limits already built in

- **Model:** Claude Haiku 4.5 — the cheapest current model, well-suited to this kind of guided coaching.
- **Max reply length:** capped at 400 tokens per response, so no single reply can balloon in cost.
- **Session cap:** each browser session is capped at 24 messages; after that it asks the learner to refresh and start a new session.
- **Spending cap:** whatever you set in Part 2, step 3 — Anthropic enforces this automatically.

At current pricing this works out to roughly **$0.02–0.04 per full session**, so a $10 cap covers several hundred sessions.

---

## Updating content later

If you want to edit what the tutor knows (add examples, fix a concept explanation, etc.), edit `data/modules.json` directly on GitHub (click the file → pencil icon → edit → commit). Netlify will auto-redeploy within a minute.

## Making changes to the design or behavior

Come back to this conversation, tell me what to change, and I'll update the files — you can then re-upload just the changed file(s) to GitHub the same way (drag-and-drop, commit).
