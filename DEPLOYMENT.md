# Deploying Veloce Digital.

One repo, two Cloudflare Pages projects, both via "Connect to Git" (classic
Pages, not Workers-with-assets) — matches the stack notes in the blueprint.

## web/ — the Astro site

1. Cloudflare dashboard → **Workers & Pages** → **Create application** →
   **Pages** tab → **Connect to Git** → select this repo.
2. **Root directory (advanced): `web`**. This is a monorepo — the repo root
   has no `package.json`. Miss this setting and the first build fails
   immediately looking for one.
3. Framework preset: **Astro** (auto-fills the two below once Root
   directory is set correctly):
   - Build command: `npm run build`
   - Build output directory: `dist`
4. Environment variables — Settings → Environment variables, set for
   **both Production and Preview** (they don't share values):
   - `SANITY_PROJECT_ID`
   - `SANITY_DATASET` — `production`
5. Node version is pinned via `web/.node-version` (22.12.0 — Astro 7's
   floor). Cloudflare reads it automatically; nothing to configure here.
   (Note: Cloudflare Pages does not honor `engines.node` in package.json —
   the version file is the one that works.)
6. Save and Deploy. The build will fail on purpose if `homePage` isn't
   published in Sanity yet, or if the env vars above are missing — see the
   error messages in `src/lib/sanity.ts`. Not a bug.
7. Custom domain: Project → Custom domains → add `velocedigital.co`
   (and `www` if you want one, redirected to the bare domain or vice versa).

## studio/ — Sanity Studio

Not built yet. Same "Connect to Git" flow when it exists: Root directory
`studio`, its own build command/output dir, custom domain
`cms.velocedigital.co`.

## velocedigital.pk → velocedigital.co

Out of scope for this repo — that's a DNS/zone-level redirect (a Cloudflare
Bulk Redirect or Redirect Rule on the .pk zone), not a `_redirects` file or
app code. Flag it once .pk's DNS is sitting in front of Cloudflare and I
can help set that up.
