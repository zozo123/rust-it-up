import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ensureScanProgress, STATUS_LABELS } from '../lib/mockScan'
import type { ScanJob, ScanStatus } from '../types'
import { getScan } from '../lib/storage'

const FLOW: ScanStatus[] = [
  'queued',
  'fetching_metadata',
  'inspecting_snapshot',
  'scoring_paths',
  'generating_report',
  'complete',
]

export function Scan() {
  const { scanId } = useParams()
  const navigate = useNavigate()
  const [scan, setScan] = useState<ScanJob | null | undefined>(undefined)

  useEffect(() => {
    if (!scanId) return
    ensureScanProgress(scanId)
    setScan(getScan(scanId) ?? null)

    const id = window.setInterval(() => {
      const s = getScan(scanId)
      setScan(s ?? null)
      if (s?.status === 'complete') {
        window.clearInterval(id)
        navigate(`/r/${s.owner}/${s.repo}`, { replace: true })
      }
    }, 400)

    return () => window.clearInterval(id)
  }, [scanId, navigate])

  if (scan === undefined) {
    return (
      <div className="container page-pad">
        <p className="mono muted">Loading scan…</p>
      </div>
    )
  }

  if (scan === null) {
    return (
      <div className="container page-pad">
        <div className="panel" style={{ maxWidth: 520 }}>
          <h1>Scan not found</h1>
          <p>This job is not in local storage (refresh-safe only for scans started in this browser).</p>
          <Link to="/" className="btn btn-primary">
            Start a new analysis
          </Link>
        </div>
      </div>
    )
  }

  const currentIdx = FLOW.indexOf(scan.status === 'failed' ? 'queued' : scan.status)

  return (
    <div className="container page-pad">
      <div className="scan-status panel panel-raised">
        <p className="eyebrow">Scan job</p>
        <h1 className="mt-0" style={{ fontSize: '1.6rem' }}>
          {scan.owner}/{scan.repo}
        </h1>
        <p className="mono muted" style={{ fontSize: '0.85rem' }}>
          id {scan.id.slice(0, 8)}… · sha {scan.commitSha.slice(0, 12)} · {scan.scannerVersion}
        </p>
        <p>
          Live progress with local persistence. Refresh-safe in this browser. Production would use
          Supabase Realtime or polling with exponential backoff.
        </p>

        {scan.status === 'failed' ? (
          <div className="illustrative-banner" role="alert">
            <div>
              <strong>Scan failed</strong>
              <div>
                {scan.failureCode}: {scan.failureMessage}
              </div>
            </div>
          </div>
        ) : (
          <ul className="progress-list">
            {FLOW.filter((s) => s !== 'complete').map((status, i) => {
              let cls = ''
              if (scan.status === 'complete' || i < currentIdx) cls = 'done'
              else if (i === currentIdx) cls = 'current'
              return (
                <li key={status} className={cls}>
                  <span className="dot" aria-hidden />
                  {STATUS_LABELS[status]}
                </li>
              )
            })}
            <li className={scan.status === 'complete' ? 'done current' : ''}>
              <span className="dot" aria-hidden />
              {STATUS_LABELS.complete}
            </li>
          </ul>
        )}

        <p className="trust-line" style={{ marginTop: '1.5rem' }}>
          Static analysis first. We do not execute public repository code.
        </p>
      </div>
    </div>
  )
}
