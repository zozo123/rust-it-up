import { useMemo, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import {
  isAdminAuthed,
  listLeads,
  listScans,
  listSignals,
  setAdminAuthed,
} from '../lib/storage'

/** Demo gate — not real security. Replace with Supabase auth. */
const DEMO_PASS = 'rustitup'

export function Admin() {
  const [authed, setAuthed] = useState(() => isAdminAuthed())
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  const scans = useMemo(() => (authed ? listScans() : []), [authed])
  const leads = useMemo(() => (authed ? listLeads() : []), [authed])
  const signals = useMemo(() => (authed ? listSignals() : []), [authed])

  const stats = useMemo(() => {
    const complete = scans.filter((s) => s.status === 'complete').length
    const failed = scans.filter((s) => s.status === 'failed').length
    const assessments = leads.filter(
      (l) => l.requestType === 'verified_assessment' || l.requestType === 'migration_pilot',
    ).length
    const unlocks = leads.filter((l) => l.requestType === 'email_unlock').length
    const prod = signals.filter((s) => s.signalType === 'uses_in_production').length
    return {
      scans: scans.length,
      complete,
      failed,
      leads: leads.length,
      unlocks,
      assessments,
      prod,
      signals: signals.length,
    }
  }, [scans, leads, signals])

  function login(e: FormEvent) {
    e.preventDefault()
    if (password === DEMO_PASS) {
      setAdminAuthed(true)
      setAuthed(true)
      setError(null)
    } else {
      setError('Invalid password. Demo password is documented in README.')
    }
  }

  if (!authed) {
    return (
      <div className="container page-pad">
        <div className="panel" style={{ maxWidth: 420 }}>
          <h1>Admin</h1>
          <p className="muted">Protected dashboard (demo local gate).</p>
          <form onSubmit={login}>
            <div className="field">
              <label className="label" htmlFor="admin-pass">
                Password
              </label>
              <input
                id="admin-pass"
                className="input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>
            {error && (
              <p className="field-error" role="alert">
                {error}
              </p>
            )}
            <button type="submit" className="btn btn-primary">
              Sign in
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="container page-pad">
      <div className="flex justify-between items-center flex-wrap gap-2" style={{ marginBottom: '1.25rem' }}>
        <div>
          <p className="eyebrow">Local demo metrics</p>
          <h1 className="mt-0">Admin dashboard</h1>
        </div>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => {
            setAdminAuthed(false)
            setAuthed(false)
          }}
        >
          Sign out
        </button>
      </div>

      <div className="stat-grid">
        <div className="stat">
          <div className="n">{stats.scans}</div>
          <div className="l">Scans started</div>
        </div>
        <div className="stat">
          <div className="n">{stats.complete}</div>
          <div className="l">Completions</div>
        </div>
        <div className="stat">
          <div className="n">{stats.failed}</div>
          <div className="l">Failures</div>
        </div>
        <div className="stat">
          <div className="n">{stats.leads}</div>
          <div className="l">Leads</div>
        </div>
        <div className="stat">
          <div className="n">{stats.unlocks}</div>
          <div className="l">Email unlocks</div>
        </div>
        <div className="stat">
          <div className="n">{stats.assessments}</div>
          <div className="l">Assessment requests</div>
        </div>
        <div className="stat">
          <div className="n">{stats.prod}</div>
          <div className="l">Production-use signals</div>
        </div>
        <div className="stat">
          <div className="n">{stats.signals}</div>
          <div className="l">All signals</div>
        </div>
      </div>

      <section style={{ marginBottom: '2rem' }}>
        <h2>Recent scans</h2>
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>Repo</th>
                <th>Status</th>
                <th>SHA</th>
                <th>Created</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {scans.length === 0 && (
                <tr>
                  <td colSpan={5} className="muted">
                    No scans yet. <Link to="/">Run one</Link>.
                  </td>
                </tr>
              )}
              {scans.slice(0, 50).map((s) => (
                <tr key={s.id}>
                  <td>
                    {s.owner}/{s.repo}
                  </td>
                  <td>{s.status}</td>
                  <td className="mono">{s.commitSha.slice(0, 10)}</td>
                  <td className="mono">{new Date(s.createdAt).toLocaleString()}</td>
                  <td>
                    <Link to={`/r/${s.owner}/${s.repo}`}>Report</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2>Leads</h2>
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>Email</th>
                <th>Type</th>
                <th>Project</th>
                <th>Production</th>
                <th>Pain</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {leads.length === 0 && (
                <tr>
                  <td colSpan={6} className="muted">
                    No leads captured in this browser yet.
                  </td>
                </tr>
              )}
              {leads.slice(0, 100).map((l) => (
                <tr key={l.id}>
                  <td>{l.email}</td>
                  <td>{l.requestType}</td>
                  <td>{l.projectKey ?? '—'}</td>
                  <td>
                    {l.productionUse === true ? 'yes' : l.productionUse === false ? 'no' : '—'}
                  </td>
                  <td>{l.primaryPain ?? '—'}</td>
                  <td className="mono">{new Date(l.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
