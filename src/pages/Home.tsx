import { Link } from 'react-router-dom'
import { UrlForm } from '../components/UrlForm'
import { ScoreGauges } from '../components/ScoreGauges'
import { FEATURED_PROJECTS, getProject } from '../data/projects'
import { RECOMMENDATION_LABELS } from '../types'

const sample = getProject('jqlang', 'jq')!

export function Home() {
  const featured = FEATURED_PROJECTS.filter((p) =>
    ['libexpat/libexpat', 'jqlang/jq', 'memcached/memcached', 'pnggroup/libpng', 'google/leveldb', 'yaml/libyaml'].includes(
      p.id,
    ),
  )

  const hard = [
    getProject('postgres', 'postgres'),
    getProject('FFmpeg', 'FFmpeg'),
    getProject('python', 'cpython'),
  ].filter(Boolean)

  return (
    <>
      <section className="hero">
        <div className="container hero-grid">
          <div>
            <p className="eyebrow">Rust migration scorecards</p>
            <h1>Should this repo be rewritten in Rust?</h1>
            <p className="hero-lead">
              Paste a GitHub URL. Get the business case, effort range, and safest first slice — not
              a vibe-based “rewrite it in Rust” take.
            </p>
            <UrlForm large autoFocus />
            <div className="hero-actions">
              <Link to="/projects" className="btn btn-secondary">
                Browse 100 examples
              </Link>
              <Link to="/methodology" className="btn btn-ghost">
                How scoring works
              </Link>
            </div>
            <div style={{ marginTop: '1.1rem' }}>
              <span className="trust-line">
                Static analysis first. We do not execute public repository code.
              </span>
            </div>
          </div>

          <aside aria-label="Sample scorecard">
            <div className="product-window">
              <div className="product-window-bar">
                <div className="flex items-center gap-1">
                  <div className="cmd-dots" aria-hidden>
                    <span />
                    <span />
                    <span />
                  </div>
                  <span className="cmd-title">report · jqlang/jq</span>
                </div>
                <span className="badge badge-rust">sample</span>
              </div>
              <div className="product-window-body">
                <div className="flex justify-between items-center gap-1" style={{ marginBottom: '0.85rem' }}>
                  <div>
                    <div className="mono cream" style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                      jqlang/jq
                    </div>
                    <div className="muted" style={{ fontSize: '0.75rem', marginTop: '0.15rem' }}>
                      {RECOMMENDATION_LABELS[sample.estimate.recommendation]} · conf{' '}
                      {sample.estimate.confidence}
                    </div>
                  </div>
                  <span className="badge badge-warn">illustrative</span>
                </div>
                <ScoreGauges estimate={sample.estimate} />
                <div className="divider" />
                <dl className="kv">
                  <dt>P50–P90 effort</dt>
                  <dd>
                    {sample.estimate.p50EngineerMonths}–{sample.estimate.p90EngineerMonths} eng-mo
                  </dd>
                  <dt>CI/CD days</dt>
                  <dd>
                    {sample.estimate.cicdLowDays}–{sample.estimate.cicdHighDays}
                  </dd>
                  <dt>First slice</dt>
                  <dd style={{ maxWidth: '16ch', whiteSpace: 'normal', textAlign: 'right' }}>
                    {sample.estimate.firstSlice.name}
                  </dd>
                </dl>
                <div className="term-block" style={{ marginTop: '0.9rem' }}>
                  <div>
                    <span className="dim">$</span> rust-it-up decide jqlang/jq
                  </div>
                  <div>
                    <span className="ok">→</span> strategy{' '}
                    <span className="hl">extract_hotspot</span>
                  </div>
                  <div>
                    <span className="dim">→</span> opp score{' '}
                    <span className="warn">{sample.estimate.opportunityScore}</span>
                    <span className="dim"> (ranking aid, not truth)</span>
                  </div>
                </div>
                <Link
                  to="/r/jqlang/jq"
                  className="btn btn-secondary btn-sm btn-block"
                  style={{ marginTop: '0.9rem' }}
                >
                  Open full sample report
                </Link>
              </div>
            </div>
          </aside>
        </div>

        <div className="container">
          <div className="proof-strip" role="list">
            <div className="proof-item" role="listitem">
              <div className="n">100</div>
              <div className="l">seeded OSS examples, searchable</div>
            </div>
            <div className="proof-item" role="listitem">
              <div className="n">3 axes</div>
              <div className="l">Upside · Feasibility · Commercial</div>
            </div>
            <div className="proof-item" role="listitem">
              <div className="n">P50 / P90</div>
              <div className="l">effort ranges, not a single number</div>
            </div>
            <div className="proof-item" role="listitem">
              <div className="n">0 exec</div>
              <div className="l">no untrusted code runs in v1</div>
            </div>
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container">
          <div className="section-head">
            <h2>Inspect → Estimate → Decide</h2>
            <p>A disciplined path from public URL to a call you can defend in a staff meeting.</p>
          </div>
          <div className="steps">
            <div className="step">
              <div className="step-num">01 · Inspect</div>
              <h3>Snapshot, not sandbox</h3>
              <p>
                Metadata, languages, boundaries, tests — archive static analysis. No running
                strangers’ build scripts.
              </p>
            </div>
            <div className="step">
              <div className="step-num">02 · Estimate</div>
              <h3>Scores with receipts</h3>
              <p>
                Deterministic inputs → three scores + P50/P90. An LLM may explain findings later;
                it never invents LOC or speedups.
              </p>
            </div>
            <div className="step">
              <div className="step-num">03 · Decide</div>
              <h3>Strategy, not slogans</h3>
              <p>
                Do not rewrite · extract hotspot · replace subsystem · clean-room · full port — and
                the safest first slice.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="anti-rewrite">
            <div>
              <p className="eyebrow">The anti-BS section</p>
              <h2 className="mt-0">High Rust Upside ≠ rewrite everything</h2>
              <p className="mb-0">
                Postgres, FFmpeg, and CPython look amazing on “why Rust” and terrible on full-port
                feasibility. Rational teams ship a slice, an extension, or nothing — not a multi-year
                clone fantasy.
              </p>
            </div>
            <ul className="anti-rewrite-list">
              {hard.map((p) => (
                <li key={p!.id}>
                  <Link to={`/r/${p!.owner}/${p!.repo}`}>
                    <span>
                      {p!.owner}/{p!.repo}
                    </span>
                    <span className="scores">
                      ↑{p!.estimate.rustUpside} · feas{' '}
                      <em>{p!.estimate.migrationFeasibility}</em>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container">
          <div className="section-head-row">
            <div className="section-head">
              <h2>Where a first slice might actually make sense</h2>
              <p>Illustrative cases with clearer boundaries — still labeled, still not audited.</p>
            </div>
            <Link to="/projects" className="btn btn-secondary btn-sm">
              View all 100
            </Link>
          </div>
          <div className="card-grid">
            {featured.map((p) => (
              <Link key={p.id} to={`/r/${p.owner}/${p.repo}`} className="project-card">
                <div className="flex justify-between items-center">
                  <span className="meta">
                    {p.primaryLanguage} · {p.category}
                  </span>
                  <span className="badge badge-warn">illustrative</span>
                </div>
                <h3>
                  {p.owner}/{p.repo}
                </h3>
                <p>{p.description}</p>
                <div className="score-row">
                  <span className="score-pill">
                    Upside <strong>{p.estimate.rustUpside}</strong>
                  </span>
                  <span className="score-pill">
                    Feas <strong>{p.estimate.migrationFeasibility}</strong>
                  </span>
                  <span className="score-pill">
                    Comm <strong>{p.estimate.commercialSignal}</strong>
                  </span>
                </div>
                <span className="badge badge-rust">
                  {RECOMMENDATION_LABELS[p.estimate.recommendation]}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="panel panel-raised">
            <div className="flex justify-between items-center flex-wrap gap-2">
              <div style={{ maxWidth: '58ch' }}>
                <p className="eyebrow" style={{ marginBottom: '0.4rem' }}>
                  Methodology in one line
                </p>
                <h2 className="mt-0">Findings drive numbers. Models only narrate.</h2>
                <p className="mb-0">
                  Cache by repo + commit + scanner version. Opportunity Score is a sort key — never
                  present it as an “AI score.”
                </p>
              </div>
              <Link to="/methodology" className="btn btn-primary">
                Full methodology
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container">
          <div className="panel panel-rust">
            <div className="flex justify-between items-start flex-wrap gap-2">
              <div>
                <p className="eyebrow">For private / production</p>
                <h2 className="mt-0">Verified Assessment</h2>
                <p style={{ maxWidth: '48ch' }}>
                  Human review, architecture map, calibrated effort, benchmark plan, 60-minute
                  readout. From <strong className="cream">$2,500</strong>. Pilots are quote-only —
                  we don’t invent a fake package price.
                </p>
              </div>
              <Link to="/pricing" className="btn btn-primary">
                See pricing
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <h2>FAQ — short answers only</h2>
          </div>
          <div className="faq">
            <details>
              <summary>Do you guarantee performance improvements?</summary>
              <p>
                No. Never. Value hypotheses require measurement. We ship ranges, confidence, and a
                benchmark plan.
              </p>
            </details>
            <details>
              <summary>Do you run my repository code?</summary>
              <p>
                No. Static analysis first. This Pages demo uses seed data + mocks; a future worker
                downloads archive snapshots without executing untrusted code.
              </p>
            </details>
            <details>
              <summary>What is Opportunity Score?</summary>
              <p>
                A ranking aid (≈ 0.45×Upside + 0.3×Feasibility + 0.25×Commercial). Useful for sorting
                the directory — not a decision by itself.
              </p>
            </details>
            <details>
              <summary>Why “illustrative” on seed pages?</summary>
              <p>
                Precomputed examples orient you. They are not audited live scans of a pinned commit
                unless labeled otherwise.
              </p>
            </details>
            <details>
              <summary>When is a full port the answer?</summary>
              <p>
                Rarely. You need high upside, high feasibility, clear boundaries, and a buyer who
                can fund multi-year risk. Most rational plans extract a hotspot or replace a
                subsystem.
              </p>
            </details>
          </div>
        </div>
      </section>
    </>
  )
}
