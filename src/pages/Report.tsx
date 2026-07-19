import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { LeadForm } from '../components/LeadForm'
import { QuadrantMap } from '../components/QuadrantMap'
import { ScoreGauges } from '../components/ScoreGauges'
import { resolveProject } from '../lib/mockScan'
import {
  RECOMMENDATION_LABELS,
  VALUE_LABELS,
  effortTierFromP90,
  EFFORT_TIER_LABELS,
} from '../types'

export function Report() {
  const { owner = '', repo = '' } = useParams()
  const project = resolveProject(owner, repo)
  const e = project.estimate

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

  return (
    <div className="container page-pad">
      <div className="illustrative-banner" role="status">
        <div>
          <strong>Illustrative estimate — not an audited repository scan.</strong>
          <div className="muted" style={{ marginTop: '0.25rem' }}>
            Seed or mock analysis for orientation. Confidence: {e.confidence}. Model{' '}
            {e.modelVersion}. No guaranteed speedups or savings.
          </div>
        </div>
      </div>

      <header style={{ marginBottom: '1.5rem' }}>
        <p className="eyebrow">Public report</p>
        <h1 style={{ marginBottom: '0.35rem' }}>
          {project.owner}/{project.repo}
        </h1>
        <p className="mono muted" style={{ fontSize: '0.85rem' }}>
          {project.canonicalUrl} · branch {project.defaultBranch} · sha{' '}
          <code>{project.latestSha.slice(0, 12)}</code> · {project.primaryLanguage}
          {project.licenseSpdx ? ` · ${project.licenseSpdx}` : ''}
        </p>
        <p style={{ maxWidth: '62ch' }}>{project.description}</p>
      </header>

      <div className="verdict">
        <h2>
          Verdict: {RECOMMENDATION_LABELS[e.recommendation]}
        </h2>
        <p>
          Confidence <strong className="cream">{e.confidence}</strong> · Effort tier{' '}
          <strong className="cream">{EFFORT_TIER_LABELS[effortTierFromP90(e.p90EngineerMonths)]}</strong>{' '}
          · Opportunity Score <strong className="cream">{e.opportunityScore}</strong> (ranking aid)
        </p>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <ScoreGauges estimate={e} />
        <p className="muted" style={{ fontSize: '0.85rem', marginTop: '0.75rem' }}>
          Each score is explained by evidence below. This is not a single opaque “AI score.”
        </p>
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
            <p className="muted" style={{ fontSize: '0.85rem', marginBottom: 0, marginTop: '0.75rem' }}>
              P50 is a central planning case; P90 absorbs unknowns, integration, and verification
              drag. CI/CD covers packaging, dual-ship, and rollout harness — not just unit tests.
            </p>
          </section>

          <section className="panel panel-raised">
            <h3 className="mt-0">Smallest valuable migration</h3>
            <p className="cream" style={{ fontWeight: 600, marginBottom: '0.35rem' }}>
              {e.firstSlice.name}
            </p>
            <p>{e.firstSlice.rationale}</p>
            <div className="flex flex-wrap gap-1">
              <span className="badge">
                {e.firstSlice.estimatedWeeks[0]}–{e.firstSlice.estimatedWeeks[1]} weeks
              </span>
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
          </section>

          <section className="panel">
            <h3 className="mt-0">Architecture & evidence facts</h3>
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
            <h3 className="mt-0">Why these scores</h3>
            <ul style={{ margin: 0, paddingLeft: '1.1rem', color: 'var(--cream-dim)' }}>
              <li>
                <strong className="cream">Rust Upside {e.rustUpside}</strong> — potential for
                memory safety, operational, or distribution gains given domain and language — not a
                promise of speed.
              </li>
              <li>
                <strong className="cream">Migration Feasibility {e.migrationFeasibility}</strong> —
                boundary clarity, size, ABI/compat load, and testability of a first slice.
              </li>
              <li>
                <strong className="cream">Commercial Signal {e.commercialSignal}</strong> — production
                intensity, ecosystem centrality, and likelihood a buyer funds work.
              </li>
            </ul>
          </section>

          <section className="panel">
            <h3 className="mt-0">Value scenarios</h3>
            <div className="stack" style={{ gap: '0.75rem' }}>
              {e.valueScenarios.map((v) => (
                <div key={v.category} style={{ borderTop: '1px solid var(--line-soft)', paddingTop: '0.75rem' }}>
                  <div className="flex justify-between items-center gap-1">
                    <strong className="cream">{VALUE_LABELS[v.category] ?? v.label}</strong>
                    <span className="badge">conf {v.confidence}</span>
                  </div>
                  <p style={{ margin: '0.35rem 0 0', fontSize: '0.9rem' }}>{v.hypothesis}</p>
                  {v.requiresBenchmark && (
                    <p className="muted" style={{ fontSize: '0.8rem', margin: '0.35rem 0 0' }}>
                      Requires measurement before claiming improvement.
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>

          <section className="panel">
            <h3 className="mt-0">Blockers & unknowns</h3>
            <ul style={{ margin: 0, paddingLeft: '1.1rem' }}>
              {e.blockers.map((b) => (
                <li key={b.title} style={{ marginBottom: '0.6rem', color: 'var(--cream-dim)' }}>
                  <strong className="cream">{b.title}</strong>
                  <span className={`badge badge-${b.severity === 'high' ? 'danger' : b.severity === 'medium' ? 'warn' : 'ok'}`} style={{ marginLeft: '0.5rem' }}>
                    {b.severity}
                  </span>
                  <div style={{ fontSize: '0.9rem' }}>{b.detail}</div>
                </li>
              ))}
            </ul>
          </section>

          <section className="panel">
            <h3 className="mt-0">Benchmark plan</h3>
            <ol style={{ margin: 0, paddingLeft: '1.2rem', color: 'var(--cream-dim)' }}>
              {e.benchmarkPlan.map((step) => (
                <li key={step.name} style={{ marginBottom: '0.5rem' }}>
                  <strong className="cream">{step.name}</strong>
                  <div style={{ fontSize: '0.9rem' }}>{step.description}</div>
                </li>
              ))}
            </ol>
          </section>

          <section className="panel">
            <h3 className="mt-0">Assumptions</h3>
            <ul style={{ margin: 0, paddingLeft: '1.1rem', color: 'var(--cream-dim)' }}>
              {e.assumptions.map((a) => (
                <li key={a} style={{ marginBottom: '0.35rem' }}>
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

          <LeadForm projectKey={project.id} requestType="email_unlock" />

          <section className="panel" style={{ borderColor: 'var(--rust-dim)' }}>
            <h3 className="mt-0">Get a verified assessment</h3>
            <p>
              For a private or production repository: human review, architecture map, calibrated
              effort range, benchmark plan, and a 60-minute readout.
            </p>
            <Link to="/pricing" className="btn btn-primary" style={{ width: '100%' }}>
              Verified Assessment from $2,500
            </Link>
          </section>

          <section className="panel">
            <h3 className="mt-0">Share</h3>
            <p className="muted" style={{ fontSize: '0.85rem' }}>
              Title pattern: How long would it take to rewrite {project.repo} in Rust?
            </p>
            <div className="flex flex-wrap gap-1">
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => navigator.clipboard?.writeText(shareUrl)}
              >
                Copy link
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
            <h3 className="mt-0">Related</h3>
            <div className="stack" style={{ gap: '0.4rem' }}>
              <Link to="/projects">Browse 100 examples</Link>
              <Link to="/methodology">Methodology</Link>
              <Link to="/compare">Compare repositories</Link>
              <Link to="/">Analyze another URL</Link>
            </div>
          </section>
        </aside>
      </div>
    </div>
  )
}
