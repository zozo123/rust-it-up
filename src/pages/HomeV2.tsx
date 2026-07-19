import { Link } from 'react-router-dom'
import { UrlForm } from '../components/UrlForm'
import { getProject } from '../data/projects'
import { RECOMMENDATION_LABELS } from '../types'

const sample = getProject('jqlang', 'jq')!
const hardCases = [
  getProject('postgres', 'postgres'),
  getProject('FFmpeg', 'FFmpeg'),
  getProject('python', 'cpython'),
].filter(Boolean)

export function HomeV2() {
  return (
    <>
      <section className="hero hero-v4">
        <div className="container hero-v4-inner">
          <p className="hero-v4-kicker">Rust migration verdicts</p>
          <h1>Know if a Rust rewrite is worth it.</h1>
          <p className="hero-v4-lead">
            Paste a public GitHub repo. Get the verdict, effort range, and safest first slice.
          </p>
          <UrlForm large autoFocus />
        </div>
      </section>

      <section className="section sample-v4-section">
        <div className="container sample-v4">
          <div className="sample-v4-copy">
            <div className="sample-v4-label">
              <span>Example verdict</span>
              <Link to="/r/jqlang/jq">jqlang/jq ↗</Link>
            </div>
            <p className="eyebrow">Recommended</p>
            <h2>{RECOMMENDATION_LABELS[sample.estimate.recommendation]}.</h2>
            <p>
              Do not rewrite all of jq. Prove value in the parser and execution hotspot,
              keep the CLI contract, then benchmark.
            </p>
            <Link to="/r/jqlang/jq" className="sample-v4-link">
              Open the full shareable report <span aria-hidden>→</span>
            </Link>
          </div>

          <div className="sample-v4-data">
            <dl className="sample-v4-metrics">
              <div>
                <dt>Effort</dt>
                <dd>{sample.estimate.p50EngineerMonths}–{sample.estimate.p90EngineerMonths}<small>eng-mo</small></dd>
              </div>
              <div>
                <dt>Rust upside</dt>
                <dd>{sample.estimate.rustUpside}<small>/100</small></dd>
              </div>
              <div>
                <dt>Feasibility</dt>
                <dd>{sample.estimate.migrationFeasibility}<small>/100</small></dd>
              </div>
            </dl>
            <div className="sample-v4-slice">
              <span>Safest first slice</span>
              <strong>{sample.estimate.firstSlice.name}</strong>
              <small>
                {sample.estimate.firstSlice.estimatedWeeks[0]}–{sample.estimate.firstSlice.estimatedWeeks[1]} weeks
                {' · '}risk {sample.estimate.firstSlice.risk}
              </small>
            </div>
          </div>
        </div>
      </section>

      <section className="section anti-v4-section">
        <div className="container anti-v4">
          <div className="anti-v4-copy">
            <p className="eyebrow">Built to say no</p>
            <h2>Rust upside is not a rewrite mandate.</h2>
            <p>
              The right answer may be one small slice—or no rewrite at all.
            </p>
            <div className="anti-v4-actions">
              <Link to="/projects" className="btn btn-primary btn-lg">Browse 100 verdicts</Link>
              <Link to="/methodology" className="btn btn-ghost btn-lg">How it works →</Link>
            </div>
          </div>

          <div className="hard-case-list" aria-label="Example migration decisions">
            {hardCases.map((project) => (
              <Link key={project!.id} to={`/r/${project!.owner}/${project!.repo}`}>
                <span>
                  <strong>{project!.owner}/{project!.repo}</strong>
                  <small>{RECOMMENDATION_LABELS[project!.estimate.recommendation]}</small>
                </span>
                <span className="hard-case-score">
                  <small>Feasibility</small>
                  <strong>{project!.estimate.migrationFeasibility}</strong>
                </span>
                <b aria-hidden>↗</b>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section final-v4-section">
        <div className="container final-v4">
          <div>
            <h2>Decide before you rewrite.</h2>
            <p>Free. No signup. No code execution.</p>
          </div>
          <a href="#analyze" className="btn btn-primary btn-lg">Get the verdict</a>
        </div>
      </section>
    </>
  )
}
