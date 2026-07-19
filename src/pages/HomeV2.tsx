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

const answers = [
  {
    number: '01',
    label: 'Verdict',
    title: 'Should we do it?',
    body: 'Stop, extract a hotspot, replace a subsystem, clean-room, or full port.',
  },
  {
    number: '02',
    label: 'Effort',
    title: 'What will it cost?',
    body: 'P50–P90 engineer-months, delivery work, confidence, and assumptions.',
  },
  {
    number: '03',
    label: 'First slice',
    title: 'Where do we start?',
    body: 'The smallest bounded migration that can prove value before a rewrite begins.',
  },
]

export function HomeV2() {
  return (
    <>
      <section className="hero hero-v3">
        <div className="container hero-v3-grid">
          <div className="hero-v3-copy">
            <p className="hero-v3-kicker">Rust migration decision report</p>
            <h1>
              Should this repo be
              <span>rewritten in Rust?</span>
            </h1>
            <p className="hero-v3-lead">
              Paste a public GitHub repo. Get a clear verdict, a P50–P90 effort range,
              and the safest first slice.
            </p>
            <UrlForm large autoFocus />
          </div>

          <aside className="verdict-card" aria-label="Sample Rust migration verdict">
            <div className="verdict-card-top">
              <span>Sample report</span>
              <Link to="/r/jqlang/jq">jqlang/jq ↗</Link>
            </div>
            <div className="verdict-card-body">
              <div className="verdict-status">
                <span className="verdict-status-dot" aria-hidden />
                Recommended verdict
              </div>
              <h2>{RECOMMENDATION_LABELS[sample.estimate.recommendation]}.</h2>
              <p>
                Prove value in the parser and execution hotspot. Keep the CLI contract.
                Benchmark before expanding.
              </p>

              <dl className="verdict-metrics">
                <div>
                  <dt>Effort</dt>
                  <dd>
                    {sample.estimate.p50EngineerMonths}–{sample.estimate.p90EngineerMonths}
                    <small>eng-mo</small>
                  </dd>
                </div>
                <div>
                  <dt>Rust upside</dt>
                  <dd>
                    {sample.estimate.rustUpside}
                    <small>/100</small>
                  </dd>
                </div>
                <div>
                  <dt>Feasibility</dt>
                  <dd>
                    {sample.estimate.migrationFeasibility}
                    <small>/100</small>
                  </dd>
                </div>
              </dl>

              <div className="verdict-slice">
                <span>Safest first slice</span>
                <strong>{sample.estimate.firstSlice.name}</strong>
                <small>{sample.estimate.firstSlice.estimatedWeeks[0]}–{sample.estimate.firstSlice.estimatedWeeks[1]} weeks · risk {sample.estimate.firstSlice.risk}</small>
              </div>

              <Link to="/r/jqlang/jq" className="verdict-link">
                See the full shareable report <span aria-hidden>→</span>
              </Link>
            </div>
          </aside>
        </div>

        <div className="container hero-v3-proof" aria-label="Product facts">
          <span><strong>100</strong> public examples</span>
          <span><strong>5</strong> possible verdicts</span>
          <span><strong>0</strong> code executed</span>
          <Link to="/methodology">See how it works →</Link>
        </div>
      </section>

      <section className="section answer-section">
        <div className="container">
          <div className="section-head answer-head">
            <p className="eyebrow">One URL. One decision.</p>
            <h2>The three answers a rewrite proposal needs.</h2>
          </div>
          <div className="answer-grid">
            {answers.map((answer) => (
              <article key={answer.label}>
                <div className="answer-meta">
                  <span>{answer.number}</span>
                  <strong>{answer.label}</strong>
                </div>
                <h3>{answer.title}</h3>
                <p>{answer.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section proof-section">
        <div className="container proof-layout">
          <div className="proof-copy">
            <p className="eyebrow">Built to say no</p>
            <h2>High Rust upside does not mean “rewrite everything.”</h2>
            <p>
              The useful answer may be a smaller slice—or no rewrite at all. Every scorecard
              makes that call explicit and shareable.
            </p>
            <div className="proof-actions">
              <Link to="/projects" className="btn btn-primary btn-lg">Browse 100 verdicts</Link>
              <Link to="/compare" className="btn btn-secondary btn-lg">Compare repos</Link>
            </div>
          </div>
          <div className="hard-case-list" aria-label="Example no-rewrite decisions">
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

      <section className="section final-section">
        <div className="container final-v3">
          <div>
            <p className="eyebrow">Before the roadmap</p>
            <h2>Get the verdict first.</h2>
            <p>Free public scorecards. No signup. No code execution.</p>
          </div>
          <a href="#analyze" className="btn btn-primary btn-lg">Analyze a public repo</a>
        </div>
      </section>
    </>
  )
}
