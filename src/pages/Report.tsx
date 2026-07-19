import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { LeadForm } from '../components/LeadForm'
import { QuadrantMap } from '../components/QuadrantMap'
import { ScoreBars, ScoreGauges } from '../components/ScoreGauges'
import { resolveProject } from '../lib/mockScan'
import {
  RECOMMENDATION_LABELS,
  VALUE_LABELS,
  effortTierFromP90,
  EFFORT_TIER_LABELS,
  quadrantLabel,
  quadrantOf,
} from '../types'

export function Report() {
  const { owner = '', repo = '' } = useParams()
  const project = resolveProject(owner, repo)
  const e = project.estimate
  const [copied, setCopied] = useState(false)
  const quadrant = quadrantOf(e.rustUpside, e.migrationFeasibility)

  useEffect(() => {
    document.title = `How long would it take to rewrite ${project.repo} in Rust? · Rust It Up`
    const desc = `${RECOMMENDATION_LABELS[e.recommendation]}. P50–P90 ${e.p50EngineerMonths}–${e.p90EngineerMonths} eng-mo. Illustrative estimate.`
    let meta = document.querySelector('meta[name="description"]')
    if (!meta) {
      meta = document.createElement('meta')
      meta.setAttribute('name', 'description')
      document.head.appendChild(meta)
    }
    meta.setAttribute('content', desc)
    return () => {
      document.title = 'Rust It Up — Should this repo be rewritten in Rust?'
    }
  }, [project, e])

  const shareUrl =
    typeof window !== 'undefined'
      ? window.location.href
      : `https://zozo123.github.io/rust-it-up/r/${project.owner}/${project.repo}`

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="container page-pad">
      <div className="report-sticky">
        <div>
          <div className="repo">
            {project.owner}/{project.repo}
          </div>
          <div className="muted" style={{ fontSize: '0.72rem', marginTop: '0.1rem' }}>
            {RECOMMENDATION_LABELS[e.recommendation]} · {quadrantLabel(quadrant)}
          </div>
        </div>
        <div className="mini-scores">
          <span>
            ↑ <strong>{e.rustUpside}</strong>
          </span>
          <span>
            feas <strong>{e.migrationFeasibility}</strong>
          </span>
          <span>
            comm <strong>{e.commercialSignal}</strong>
          </span>
          <span>
            p50–p90{' '}
            <strong>
              {e.p50EngineerMonths}–{e.p90EngineerMonths}
            </strong>
          </span>
        </div>
        <div className="flex gap-1">
          <button type="button" className="btn btn-secondary btn-sm" onClick={copyLink}>
            {copied ? 'Copied' : 'Copy link'}
          </button>
          <Link to="/pricing" className="btn btn-primary btn-sm">
            Verified
          </Link>
        </div>
      </div>

      <div className="illustrative-banner" role="status">
        <div>
          <strong>Illustrative estimate — not an audited repository scan.</strong>
          <div className="muted" style={{ marginTop: '0.25rem' }}>
            Confidence: {e.confidence} · model {e.modelVersion} · no guaranteed speedups or savings
          </div>
        </div>
      </div>

      <header style={{ marginBottom: '1.15rem' }}>
        <p className="eyebrow">Public report</p>
        <h1 style={{ marginBottom: '0.3rem' }}>
          {project.owner}/{project.repo}
        </h1>
        <p className="mono muted" style={{ fontSize: '0.8rem', marginBottom: '0.65rem' }}>
          <a href={project.canonicalUrl} target="_blank" rel="noreferrer">
            {project.canonicalUrl.replace('https://', '')}
          </a>
          {' · '}
          {project.defaultBranch} @ <code>{project.latestSha.slice(0, 12)}</code>
          {' · '}
          {project.primaryLanguage}
          {project.licenseSpdx ? ` · ${project.licenseSpdx}` : ''}
        </p>
        <p style={{ maxWidth: '62ch', marginBottom: 0 }}>{project.description}</p>
      </header>

      <div className="verdict">
        <div className="flex justify-between items-start flex-wrap gap-1">
          <h2 style={{ marginBottom: 0 }}>
            Verdict: {RECOMMENDATION_LABELS[e.recommendation]}
          </h2>
          <span className="badge badge-rust">{quadrantLabel(quadrant)}</span>
        </div>
        <p style={{ marginTop: '0.45rem' }}>
          Confidence <strong className="cream">{e.confidence}</strong>
          {' · '}
          Effort{' '}
          <strong className="cream">
            {EFFORT_TIER_LABELS[effortTierFromP90(e.p90EngineerMonths)]}
          </strong>
          {' · '}
          Opportunity <strong className="cream">{e.opportunityScore}</strong>
          <span className="muted"> (ranking aid)</span>
        </p>
      </div>

      <div className="product-window" style={{ marginBottom: '1.15rem' }}>
        <div className="product-window-bar">
          <span className="cmd-title">scores · three axes, not one AI number</span>
          <span className="badge">0–100</span>
        </div>
        <div className="product-window-body">
          <ScoreGauges estimate={e} />
          <div className="divider" />
          <ScoreBars estimate={e} />
        </div>
      </div>

      <div className="report-grid">
        <div className="stack">
          <section className="panel">
            <h3 className="mt-0">Effort & delivery</h3>
            <dl className="kv">
              <dt>P50 engineer-months</dt>
              <dd>{e.p50EngineerMonths}</dd>
              <dt>P90 engineer-months</dt>
              <dd>{e.p90EngineerMonths}</dd>
              <dt>CI/CD & release (days)</dt>
              <dd>
                {e.cicdLowDays}–{e.cicdHighDays}
              </dd>
              <dt>Commercial Signal</dt>
              <dd>{e.commercialSignal}/100</dd>
            </dl>
            <p className="muted" style={{ fontSize: '0.82rem', marginBottom: 0, marginTop: '0.75rem' }}>
              Plan to P90. CI/CD includes packaging, dual-ship, and rollout — not just unit tests.
            </p>
          </section>

          <section className="panel panel-raised">
            <div className="flex justify-between items-center gap-1" style={{ marginBottom: '0.35rem' }}>
              <h3 className="mt-0 mb-0">Smallest valuable migration</h3>
              <span
                className={`badge ${
                  e.firstSlice.risk === 'high'
                    ? 'badge-danger'
                    : e.firstSlice.risk === 'medium'
                      ? 'badge-warn'
                      : 'badge-ok'
                }`}
              >
                risk {e.firstSlice.risk}
              </span>
            </div>
            <p className="cream" style={{ fontWeight: 600, marginBottom: '0.35rem', fontSize: '1.02rem' }}>
              {e.firstSlice.name}
            </p>
            <p style={{ marginBottom: '0.65rem' }}>{e.firstSlice.rationale}</p>
            <span className="badge">
              {e.firstSlice.estimatedWeeks[0]}–{e.firstSlice.estimatedWeeks[1]} weeks
            </span>
          </section>

          <section className="panel">
            <h3 className="mt-0">Architecture & evidence</h3>
            {e.architectureFacts.length === 0 ? (
              <p className="muted mb-0">No structured architecture facts in this seed record.</p>
            ) : (
              <dl className="kv">
                {e.architectureFacts.map((f) => (
                  <div key={f.label} style={{ display: 'contents' }}>
                    <dt>{f.label}</dt>
                    <dd>{f.value}</dd>
                  </div>
                ))}
              </dl>
            )}
          </section>

          <section className="panel">
            <h3 className="mt-0">Value scenarios</h3>
            <div className="stack" style={{ gap: '0.65rem' }}>
              {e.valueScenarios.map((v, i) => (
                <div
                  key={v.category}
                  style={{
                    borderTop: i === 0 ? undefined : '1px solid var(--line-soft)',
                    paddingTop: i === 0 ? 0 : '0.65rem',
                  }}
                >
                  <div className="flex justify-between items-center gap-1">
                    <strong className="cream">{VALUE_LABELS[v.category] ?? v.label}</strong>
                    <span className="badge">conf {v.confidence}</span>
                  </div>
                  <p style={{ margin: '0.3rem 0 0', fontSize: '0.88rem' }}>{v.hypothesis}</p>
                  {v.requiresBenchmark && (
                    <p className="muted" style={{ fontSize: '0.76rem', margin: '0.3rem 0 0' }}>
                      Requires measurement before claiming improvement.
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>

          <section className="panel">
            <h3 className="mt-0">Blockers & unknowns</h3>
            <ul style={{ margin: 0, paddingLeft: '1.05rem' }}>
              {e.blockers.map((b) => (
                <li key={b.title} style={{ marginBottom: '0.55rem', color: 'var(--cream-dim)' }}>
                  <strong className="cream">{b.title}</strong>
                  <span
                    className={`badge badge-${
                      b.severity === 'high' ? 'danger' : b.severity === 'medium' ? 'warn' : 'ok'
                    }`}
                    style={{ marginLeft: '0.45rem' }}
                  >
                    {b.severity}
                  </span>
                  <div style={{ fontSize: '0.88rem', marginTop: '0.15rem' }}>{b.detail}</div>
                </li>
              ))}
            </ul>
          </section>

          <section className="panel">
            <h3 className="mt-0">Benchmark plan</h3>
            <ol style={{ margin: 0, paddingLeft: '1.15rem', color: 'var(--cream-dim)' }}>
              {e.benchmarkPlan.map((step) => (
                <li key={step.name} style={{ marginBottom: '0.45rem' }}>
                  <strong className="cream">{step.name}</strong>
                  <div style={{ fontSize: '0.88rem' }}>{step.description}</div>
                </li>
              ))}
            </ol>
          </section>

          <section className="panel">
            <h3 className="mt-0">Assumptions</h3>
            <ul style={{ margin: 0, paddingLeft: '1.05rem', color: 'var(--cream-dim)' }}>
              {e.assumptions.map((a) => (
                <li key={a} style={{ marginBottom: '0.3rem', fontSize: '0.9rem' }}>
                  {a}
                </li>
              ))}
            </ul>
          </section>

          {e.comparableRust.length > 0 && (
            <section className="panel">
              <h3 className="mt-0">Comparable Rust projects / ports</h3>
              <div className="flex flex-wrap gap-1">
                {e.comparableRust.map((c) => (
                  <span key={c} className="chip" style={{ cursor: 'default' }}>
                    {c}
                  </span>
                ))}
              </div>
            </section>
          )}
        </div>

        <aside className="stack">
          <section className="panel">
            <h3 className="mt-0">Strategy map</h3>
            <QuadrantMap upside={e.rustUpside} feasibility={e.migrationFeasibility} />
          </section>

          <div className="term-block">
            <div>
              <span className="dim">repo</span> {project.owner}/{project.repo}
            </div>
            <div>
              <span className="hl">verdict</span> {e.recommendation}
            </div>
            <div>
              <span className="ok">slice</span> {e.firstSlice.name}
            </div>
            <div>
              <span className="warn">effort</span> {e.p50EngineerMonths}–{e.p90EngineerMonths} eng-mo
            </div>
          </div>

          <LeadForm projectKey={project.id} requestType="email_unlock" />

          <section className="panel panel-rust">
            <h3 className="mt-0">Private or production?</h3>
            <p style={{ fontSize: '0.9rem' }}>
              Human review, architecture map, calibrated range, benchmark plan, 60-minute readout.
            </p>
            <Link to="/pricing" className="btn btn-primary btn-block">
              Verified Assessment · from $2,500
            </Link>
          </section>

          <section className="panel">
            <h3 className="mt-0">Share</h3>
            <p className="muted" style={{ fontSize: '0.82rem' }}>
              How long would it take to rewrite {project.repo} in Rust?
            </p>
            <div className="flex flex-wrap gap-1">
              <button type="button" className="btn btn-secondary btn-sm" onClick={copyLink}>
                {copied ? 'Copied' : 'Copy link'}
              </button>
              <a
                className="btn btn-secondary btn-sm"
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                  `Should ${project.owner}/${project.repo} be rewritten in Rust?`,
                )}&url=${encodeURIComponent(shareUrl)}`}
                target="_blank"
                rel="noreferrer"
              >
                Share on X
              </a>
            </div>
          </section>

          <section className="panel">
            <h3 className="mt-0">Next</h3>
            <div className="stack" style={{ gap: '0.35rem' }}>
              <Link to="/">Analyze another URL</Link>
              <Link to="/projects">Browse 100 examples</Link>
              <Link to="/compare">Compare repositories</Link>
              <Link to="/methodology">Methodology</Link>
            </div>
          </section>
        </aside>
      </div>
    </div>
  )
}
