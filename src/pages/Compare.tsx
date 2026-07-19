import { Link } from 'react-router-dom'
import { useState } from 'react'
import { getProjectById } from '../data/projects'
import { getCompareSelection, setCompareSelection, toggleCompare } from '../lib/storage'
import { RECOMMENDATION_LABELS, quadrantLabel, quadrantOf } from '../types'

export function Compare() {
  const [ids, setIds] = useState(() => getCompareSelection())
  const projects = ids.map((id) => getProjectById(id)).filter(Boolean)

  function clear() {
    setCompareSelection([])
    setIds([])
  }

  return (
    <div className="container page-pad">
      <header className="section-head">
        <p className="eyebrow">Side by side</p>
        <h1>Compare repositories</h1>
        <p>
          Select up to three projects from the{' '}
          <Link to="/projects">examples directory</Link>. Compare scores, effort, strategy, risks,
          and likely buyer signal.
        </p>
      </header>

      {projects.length === 0 ? (
        <div className="panel">
          <p className="mb-0">
            No repositories selected. Open{' '}
            <Link to="/projects">Examples</Link> and use the Compare chip on up to three cards.
          </p>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap gap-1" style={{ marginBottom: '1rem' }}>
            {projects.map((p) => (
              <button
                key={p!.id}
                type="button"
                className="chip active"
                onClick={() => setIds(toggleCompare(p!.id))}
              >
                {p!.owner}/{p!.repo} ×
              </button>
            ))}
            <button type="button" className="btn btn-ghost btn-sm" onClick={clear}>
              Clear all
            </button>
          </div>

          <div className="table-wrap">
            <table className="data compare-table">
              <thead>
                <tr>
                  <th>Dimension</th>
                  {projects.map((p) => (
                    <th key={p!.id}>
                      <Link to={`/r/${p!.owner}/${p!.repo}`}>
                        {p!.owner}/{p!.repo}
                      </Link>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Primary language</td>
                  {projects.map((p) => (
                    <td key={p!.id}>{p!.primaryLanguage}</td>
                  ))}
                </tr>
                <tr>
                  <td>Category</td>
                  {projects.map((p) => (
                    <td key={p!.id}>{p!.category}</td>
                  ))}
                </tr>
                <tr>
                  <td>Rust Upside</td>
                  {projects.map((p) => (
                    <td key={p!.id}>{p!.estimate.rustUpside}</td>
                  ))}
                </tr>
                <tr>
                  <td>Migration Feasibility</td>
                  {projects.map((p) => (
                    <td key={p!.id}>{p!.estimate.migrationFeasibility}</td>
                  ))}
                </tr>
                <tr>
                  <td>Commercial Signal</td>
                  {projects.map((p) => (
                    <td key={p!.id}>{p!.estimate.commercialSignal}</td>
                  ))}
                </tr>
                <tr>
                  <td>Opportunity Score</td>
                  {projects.map((p) => (
                    <td key={p!.id}>{p!.estimate.opportunityScore}</td>
                  ))}
                </tr>
                <tr>
                  <td>Strategy</td>
                  {projects.map((p) => (
                    <td key={p!.id}>{RECOMMENDATION_LABELS[p!.estimate.recommendation]}</td>
                  ))}
                </tr>
                <tr>
                  <td>Quadrant</td>
                  {projects.map((p) => (
                    <td key={p!.id}>
                      {quadrantLabel(
                        quadrantOf(p!.estimate.rustUpside, p!.estimate.migrationFeasibility),
                      )}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td>P50–P90 eng-mo</td>
                  {projects.map((p) => (
                    <td key={p!.id}>
                      {p!.estimate.p50EngineerMonths}–{p!.estimate.p90EngineerMonths}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td>CI/CD days</td>
                  {projects.map((p) => (
                    <td key={p!.id}>
                      {p!.estimate.cicdLowDays}–{p!.estimate.cicdHighDays}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td>First slice</td>
                  {projects.map((p) => (
                    <td key={p!.id} style={{ whiteSpace: 'normal', minWidth: 180 }}>
                      {p!.estimate.firstSlice.name}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td>Top risk</td>
                  {projects.map((p) => (
                    <td key={p!.id} style={{ whiteSpace: 'normal', minWidth: 180 }}>
                      {p!.estimate.blockers[0]?.title ?? '—'}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td>Likely buyer signal</td>
                  {projects.map((p) => (
                    <td key={p!.id}>
                      {p!.estimate.commercialSignal >= 75
                        ? 'Strong production / platform buyer'
                        : p!.estimate.commercialSignal >= 50
                          ? 'Moderate product or infra team'
                          : 'Mostly OSS / hobbyist pull'}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td>Confidence</td>
                  {projects.map((p) => (
                    <td key={p!.id}>{p!.estimate.confidence}</td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
