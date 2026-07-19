import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { saveLead, uid } from '../lib/storage'

export function Pricing() {
  const [email, setEmail] = useState('')
  const [company, setCompany] = useState('')
  const [note, setNote] = useState('')
  const [kind, setKind] = useState<'verified_assessment' | 'migration_pilot'>('verified_assessment')
  const [sent, setSent] = useState(false)

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    saveLead({
      id: uid(),
      scanId: null,
      projectKey: null,
      email,
      company: company || null,
      productionUse: null,
      monthlyComputeBand: null,
      primaryPain: note || null,
      requestType: kind,
      createdAt: new Date().toISOString(),
    })
    setSent(true)
  }

  return (
    <div className="container page-pad">
      <header className="section-head">
        <p className="eyebrow">No seat math</p>
        <h1>Pricing</h1>
        <p>
          Two offers. Free public scorecard. Paid human-reviewed assessment. Pilots are quote-only —
          we refuse a fake “package” price for work that scales with ABI surface.
        </p>
      </header>

      <div className="pricing-grid">
        <article className="price-card">
          <span className="badge">Public</span>
          <h2 style={{ marginTop: '0.7rem', fontSize: '1.25rem' }}>Free public scorecard</h2>
          <div className="price">$0</div>
          <ul>
            <li>Public GitHub URL → scores + strategy</li>
            <li>P50/P90 effort + first slice</li>
            <li>100 illustrative example reports</li>
            <li>No credit card, no fake trial</li>
          </ul>
          <Link to="/#analyze" className="btn btn-secondary btn-block">
            Analyze a public repo
          </Link>
        </article>

        <article className="price-card featured">
          <span className="badge badge-rust">Serious teams</span>
          <h2 style={{ marginTop: '0.7rem', fontSize: '1.25rem' }}>Verified Assessment</h2>
          <div className="price">from $2,500</div>
          <ul>
            <li>Human review of findings & narrative</li>
            <li>Private repository support</li>
            <li>Architecture map</li>
            <li>Calibrated effort range</li>
            <li>Benchmark plan + 60-min readout</li>
          </ul>
          <a
            href="#request"
            className="btn btn-primary btn-block"
            onClick={() => setKind('verified_assessment')}
          >
            Request assessment
          </a>
        </article>
      </div>

      <section className="panel" style={{ marginTop: '1.15rem', maxWidth: 880 }}>
        <div className="flex justify-between items-start flex-wrap gap-2">
          <div>
            <h2 className="mt-0" style={{ fontSize: '1.2rem' }}>
              Migration pilot
            </h2>
            <p className="mb-0" style={{ maxWidth: '52ch' }}>
              Hands-on first slice: boundary selection, parity harness, dual-ship plan.{' '}
              <strong className="cream">Contact for a quote</strong> — scope varies too much for a
              sticker price.
            </p>
          </div>
          <a
            href="#request"
            className="btn btn-secondary"
            onClick={() => setKind('migration_pilot')}
          >
            Contact about a pilot
          </a>
        </div>
      </section>

      <section
        id="request"
        className="panel panel-raised"
        style={{ marginTop: '1.15rem', maxWidth: 520 }}
      >
        <h2 className="mt-0" style={{ fontSize: '1.2rem' }}>
          Request
        </h2>
        {sent ? (
          <p className="mb-0">
            Saved locally in this demo. On a full deploy this writes to Supabase <code>leads</code>{' '}
            and pings the team.
          </p>
        ) : (
          <form onSubmit={onSubmit}>
            <div className="field">
              <label className="label" htmlFor="req-kind">
                Type
              </label>
              <select
                id="req-kind"
                className="select"
                value={kind}
                onChange={(e) => setKind(e.target.value as typeof kind)}
              >
                <option value="verified_assessment">Verified Assessment</option>
                <option value="migration_pilot">Migration pilot (quote)</option>
              </select>
            </div>
            <div className="field">
              <label className="label" htmlFor="req-email">
                Work email
              </label>
              <input
                id="req-email"
                className="input"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>
            <div className="field">
              <label className="label" htmlFor="req-company">
                Company
              </label>
              <input
                id="req-company"
                className="input"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                autoComplete="organization"
              />
            </div>
            <div className="field">
              <label className="label" htmlFor="req-note">
                Context (repo, constraints)
              </label>
              <textarea
                id="req-note"
                className="textarea"
                rows={4}
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-primary btn-block">
              Submit request
            </button>
          </form>
        )}
      </section>
    </div>
  )
}
