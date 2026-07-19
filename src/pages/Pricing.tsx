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
        <p className="eyebrow">Simple launch pricing</p>
        <h1>Pricing</h1>
        <p>Two offers. No seat gymnastics. Migration pilots are quote-only.</p>
      </header>

      <div className="pricing-grid">
        <article className="price-card">
          <span className="badge">Public</span>
          <h2 style={{ marginTop: '0.75rem' }}>Free public scorecard</h2>
          <div className="price">$0</div>
          <ul>
            <li>Paste a public GitHub URL</li>
            <li>Rust Upside, Feasibility, Commercial Signal</li>
            <li>Strategy recommendation & effort ranges</li>
            <li>Safest first migration slice</li>
            <li>100 illustrative example reports</li>
          </ul>
          <Link to="/#analyze" className="btn btn-secondary">
            Analyze a public repo
          </Link>
        </article>

        <article className="price-card featured">
          <span className="badge badge-rust">Most serious</span>
          <h2 style={{ marginTop: '0.75rem' }}>Verified Assessment</h2>
          <div className="price">from $2,500</div>
          <ul>
            <li>Human review of findings & narrative</li>
            <li>Private repository support</li>
            <li>Architecture map</li>
            <li>Calibrated effort range</li>
            <li>Benchmark plan</li>
            <li>60-minute readout</li>
          </ul>
          <a href="#request" className="btn btn-primary" onClick={() => setKind('verified_assessment')}>
            Request assessment
          </a>
        </article>
      </div>

      <section className="panel" style={{ marginTop: '1.5rem', maxWidth: 860 }}>
        <h2 className="mt-0">Migration pilot</h2>
        <p>
          Hands-on first slice with your team: boundary selection, parity harness, and dual-ship
          plan. <strong className="cream">Contact for a quote</strong> — we do not publish a fixed
          price because scope varies by ABI surface and compliance needs.
        </p>
        <a href="#request" className="btn btn-secondary" onClick={() => setKind('migration_pilot')}>
          Contact about a pilot
        </a>
      </section>

      <section id="request" className="panel panel-raised" style={{ marginTop: '1.5rem', maxWidth: 560 }}>
        <h2 className="mt-0">Request form</h2>
        {sent ? (
          <p className="mb-0">
            Thanks — request stored locally in this demo. On a full deploy this hits Supabase{' '}
            <code>leads</code> and notifies the team.
          </p>
        ) : (
          <form onSubmit={onSubmit}>
            <div className="field">
              <label className="label" htmlFor="req-kind">
                Request type
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
            <button type="submit" className="btn btn-primary">
              Submit request
            </button>
          </form>
        )}
      </section>
    </div>
  )
}
