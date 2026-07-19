import { useState, type FormEvent } from 'react'
import type { Lead } from '../types'
import { saveLead, saveSignal, uid } from '../lib/storage'

const PAINS = [
  { value: 'cost', label: 'Cloud / infra cost' },
  { value: 'latency', label: 'Latency' },
  { value: 'safety', label: 'Memory safety' },
  { value: 'reliability', label: 'Reliability' },
  { value: 'distribution', label: 'Distribution / packaging' },
  { value: 'staffing', label: 'Staffing / hiring' },
]

const BANDS = [
  { value: 'lt_5k', label: '< $5k / mo' },
  { value: '5k_25k', label: '$5k–$25k / mo' },
  { value: '25k_100k', label: '$25k–$100k / mo' },
  { value: 'gt_100k', label: '> $100k / mo' },
  { value: 'unknown', label: 'Prefer not to say' },
]

interface Props {
  scanId?: string | null
  projectKey?: string | null
  requestType?: string
  onDone?: () => void
}

export function LeadForm({
  scanId = null,
  projectKey = null,
  requestType = 'email_unlock',
  onDone,
}: Props) {
  const [email, setEmail] = useState('')
  const [productionUse, setProductionUse] = useState<string>('')
  const [band, setBand] = useState('')
  const [pain, setPain] = useState('')
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Enter a valid work email.')
      return
    }
    const lead: Lead = {
      id: uid(),
      scanId,
      projectKey,
      email,
      company: null,
      productionUse: productionUse === 'yes' ? true : productionUse === 'no' ? false : null,
      monthlyComputeBand: band || null,
      primaryPain: pain || null,
      requestType,
      createdAt: new Date().toISOString(),
    }
    saveLead(lead)
    if (projectKey) {
      saveSignal({
        id: uid(),
        projectKey,
        signalType: 'wants_verified_report',
        createdAt: new Date().toISOString(),
      })
      if (productionUse === 'yes') {
        saveSignal({
          id: uid(),
          projectKey,
          signalType: 'uses_in_production',
          createdAt: new Date().toISOString(),
        })
      }
    }
    setDone(true)
    onDone?.()
  }

  if (done) {
    return (
      <div className="panel panel-raised">
        <h3 className="mt-0">Thanks — report unlocked</h3>
        <p className="mb-0">
          Full illustrative detail is already on this page. For private or production repositories,
          request a <strong className="cream">Verified Assessment</strong> from Pricing.
        </p>
      </div>
    )
  }

  return (
    <form className="panel" onSubmit={onSubmit}>
      <h3 className="mt-0">Unlock full report context</h3>
      <p style={{ fontSize: '0.92rem' }}>
        The first useful answer is free. Optionally leave a work email (max four fields) so we can
        calibrate demand — no spam, no gated fake score.
      </p>
      <div className="field">
        <label className="label" htmlFor="lead-email">
          Work email
        </label>
        <input
          id="lead-email"
          className="input"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.com"
        />
      </div>
      <div className="field">
        <label className="label" htmlFor="lead-prod">
          Is this running in production?
        </label>
        <select
          id="lead-prod"
          className="select"
          value={productionUse}
          onChange={(e) => setProductionUse(e.target.value)}
        >
          <option value="">Select…</option>
          <option value="yes">Yes</option>
          <option value="no">No</option>
          <option value="unsure">Not sure</option>
        </select>
      </div>
      <div className="field">
        <label className="label" htmlFor="lead-band">
          Monthly infrastructure-cost band
        </label>
        <select
          id="lead-band"
          className="select"
          value={band}
          onChange={(e) => setBand(e.target.value)}
        >
          <option value="">Select…</option>
          {BANDS.map((b) => (
            <option key={b.value} value={b.value}>
              {b.label}
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        <label className="label" htmlFor="lead-pain">
          Primary pain
        </label>
        <select
          id="lead-pain"
          className="select"
          value={pain}
          onChange={(e) => setPain(e.target.value)}
        >
          <option value="">Select…</option>
          {PAINS.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>
      </div>
      {error && (
        <p className="field-error" role="alert">
          {error}
        </p>
      )}
      <button type="submit" className="btn btn-primary">
        Save & continue
      </button>
    </form>
  )
}
