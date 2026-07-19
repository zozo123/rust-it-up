# Rust It Up

> Should this repo be rewritten in Rust?

**Rust It Up** is a polished developer SaaS scorecard product (product name / concept: *RustThisRepo*). Paste a public GitHub URL and get an evidence-oriented report: Rust Upside, Migration Feasibility, Commercial Signal, strategy recommendation, P50/P90 effort ranges, CI/CD effort, and the safest first migration slice.

**Live (GitHub Pages):** https://zozo123.github.io/rust-it-up/

## Product principles

- Never promise performance without measurement
- Show ranges and confidence, not false precision
- Static analysis first — we do not execute public repository code
- Seed pages labeled: **Illustrative estimate — not an audited repository scan**
- LLM (future worker) only explains findings; it never invents LOC, deps, tests, gains, or effort inputs

## Stack (this repo)

| Layer | Implementation |
| --- | --- |
| UI | Vite + React + TypeScript + React Router |
| Hosting | GitHub Pages (`/rust-it-up/` base path) |
| Scan API | Mocked client (`src/lib/mockScan.ts`) + `localStorage` |
| Seed data | 100 illustrative projects (`src/data/projects.ts`) |
| Schema | Supabase SQL + RLS ready (`supabase/migrations/001_init.sql`) |

Lovable/Supabase can become the product shell later. The UI boundary is explicit so a container worker + Inngest can plug in without rewriting pages.

## Pages

| Route | Purpose |
| --- | --- |
| `/` | Landing, URL form, sample scorecard, FAQ |
| `/scan/:scanId` | Job progress (queued → complete), refresh-safe in-browser |
| `/r/:owner/:repo` | Shareable report |
| `/projects` | Searchable 100-example directory + compare selection |
| `/compare` | Up to 3-way comparison |
| `/methodology` | Scoring & limitations |
| `/pricing` | Free scorecard + Verified Assessment from $2,500 |
| `/admin` | Demo dashboard (scans, leads, signals) |

**Admin demo password:** `rustitup` (local only — replace with Supabase Auth).

## Develop

```bash
npm install
npm run dev
```

## Build & deploy

```bash
npm run build
npm run deploy   # gh-pages → origin gh-pages branch
```

GitHub Pages: Settings → Pages → Deploy from branch `gh-pages` / root.

## Architecture (target production)

```
Browser → Edge Function (validate, upsert project, create scan)
       → Inngest / queue
       → Worker (archive snapshot, static analysis, scores)
       → findings + estimates tables
       → LLM synthesizes narrative from findings only
```

Cache key: `owner/repo + commit_sha + scanner_version`.

## CI (planned)

On every PR in parallel: format/lint, typecheck, unit tests, production build, migration checks, Playwright smoke (landing, URL submit, report, lead form), dependency/secret scan. Target 7–14 minutes feedback.

## License

MIT — demo content and estimates are illustrative only.
