import { Link } from 'react-router-dom'
import { UrlForm } from '../components/UrlForm'
import { ScoreGauges } from '../components/ScoreGauges'
import { FEATURED_PROJECTS, getProject } from '../data/projects'
import { RECOMMENDATION_LABELS } from '../types'

const sample = getProject('jqlang', 'jq')!
const featured = FEATURED_PROJECTS.filter((p) =>
  ['libexpat/libexpat', 'jqlang/jq', 'memcached/memcached', 'pnggroup/libpng', 'google/leveldb', 'yaml/libyaml'].includes(p.id),
)
const hard = [getProject('postgres', 'postgres'), getProject('FFmpeg', 'FFmpeg'), getProject('python', 'cpython')].filter(Boolean)
const outputs = [
  ['Decision', 'Should we do this at all?', 'A clear strategy: stop, extract a hotspot, replace a subsystem, clean-room, or full port.'],
  ['Effort', 'What will it actually cost?', 'P50–P90 engineering effort, CI/CD migration work, assumptions, and uncertainty.'],
  ['Upside', 'Where could Rust pay back?', 'Safety, concurrency, operability, and performance hypotheses — never invented speedups.'],
  ['First slice', 'What should ship first?', 'The smallest bounded migration that proves value before a rewrite program begins.'],
]

export function HomeV2() {
  return (
    <>
      <section className="hero hero-v2">
        <div className="container hero-grid">
          <div className="hero-copy">
            <p className="hero-kicker"><span />Rust migration intelligence for real engineering teams</p>
            <h1>Know if Rust is worth it <em>before you burn a year.</em></h1>
            <p className="hero-lead">Paste a public GitHub repository. Get a defensible recommendation, P50–P90 effort, likely upside, and the safest first migration slice — without executing its code.</p>
            <div className="hero-checks"><span>✓ No signup</span><span>✓ Decision-first</span><span>✓ P50 / P90 range</span><span>✓ Safest first slice</span></div>
            <UrlForm large autoFocus />
            <div className="hero-actions">
              <Link to="/projects" className="btn btn-secondary">Explore 100 scorecards</Link>
              <Link to="/methodology" className="btn btn-ghost">Inspect methodology →</Link>
            </div>
            <p className="hero-trust">Static analysis only · public repositories · no code execution</p>
          </div>

          <aside className="decision-preview" aria-label="Sample migration decision">
            <div className="product-window">
              <div className="product-window-bar">
                <div className="flex items-center gap-1"><div className="cmd-dots" aria-hidden><span /><span /><span /></div><span className="cmd-title">decision report · jqlang/jq</span></div>
                <span className="badge badge-rust">sample</span>
              </div>
              <div className="product-window-body">
                <div className="repo-head"><div className="repo-icon">jq</div><div><strong>jqlang/jq</strong><small>C · CLI / data processing</small></div><span className="badge badge-warn">conf {sample.estimate.confidence}</span></div>
                <div className="recommendation"><small>Recommended strategy</small><strong>{RECOMMENDATION_LABELS[sample.estimate.recommendation]}</strong><p>Prove value in the parser / execution hotspot, preserve the CLI contract, then benchmark.</p></div>
                <div className="metric-row">
                  <div><small>Opportunity</small><strong>{sample.estimate.opportunityScore}</strong><span>/100</span></div>
                  <div><small>Effort</small><strong>{sample.estimate.p50EngineerMonths}–{sample.estimate.p90EngineerMonths}</strong><span>eng-mo</span></div>
                  <div><small>CI/CD</small><strong>{sample.estimate.cicdLowDays}–{sample.estimate.cicdHighDays}</strong><span>days</span></div>
                </div>
                <div className="preview-gauges"><small>Why this recommendation</small><ScoreGauges estimate={sample.estimate} /></div>
                <div className="first-slice"><span><small>Safest first slice</small><strong>{sample.estimate.firstSlice.name}</strong></span><b aria-hidden>→</b><span><small>Success gate</small><strong>Benchmark + compatibility</strong></span></div>
                <Link to="/r/jqlang/jq" className="btn btn-primary btn-block">Open complete sample report</Link>
              </div>
            </div>
          </aside>
        </div>
        <div className="container"><div className="proof-strip proof-v2">
          <div className="proof-item"><div className="n">100</div><div className="l">seeded OSS cases</div></div>
          <div className="proof-item"><div className="n">3 axes</div><div className="l">upside · feasibility · commercial</div></div>
          <div className="proof-item"><div className="n">5 calls</div><div className="l">from stop to full port</div></div>
          <div className="proof-item"><div className="n">0 exec</div><div className="l">untrusted code never runs</div></div>
        </div></div>
      </section>

      <section className="section output-section"><div className="container">
        <div className="section-head"><p className="eyebrow">The output, not the pitch</p><h2>One report. Four executive answers.</h2><p>Enough structure to kill a bad rewrite — or fund a small, measurable one.</p></div>
        <div className="output-grid">{outputs.map(([label, title, body], i) => <article key={label}><div><b>0{i + 1}</b><span>{label}</span></div><h3>{title}</h3><p>{body}</p></article>)}</div>
      </div></section>

      <section className="section section-alt"><div className="container"><div className="anti-rewrite anti-v2">
        <div><p className="eyebrow">The anti-rewrite test</p><h2 className="mt-0">High Rust upside does not mean “rewrite everything.”</h2><p className="mb-0">Postgres, FFmpeg, and CPython show why. Rational teams extract a slice, add an extension, or stop.</p></div>
        <ul className="anti-rewrite-list">{hard.map((p) => <li key={p!.id}><Link to={`/r/${p!.owner}/${p!.repo}`}><span><strong>{p!.owner}/{p!.repo}</strong><small>{RECOMMENDATION_LABELS[p!.estimate.recommendation]}</small></span><span className="scores">upside {p!.estimate.rustUpside} · feas <em>{p!.estimate.migrationFeasibility}</em></span></Link></li>)}</ul>
      </div></div></section>

      <section className="section"><div className="container">
        <div className="section-head-row"><div className="section-head"><p className="eyebrow">Explore the decision space</p><h2>Cases where a first Rust slice might make sense</h2><p>Illustrative, comparable, and explicit about uncertainty.</p></div><Link to="/projects" className="btn btn-secondary btn-sm">Browse all 100 →</Link></div>
        <div className="card-grid cards-v2">{featured.map((p) => <Link key={p.id} to={`/r/${p.owner}/${p.repo}`} className="project-card"><div className="flex justify-between items-center"><span className="meta">{p.primaryLanguage} · {p.category}</span><span className="badge badge-warn">illustrative</span></div><h3>{p.owner}/{p.repo}</h3><p>{p.description}</p><div className="score-row"><span className="score-pill">Upside <strong>{p.estimate.rustUpside}</strong></span><span className="score-pill">Feas <strong>{p.estimate.migrationFeasibility}</strong></span><span className="score-pill">Comm <strong>{p.estimate.commercialSignal}</strong></span></div><div className="card-foot"><span className="badge badge-rust">{RECOMMENDATION_LABELS[p.estimate.recommendation]}</span><b aria-hidden>↗</b></div></Link>)}</div>
      </div></section>

      <section className="section section-alt"><div className="container"><div className="final-cta"><div><p className="eyebrow">Start with evidence</p><h2>Before the rewrite roadmap, run the decision report.</h2><p>Public scorecards are free. Private assessments add human architecture review, calibrated effort, and a benchmark plan.</p></div><div><a href="#analyze" className="btn btn-primary btn-lg">Analyze a public repo</a><Link to="/pricing" className="btn btn-secondary btn-lg">Private assessment</Link></div></div></div></section>
    </>
  )
}
