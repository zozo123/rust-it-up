import { Link } from 'react-router-dom'
import { useDocumentTitle } from '../lib/useDocumentTitle'

export function Methodology() {
  useDocumentTitle('Methodology')
  return (
    <div className="container page-pad">
      <header className="section-head">
        <p className="eyebrow">How scoring works</p>
        <h1>Methodology</h1>
        <p>
          Transparent axes. Explicit limitations. No invented performance wins. When the worker
          ships: deterministic findings → scores; LLM only narrates what findings already prove.
        </p>
      </header>

      <div className="stack" style={{ gap: '1.25rem', maxWidth: 800 }}>
        <section className="panel">
          <h2 className="mt-0">Rust Upside (0–100)</h2>
          <p>
            How much <em>could</em> Rust help, independent of whether a rewrite is practical.
            Inputs include memory-unsafety exposure, concurrency model, latency/throughput
            sensitivity, distribution constraints, and cloud-cost leverage. High upside is common
            in parsers, codecs, caches, and network servers written in C/C++.
          </p>
          <p className="mb-0 muted">
            Upside is not a performance guarantee. Throughput and latency claims always require
            measurement.
          </p>
        </section>

        <section className="panel">
          <h2 className="mt-0">Migration Feasibility (0–100)</h2>
          <p>
            How practical a move is: boundary clarity, ABI/compat load, test harness maturity,
            size of a first slice, build complexity, and organizational coupling. Monoliths with
            decades of semantics (Postgres, CPython) score low even when upside is high.
          </p>
        </section>

        <section className="panel">
          <h2 className="mt-0">Commercial Signal (0–100)</h2>
          <p className="mb-0">
            Likelihood that a real buyer funds work: production intensity, centrality in stacks,
            operational cost base, and security pressure. Separated from pure technical merit so
            “cool port” does not look like “funded program.”
          </p>
        </section>

        <section className="panel">
          <h2 className="mt-0">Opportunity Score</h2>
          <p className="mb-0">
            Ranking aid ≈ 0.45×Upside + 0.3×Feasibility + 0.25×Commercial. Useful for sorting the
            directory — <strong className="cream">not truth</strong>, not a decision, not an “AI
            score.”
          </p>
        </section>

        <section className="panel">
          <h2 className="mt-0">P50 versus P90</h2>
          <p>
            <strong className="cream">P50</strong> is a central engineering-effort case (engineer-months).{' '}
            <strong className="cream">P90</strong> absorbs integration, verification, compatibility,
            and unknown-unknown drag. Planning only to P50 is how rewrites blow up.
          </p>
          <p className="mb-0">
            CI/CD low/high days cover packaging, dual-ship, release automation, and rollout
            harnesses — work teams forget when they only estimate “coding.”
          </p>
        </section>

        <section className="panel">
          <h2 className="mt-0">Why verification, compatibility, CI/CD, packaging, and rollout</h2>
          <p className="mb-0">
            Shipping a correct binary is half the problem. Production cutover needs parity tests,
            fuzzing for parsers/codecs, packaging for every target you already support, and a
            rollback path. Those dominate calendar time on systems software.
          </p>
        </section>

        <section className="panel">
          <h2 className="mt-0">Why full rewrites are rare</h2>
          <p className="mb-0">
            Full ports need high upside <em>and</em> high feasibility <em>and</em> a funded buyer.
            Most rational strategies are: do not rewrite, extract a hotspot, replace a subsystem,
            or clean-room a compatible implementation with a thin surface. High upside with low
            feasibility → strategic program around the system, not a clone.
          </p>
        </section>

        <section className="panel">
          <h2 className="mt-0">Architecture boundary</h2>
          <ul style={{ margin: 0, paddingLeft: '1.1rem', color: 'var(--cream-dim)' }}>
            <li>Product shell: UI, auth, schema, reports, leads, billing UI.</li>
            <li>Edge function: validate request, upsert project, create/reuse scan, emit event.</li>
            <li>Worker: download archive snapshot, static analysis, deterministic scores.</li>
            <li>LLM: explain findings only — never invent LOC, deps, tests, gains, or effort inputs.</li>
            <li>Cache key: repository + commit SHA + scanner version.</li>
            <li>Do not execute untrusted repository code in v1.</li>
          </ul>
        </section>

        <section className="panel">
          <h2 className="mt-0">Limitations & confidence labels</h2>
          <p>
            Seed pages are <strong className="cream">illustrative</strong>. Mock scans for unknown
            repos use deterministic placeholders with <strong className="cream">low</strong>{' '}
            confidence. Live worker scans will raise confidence when evidence density is high
            (tests, clear modules, public benchmarks) and lower it when the tree is generated,
            vendor-heavy, or sparsely tested.
          </p>
          <p className="mb-0">
            This GitHub Pages build ships mocked APIs and seed data so the UI boundary stays
            explicit for a future worker.
          </p>
        </section>

        <div className="flex flex-wrap gap-1">
          <Link to="/" className="btn btn-primary">
            Analyze a repository
          </Link>
          <Link to="/projects" className="btn btn-secondary">
            Browse examples
          </Link>
        </div>
      </div>
    </div>
  )
}
