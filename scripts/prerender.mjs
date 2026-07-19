// Post-build prerender for GitHub Pages (static host, no SSR).
//
// The app is a client-rendered SPA, so link unfurlers and crawlers that do not
// run JS would otherwise see the homepage <head> for every route. This script
// stamps route-specific title / description / Open Graph / Twitter / canonical
// tags into a copy of the built dist/index.html for each known route, and emits
// sitemap.xml. Report bodies still hydrate client-side; only <head> is per-route.
//
// Zero extra dependencies: the seed data is transpiled with the TypeScript
// compiler already in devDependencies (src/data/projects.ts has only a
// type-only import, so it transpiles standalone).

import { readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import ts from 'typescript'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const DIST = join(ROOT, 'dist')
const BASE = '/rust-it-up'
const ORIGIN = 'https://zozo123.github.io'
const SITE = `${ORIGIN}${BASE}`

async function loadModule(relPath) {
  const src = readFileSync(join(ROOT, relPath), 'utf8')
  const js = ts.transpileModule(src, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  }).outputText
  const tmp = join(DIST, `.prerender-${relPath.replace(/[^a-z0-9]/gi, '_')}.mjs`)
  writeFileSync(tmp, js)
  try {
    return await import(pathToFileURL(tmp).href)
  } finally {
    rmSync(tmp, { force: true })
  }
}

const esc = (s) =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

/** Replace the content="" of a <meta> matched by an attr (name|property) key.
 *  Uses a function replacer so '$' in the value (e.g. "$2,500") is inserted
 *  literally rather than treated as a String.replace backreference. */
function setMeta(html, attr, key, value) {
  const v = esc(value)
  const re = new RegExp(`(<meta[^>]*\\b${attr}="${key}"[^>]*\\bcontent=")[^"]*(")`, 'i')
  if (re.test(html)) return html.replace(re, (_m, p1, p2) => p1 + v + p2)
  const re2 = new RegExp(`(<meta[^>]*\\bcontent=")[^"]*("[^>]*\\b${attr}="${key}")`, 'i')
  return html.replace(re2, (_m, p1, p2) => p1 + v + p2)
}

function stamp(template, { title, description, path }) {
  const url = `${SITE}${path}`
  let html = template
  html = html.replace(/<title>[\s\S]*?<\/title>/i, () => `<title>${esc(title)}</title>`)
  html = html.replace(
    /(<link rel="canonical" href=")[^"]*(")/i,
    (_m, p1, p2) => p1 + esc(url) + p2,
  )
  html = setMeta(html, 'name', 'description', description)
  html = setMeta(html, 'property', 'og:title', title)
  html = setMeta(html, 'property', 'og:description', description)
  html = setMeta(html, 'property', 'og:url', url)
  html = setMeta(html, 'name', 'twitter:title', title)
  html = setMeta(html, 'name', 'twitter:description', description)
  return html
}

function write(path, html) {
  const outDir = join(DIST, path)
  mkdirSync(outDir, { recursive: true })
  writeFileSync(join(outDir, 'index.html'), html)
}

const template = readFileSync(join(DIST, 'index.html'), 'utf8')

const { PROJECTS } = await loadModule('src/data/projects.ts')
const { RECOMMENDATION_LABELS } = await loadModule('src/types/index.ts')

const staticRoutes = [
  {
    path: '/projects',
    title: '100 open-source migration examples',
    description:
      'Browse 100 illustrative Rust-migration scorecards. Filter by language, strategy, effort tier, and opportunity score.',
  },
  {
    path: '/compare',
    title: 'Compare repositories',
    description: 'Compare up to three repositories side by side: scores, effort, strategy, risks, and likely buyer signal.',
  },
  {
    path: '/methodology',
    title: 'Methodology',
    description:
      'How Rust It Up scores upside, feasibility, and commercial signal — static analysis first, ranges over false precision.',
  },
  {
    path: '/pricing',
    title: 'Pricing',
    description: 'Free public scorecards. Verified Assessments from $2,500 add human architecture review and a benchmark plan.',
  },
]

for (const r of staticRoutes) write(r.path, stamp(template, r))

const reportRoutes = PROJECTS.map((p) => {
  const e = p.estimate
  return {
    path: `/r/${p.owner}/${p.repo}`,
    title: `Should ${p.owner}/${p.repo} be rewritten in Rust?`,
    description: `${RECOMMENDATION_LABELS[e.recommendation]}. Upside ${e.rustUpside}, feasibility ${e.migrationFeasibility}. P50–P90 ${e.p50EngineerMonths}–${e.p90EngineerMonths} eng-mo. Illustrative estimate — not an audited scan.`,
  }
})

for (const r of reportRoutes) write(r.path, stamp(template, r))

// sitemap.xml — homepage, static routes, and every seeded report route.
const urls = ['/', ...staticRoutes.map((r) => r.path), ...reportRoutes.map((r) => r.path)]
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${SITE}${u === '/' ? '/' : u}</loc></url>`).join('\n')}
</urlset>
`
writeFileSync(join(DIST, 'sitemap.xml'), sitemap)

console.log(
  `prerender: ${staticRoutes.length} static + ${reportRoutes.length} report routes, sitemap with ${urls.length} urls`,
)
