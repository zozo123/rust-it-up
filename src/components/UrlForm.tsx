import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { parseGitHubUrl, validationMessage } from '../lib/github'
import { startScan } from '../lib/mockScan'

const SAMPLES = [
  { id: 'jqlang/jq', note: 'extract hotspot' },
  { id: 'postgres/postgres', note: 'do not rewrite' },
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
      <form className="url-form verdict-form" onSubmit={onSubmit} noValidate>
        <div className="verdict-form-shell">
          <div className="verdict-form-row">
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
              placeholder="github.com/owner/repo"
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
              {busy ? 'Starting…' : 'Get the verdict →'}
            </button>
          </div>
        </div>
        <p id="url-hint" className="verdict-form-hint">
          <span>Free</span><span>No signup</span><span>No code execution</span><span>Shareable report</span>
        </p>
        {error && (
          <p id="url-error" className="field-error" role="alert">
            {error}
          </p>
        )}
      </form>
      <div className="sample-chips">
        <span className="sample-label">Or try:</span>
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
