import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { parseGitHubUrl, validationMessage } from '../lib/github'
import { startScan } from '../lib/mockScan'

const SAMPLES = [
  'jqlang/jq',
  'memcached/memcached',
  'postgres/postgres',
  'python/cpython',
]

export function UrlForm({ large }: { large?: boolean }) {
  const navigate = useNavigate()
  const [url, setUrl] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  function submit(value: string) {
    const msg = validationMessage(value)
    if (msg) {
      setError(msg)
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
        <label className="label" htmlFor="github-url">
          Public GitHub repository
        </label>
        <div className="url-form-row">
          <input
            id="github-url"
            className="input"
            type="url"
            name="url"
            inputMode="url"
            autoComplete="url"
            placeholder="https://github.com/jqlang/jq"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value)
              if (error) setError(null)
            }}
            aria-invalid={!!error}
            aria-describedby={error ? 'url-error' : 'url-hint'}
          />
          <button className={`btn btn-primary ${large ? 'btn-lg' : ''}`} type="submit" disabled={busy}>
            {busy ? 'Starting…' : 'Analyze repository'}
          </button>
        </div>
        <p id="url-hint" className="muted" style={{ margin: 0, fontSize: '0.85rem' }}>
          Accepts full URLs or <code>owner/repo</code>.
        </p>
        {error && (
          <p id="url-error" className="field-error" role="alert">
            {error}
          </p>
        )}
      </form>
      <div className="sample-chips">
        <span className="sample-label">Try a sample</span>
        {SAMPLES.map((s) => (
          <button
            key={s}
            type="button"
            className="chip"
            onClick={() => {
              setUrl(`https://github.com/${s}`)
              submit(`https://github.com/${s}`)
            }}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  )
}
