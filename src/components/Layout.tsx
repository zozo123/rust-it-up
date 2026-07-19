import { useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'

const nav = [
  { to: '/', label: 'Home', end: true },
  { to: '/projects', label: 'Examples' },
  { to: '/compare', label: 'Compare' },
  { to: '/methodology', label: 'Methodology' },
  { to: '/pricing', label: 'Pricing' },
]

export function Layout() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
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
                end={item.end}
                className={({ isActive }) => (isActive ? 'active' : undefined)}
                onClick={() => setOpen(false)}
              >
                {item.label}
              </NavLink>
            ))}
            <Link to="/#analyze" className="btn btn-primary btn-sm" onClick={() => setOpen(false)}>
              Analyze
            </Link>
          </nav>
        </div>
      </header>
      <main id="main">
        <Outlet />
      </main>
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
                Evidence-based Rust migration scorecards. Static analysis first. We do not execute
                public repository code.
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
              <h4>Featured</h4>
              <Link to="/r/jqlang/jq">jqlang/jq</Link>
              <Link to="/r/memcached/memcached">memcached</Link>
              <Link to="/r/pnggroup/libpng">libpng</Link>
              <Link to="/r/postgres/postgres">postgres</Link>
            </div>
            <div className="footer-col">
              <h4>Ops</h4>
              <Link to="/admin">Admin</Link>
              <a href="https://github.com/zozo123/rust-it-up" target="_blank" rel="noreferrer">
                GitHub
              </a>
            </div>
          </div>
          <div className="footer-bottom">
            <span>© {new Date().getFullYear()} Rust It Up · demo on GitHub Pages</span>
            <span>No guaranteed speedups · ranges & confidence only</span>
          </div>
        </div>
      </footer>
    </>
  )
}
