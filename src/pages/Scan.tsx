import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ensureScanProgress, STATUS_LABELS } from '../lib/mockScan'
import type { ScanJob, ScanStatus } from '../types'
import { getScan } from '../lib/storage'
import { useDocumentTitle } from '../lib/useDocumentTitle'

const FLOW: ScanStatus[] = [
  'queued',
  'fetching_metadata',
  'inspecting_snapshot',
  'scoring_paths',
  'generating_report',
  'complete',
]

export function Scan() {
  useDocumentTitle('Analyzing repository')
  const { scanId } = useParams()
  const navigate = useNavigate()
  const [scan, setScan] = useState<ScanJob | null | undefined>(undefined)
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    if (!scanId) return
    ensureScanProgress(scanId)
    setScan(getScan(scanId) ?? null)

    const poll = window.setInterval(() => {
      const s = getScan(scanId)
      setScan(s ?? null)
      if (s?.status === 'complete') {
        window.clearInterval(poll)
        window.setTimeout(() => {
          navigate(`/r/${s.owner}/${s.repo}`, { replace: true })
        }, 450)
      } else if (s?.status === 'failed') {
        window.clearInterval(poll)
      }
    }, 350)

    return () => window.clearInterval(poll)
  }, [scanId, navigate])

  useEffect(() => {
    if (!scan?.startedAt || scan.status === 'complete' || scan.status === 'failed') return
    const start = new Date(scan.startedAt).getTime()
    const t = window.setInterval(() => {
      setElapsed(Math.floor((Date.now() - start) / 100) / 10)
    }, 100)
    return () => window.clearInterval(t)
  }, [scan?.startedAt, scan?.status])

  const currentIdx = useMemo(() => {
    if (!scan) return 0
    if (scan.status === 'failed') return 0
    if (scan.status === 'complete') return FLOW.length - 1
    return Math.max(0, FLOW.indexOf(scan.status))
  }, [scan])

  const pct = scan
    ? scan.status === 'complete'
      ? 100
      : scan.status === 'failed'
        ? 0
        : Math.round(((currentIdx + 0.35) / (FLOW.length - 1)) * 100)
    : 0

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
        <div className="panel" style={{ maxWidth: 480, margin: '0 auto' }}>
          <h1 style={{ fontSize: '1.4rem' }}>Scan not found</h1>
          <p>
            Jobs persist in this browser only (refresh-safe locally). Production would use durable
            scan IDs + Realtime.
          </p>
          <Link to="/" className="btn btn-primary">
            Start a new analysis
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container page-pad">
      <div className="scan-status">
        <div className="product-window">
          <div className="product-window-bar">
            <div className="flex items-center gap-1">
              <div className="cmd-dots" aria-hidden>
                <span />
                <span />
                <span />
              </div>
              <span className="cmd-title">scan · {scan.scannerVersion}</span>
            </div>
            <span className="mono muted" style={{ fontSize: '0.72rem' }}>
              {elapsed.toFixed(1)}s
            </span>
          </div>
          <div className="product-window-body">
            <p className="eyebrow" style={{ marginBottom: '0.35rem' }}>
              Job in progress
            </p>
            <h1 className="mt-0" style={{ fontSize: '1.45rem' }}>
              {scan.owner}/{scan.repo}
            </h1>
            <p className="mono muted" style={{ fontSize: '0.78rem', marginBottom: '0.75rem' }}>
              {scan.id.slice(0, 8)}… · sha {scan.commitSha.slice(0, 12)}
            </p>

            <div className="term-block">
              <div>
                <span className="dim">$</span> rust-it-up scan {scan.owner}/{scan.repo}
              </div>
              <div>
                <span className="hl">status</span> {STATUS_LABELS[scan.status].toLowerCase()}
              </div>
              <div>
                <span className="dim">note</span> static only · no code execution
              </div>
            </div>

            <div
              className="scan-meter"
              role="progressbar"
              aria-valuenow={pct}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Scan progress: ${STATUS_LABELS[scan.status]}`}
            >
              <span style={{ width: `${pct}%` }} />
            </div>
            <p className="mono muted" style={{ fontSize: '0.72rem', marginTop: '0.4rem' }} aria-live="polite">
              {pct}% · {STATUS_LABELS[scan.status]} · refresh-safe in this browser
            </p>

            {scan.status === 'failed' ? (
              <div className="illustrative-banner" role="alert" style={{ marginTop: '1rem' }}>
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
          </div>
        </div>
      </div>
    </div>
  )
}
