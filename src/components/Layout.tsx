import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { LogoMark } from './LogoMark'

const nav = [
  { to: '/projects', label: 'Examples' },
  { to: '/methodology', label: 'Methodology' },
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

      {!isHome && (
        <div className="announce">
          <strong>Anti-hype rule:</strong> no guaranteed speedups · ranges & confidence only
          <Link to="/methodology">why →</Link>
        </div>
      )}

      <header className="site-header">
        <div className="container inner">
          <Link to="/" className="logo" onClick={() => setOpen(false)}>
            <LogoMark size={30} />
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
              Get verdict
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
          <div className="footer-simple">
            <div>
              <Link to="/" className="logo">
                <LogoMark size={28} />
                <span className="logo-text">Rust It <span>Up</span></span>
              </Link>
              <p>Decide before you rewrite. Static analysis only.</p>
            </div>
            <nav className="footer-links" aria-label="Footer">
              <Link to="/projects">100 examples</Link>
              <Link to="/methodology">Methodology</Link>
              <Link to="/pricing">Pricing</Link>
              <Link to="/compare">Compare</Link>
              <a href="https://github.com/zozo123/rust-it-up" target="_blank" rel="noreferrer">Source</a>
            </nav>
          </div>
          <div className="footer-bottom">
            <span>© {new Date().getFullYear()} Rust It Up</span>
            <span>Illustrative estimates · no code execution</span>
          </div>
        </div>
      </footer>
    </>
  )
}
