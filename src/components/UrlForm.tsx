import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { parseGitHubUrl, validationMessage } from '../lib/github'
import { startScan } from '../lib/mockScan'

const SAMPLES = [
  { id: 'jqlang/jq', note: 'extract hotspot' },
  { id: 'memcached/memcached', note: 'high commercial' },
  { id: 'postgres/postgres', note: 'do not rewrite' },
  { id: 'python/cpython', note: 'low feasibility' },
]

export function UrlForm({ large, autoFocus }: { large?: boolean; autoFocus?: boolean }) {
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)
  const [url, setUrl] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const valid = !url.trim() || !!parseGitHubUrl(url)

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus()
  }, [autoFocus])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
        inputRef.current?.select()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  function submit(value: string) {
    const msg = validationMessage(value)
    if (msg) {
      setError(msg)
      inputRef.current?.focus()
      return
    }
    const parsed = parseGitHubUrl(value)
    if (!parsed) {
      setError('Invalid GitHub repository URL.')
      return
    }
    setError(null)
    setBusy(true)
    const job = startScan(parsed)
    navigate(`/scan/${job.id}`)
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    submit(url)
  }

  return (
    <div id="analyze">
      <form className="url-form" onSubmit={onSubmit} noValidate>
        <div className="cmd-bar">
          <div className="cmd-bar-top">
            <div className="cmd-dots" aria-hidden>
              <span />
              <span />
              <span />
            </div>
            <span className="cmd-title">analyze · public github only</span>
            <span className="kbd" style={{ marginLeft: 'auto' }}>
              ⌘K
            </span>
          </div>
          <div className="cmd-bar-body">
            <span className="cmd-prefix" aria-hidden>
              ›
            </span>
            <label className="sr-only" htmlFor="github-url">
              Public GitHub repository URL
            </label>
            <input
              ref={inputRef}
              id="github-url"
              className="input"
              type="text"
              name="url"
              inputMode="url"
              autoComplete="off"
              spellCheck={false}
              placeholder="github.com/owner/repo  or  owner/repo"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value)
                if (error) setError(null)
              }}
              aria-invalid={!!error || (!!url && !valid)}
              aria-describedby={error ? 'url-error' : 'url-hint'}
            />
            <button
              className={`btn btn-primary ${large ? 'btn-lg' : ''}`}
              type="submit"
              disabled={busy}
            >
              {busy ? 'Starting…' : 'Analyze repository'}
            </button>
          </div>
        </div>
        <p id="url-hint" className="muted" style={{ margin: '0.55rem 0 0', fontSize: '0.8rem' }}>
          Full URL or <code>owner/repo</code>. We never execute repository code.
        </p>
        {error && (
          <p id="url-error" className="field-error" role="alert">
            {error}
          </p>
        )}
      </form>
      <div className="sample-chips">
        <span className="sample-label">Try a known case</span>
        {SAMPLES.map((s) => (
          <button
            key={s.id}
            type="button"
            className="chip"
            title={s.note}
            onClick={() => {
              setUrl(`https://github.com/${s.id}`)
              submit(`https://github.com/${s.id}`)
            }}
          >
            {s.id}
          </button>
        ))}
      </div>
    </div>
  )
}
