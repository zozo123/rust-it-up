import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'

const nav = [
  { to: '/projects', label: 'Examples' },
  { to: '/compare', label: 'Compare' },
  { to: '/methodology', label: 'Method' },
  { to: '/pricing', label: 'Pricing' },
]

export function Layout() {
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const isHome = location.pathname === '/' || location.pathname === ''
  const mainRef = useRef<HTMLElement>(null)
  const firstRender = useRef(true)

  useEffect(() => {
    setOpen(false)
    window.scrollTo(0, 0)
    // Move focus to the main region on client-side navigation so keyboard and
    // screen-reader users are placed on the new page (skip the initial load).
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    mainRef.current?.focus()
  }, [location.pathname])

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>

      <div className="announce">
        <strong>Anti-hype rule:</strong> no guaranteed speedups · ranges & confidence only
        <Link to="/methodology">why →</Link>
      </div>

      <header className="site-header">
        <div className="container inner">
          <Link to="/" className="logo" onClick={() => setOpen(false)}>
            <span className="logo-mark" aria-hidden>
              Ru
            </span>
            <span className="logo-text">
              Rust It <span>Up</span>
            </span>
          </Link>
          <button
            type="button"
            className="nav-toggle"
            aria-expanded={open}
            aria-controls="site-nav"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? 'Close' : 'Menu'}
          </button>
          <nav id="site-nav" className={`nav ${open ? 'open' : ''}`} aria-label="Primary">
            {nav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => (isActive ? 'active' : undefined)}
                onClick={() => setOpen(false)}
              >
                {item.label}
              </NavLink>
            ))}
            <Link
              to={isHome ? '/#analyze' : '/'}
              className="btn btn-primary btn-sm"
              onClick={() => setOpen(false)}
            >
              Analyze
            </Link>
          </nav>
        </div>
      </header>

      <main id="main" className="page-enter" key={location.pathname} ref={mainRef} tabIndex={-1}>
        <Outlet />
      </main>

      {!isHome && (
        <div className="mobile-dock" aria-label="Quick actions">
          <Link to="/" className="btn btn-primary" style={{ flex: 1 }}>
            Analyze a repo
          </Link>
          <Link to="/projects" className="btn btn-secondary" style={{ flex: 1 }}>
            Examples
          </Link>
        </div>
      )}

      <footer className="site-footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand">
              <Link to="/" className="logo" style={{ marginBottom: '0.75rem' }}>
                <span className="logo-mark" aria-hidden>
                  Ru
                </span>
                <span className="logo-text">
                  Rust It <span>Up</span>
                </span>
              </Link>
              <p>
                The boring, correct question before a Rust rewrite: should you? Static analysis
                first. We do not execute public repository code.
              </p>
            </div>
            <div className="footer-col">
              <h4>Product</h4>
              <Link to="/projects">100 examples</Link>
              <Link to="/methodology">Methodology</Link>
              <Link to="/pricing">Pricing</Link>
              <Link to="/compare">Compare</Link>
            </div>
            <div className="footer-col">
              <h4>Hard cases</h4>
              <Link to="/r/postgres/postgres">postgres</Link>
              <Link to="/r/FFmpeg/FFmpeg">FFmpeg</Link>
              <Link to="/r/python/cpython">cpython</Link>
              <Link to="/r/jqlang/jq">jq</Link>
            </div>
            <div className="footer-col">
              <h4>Ops</h4>
              <Link to="/admin">Admin</Link>
              <a href="https://github.com/zozo123/rust-it-up" target="_blank" rel="noreferrer">
                Source
              </a>
            </div>
          </div>
          <div className="footer-bottom">
            <span>© {new Date().getFullYear()} Rust It Up</span>
            <span>Illustrative seed estimates · not audited scans</span>
          </div>
        </div>
      </footer>
    </>
  )
}
