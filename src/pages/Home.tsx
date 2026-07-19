import { Link } from 'react-router-dom'
import { UrlForm } from '../components/UrlForm'
import { ScoreGauges } from '../components/ScoreGauges'
import { FEATURED_PROJECTS, getProject } from '../data/projects'
import { RECOMMENDATION_LABELS } from '../types'

const sample = getProject('jqlang', 'jq')!

export function Home() {
  const featured = FEATURED_PROJECTS.slice(0, 6)

  return (
    <>
      <section className="hero">
        <div className="container hero-grid">
          <div>
            <p className="eyebrow">Rust It Up · migration scorecards</p>
            <h1>Should this repo be rewritten in Rust?</h1>
            <p className="hero-lead">
              Paste a GitHub URL. Get the business case, effort range, and safest first migration
              slice.
            </p>
            <UrlForm large />
            <div style={{ marginTop: '1.25rem' }}>
              <span className="trust-line">
                Static analysis first. We do not execute public repository code.
              </span>
            </div>
            <div className="flex flex-wrap gap-1" style={{ marginTop: '1.25rem' }}>
              <Link to="/projects" className="btn btn-secondary">
                Browse 100 examples
              </Link>
              <Link to="/methodology" className="btn btn-ghost">
                Read methodology
              </Link>
            </div>
          </div>
          <aside className="panel panel-raised" aria-label="Sample scorecard">
            <div className="flex justify-between items-center gap-1" style={{ marginBottom: '0.75rem' }}>
              <span className="badge badge-rust">Sample scorecard</span>
              <span className="mono muted" style={{ fontSize: '0.75rem' }}>
                jqlang/jq
              </span>
            </div>
            <ScoreGauges estimate={sample.estimate} />
            <div style={{ marginTop: '1rem' }}>
              <dl className="kv">
                <dt>Recommendation</dt>
                <dd>{RECOMMENDATION_LABELS[sample.estimate.recommendation]}</dd>
                <dt>P50–P90 effort</dt>
                <dd>
                  {sample.estimate.p50EngineerMonths}–{sample.estimate.p90EngineerMonths} eng-mo
                </dd>
                <dt>First slice</dt>
                <dd style={{ maxWidth: '18ch' }}>{sample.estimate.firstSlice.name}</dd>
              </dl>
            </div>
            <p className="muted" style={{ fontSize: '0.8rem', marginTop: '1rem', marginBottom: 0 }}>
              Opportunity Score {sample.estimate.opportunityScore} is a ranking aid — not truth.
              Ranges over false precision.
            </p>
            <Link to="/r/jqlang/jq" className="btn btn-secondary btn-sm" style={{ marginTop: '1rem' }}>
              Open full sample report
            </Link>
          </aside>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container">
          <div className="section-head">
            <h2>Inspect → Estimate → Decide</h2>
            <p>A disciplined path from public repo URL to a defensible migration call.</p>
          </div>
          <div className="steps">
            <div className="step">
              <div className="step-num">01 · Inspect</div>
              <h3>Repository snapshot</h3>
              <p>
                Metadata, language mix, interface boundaries, and test signals — without running
                untrusted code.
              </p>
            </div>
            <div className="step">
              <div className="step-num">02 · Estimate</div>
              <h3>Scores with evidence</h3>
              <p>
                Rust Upside, Migration Feasibility, and Commercial Signal. Effort as P50/P90
                ranges, not a single magic number.
              </p>
            </div>
            <div className="step">
              <div className="step-num">03 · Decide</div>
              <h3>Strategy, not slogans</h3>
              <p>
                Do not rewrite, extract a hotspot, replace a subsystem, clean-room, or full port —
                plus the safest first slice.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <h2>High Rust Upside ≠ rewrite everything</h2>
            <p>
              Postgres, FFmpeg, and CPython score high on upside and commercial signal — and very
              low on full-rewrite feasibility. The rational move is usually a bounded slice or no
              rewrite at all.
            </p>
          </div>
          <div className="card-grid">
            {[
              getProject('postgres', 'postgres'),
              getProject('FFmpeg', 'FFmpeg'),
              getProject('python', 'cpython'),
            ]
              .filter(Boolean)
              .map((p) => (
                <Link key={p!.id} to={`/r/${p!.owner}/${p!.repo}`} className="project-card">
                  <span className="meta">
                    Upside {p!.estimate.rustUpside} · Feasibility {p!.estimate.migrationFeasibility}
                  </span>
                  <h3>
                    {p!.owner}/{p!.repo}
                  </h3>
                  <p>{p!.description}</p>
                  <span className="badge badge-danger">
                    {RECOMMENDATION_LABELS[p!.estimate.recommendation]}
                  </span>
                </Link>
              ))}
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container">
          <div className="section-head">
            <h2>Featured opportunities</h2>
            <p>Launch examples with stronger illustrative cases for a first migration slice.</p>
          </div>
          <div className="card-grid">
            {featured.map((p) => (
              <Link key={p.id} to={`/r/${p.owner}/${p.repo}`} className="project-card">
                <span className="meta">
                  {p.primaryLanguage} · {p.category}
                </span>
                <h3>
                  {p.owner}/{p.repo}
                </h3>
                <p>{p.description}</p>
                <div className="score-row">
                  <span className="score-pill">
                    Upside <strong>{p.estimate.rustUpside}</strong>
                  </span>
                  <span className="score-pill">
                    Feasibility <strong>{p.estimate.migrationFeasibility}</strong>
                  </span>
                </div>
                <span className="badge badge-rust">
                  {RECOMMENDATION_LABELS[p.estimate.recommendation]}
                </span>
              </Link>
            ))}
          </div>
          <div style={{ marginTop: '1.5rem' }}>
            <Link to="/projects" className="btn btn-secondary">
              Browse all 100 examples
            </Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="panel panel-raised" style={{ display: 'grid', gap: '1rem' }}>
            <div className="flex justify-between items-center flex-wrap gap-2">
              <div>
                <p className="eyebrow" style={{ marginBottom: '0.4rem' }}>
                  Methodology teaser
                </p>
                <h2 className="mt-0">Deterministic scores. LLM only explains.</h2>
                <p className="mb-0" style={{ maxWidth: '60ch' }}>
                  Findings drive numbers. The model never invents LOC, dependencies, tests,
                  performance gains, or effort inputs. Cache by repo + commit + scanner version.
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
          <div className="panel" style={{ borderColor: 'var(--rust-dim)' }}>
            <p className="eyebrow">Verified Assessment</p>
            <h2>Private or production repositories</h2>
            <p>
              Human review, architecture map, calibrated effort range, benchmark plan, and a
              60-minute readout. Starting at $2,500.
            </p>
            <Link to="/pricing" className="btn btn-primary">
              View pricing
            </Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <h2>FAQ</h2>
          </div>
          <div className="faq">
            <details>
              <summary>Do you guarantee performance improvements?</summary>
              <p>
                No. Never. We show value hypotheses that require measurement, plus a benchmark plan.
                Ranges and confidence — not false precision.
              </p>
            </details>
            <details>
              <summary>Do you run my repository code?</summary>
              <p>
                No. Static analysis first. The GitHub Pages demo uses seed data and mocked scans; a
                future worker downloads archive snapshots without executing untrusted code.
              </p>
            </details>
            <details>
              <summary>What does Opportunity Score mean?</summary>
              <p>
                A ranking aid combining Upside, Feasibility, and Commercial Signal. It is not a
                single opaque “AI score” and not a decision by itself.
              </p>
            </details>
            <details>
              <summary>Why are seed pages labeled illustrative?</summary>
              <p>
                Precomputed examples are for orientation and marketing. They are not audited live
                scans of a specific commit unless labeled otherwise.
              </p>
            </details>
            <details>
              <summary>When is a full port recommended?</summary>
              <p>
                Rarely. Full rewrites need high upside, high feasibility, clear boundaries, and a
                buyer who can fund multi-year risk. Most rational plans extract a hotspot or replace
                a subsystem.
              </p>
            </details>
          </div>
        </div>
      </section>
    </>
  )
}
