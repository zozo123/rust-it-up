import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ProjectCard } from '../components/ProjectCard'
import { CATEGORIES, LANGUAGES, PROJECTS, searchProjects } from '../data/projects'
import { getCompareSelection } from '../lib/storage'
import {
  EFFORT_TIER_LABELS,
  RECOMMENDATION_LABELS,
  effortTierFromP90,
  type EffortTier,
  type Recommendation,
} from '../types'

type View = 'cards' | 'table'

const RECS = Object.keys(RECOMMENDATION_LABELS) as Recommendation[]
const TIERS = Object.keys(EFFORT_TIER_LABELS) as EffortTier[]

export function Projects() {
  const [q, setQ] = useState('')
  const [category, setCategory] = useState('')
  const [lang, setLang] = useState('')
  const [rec, setRec] = useState('')
  const [tier, setTier] = useState('')
  const [minUpside, setMinUpside] = useState(0)
  const [minFeas, setMinFeas] = useState(0)
  const [minOpp, setMinOpp] = useState(0)
  const [view, setView] = useState<View>('cards')
  const [compare, setCompare] = useState(() => getCompareSelection())

  const filtered = useMemo(() => {
    return searchProjects(q)
      .filter((p) => {
        if (category && p.category !== category) return false
        if (lang && p.primaryLanguage !== lang) return false
        if (rec && p.estimate.recommendation !== rec) return false
        if (tier && effortTierFromP90(p.estimate.p90EngineerMonths) !== tier) return false
        if (p.estimate.rustUpside < minUpside) return false
        if (p.estimate.migrationFeasibility < minFeas) return false
        if (p.estimate.opportunityScore < minOpp) return false
        return true
      })
      .sort((a, b) => b.estimate.opportunityScore - a.estimate.opportunityScore)
  }, [q, category, lang, rec, tier, minUpside, minFeas, minOpp])

  return (
    <div className="container page-pad">
      <header className="section-head-row">
        <div className="section-head">
          <p className="eyebrow">Opportunity universe</p>
          <h1>100 open-source examples</h1>
          <p>
            Precomputed, labeled illustrative. Sort by Opportunity Score for orientation — not
            gospel.
          </p>
        </div>
        {compare.length > 0 && (
          <Link to="/compare" className="btn btn-primary btn-sm">
            Compare {compare.length}/3
          </Link>
        )}
      </header>

      <div className="illustrative-banner" role="status">
        <div>
          <strong>Illustrative estimate — not an audited repository scan.</strong>
          <div className="muted" style={{ marginTop: '0.25rem' }}>
            Showing {filtered.length} of {PROJECTS.length}
          </div>
        </div>
      </div>

      <div className="toolbar">
        <input
          className="input search"
          type="search"
          placeholder="Search owner, repo, language…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label="Search projects"
        />
        <select
          className="select"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          aria-label="Category"
        >
          <option value="">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          className="select"
          value={lang}
          onChange={(e) => setLang(e.target.value)}
          aria-label="Language"
        >
          <option value="">All languages</option>
          {LANGUAGES.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
        <select
          className="select"
          value={rec}
          onChange={(e) => setRec(e.target.value)}
          aria-label="Strategy"
        >
          <option value="">All strategies</option>
          {RECS.map((r) => (
            <option key={r} value={r}>
              {RECOMMENDATION_LABELS[r]}
            </option>
          ))}
        </select>
        <select
          className="select"
          value={tier}
          onChange={(e) => setTier(e.target.value)}
          aria-label="Effort tier"
        >
          <option value="">All effort tiers</option>
          {TIERS.map((t) => (
            <option key={t} value={t}>
              {EFFORT_TIER_LABELS[t]}
            </option>
          ))}
        </select>
        <label className="mono muted" style={{ fontSize: '0.75rem' }}>
          Upside ≥
          <input
            type="number"
            min={0}
            max={100}
            value={minUpside}
            onChange={(e) => setMinUpside(Number(e.target.value) || 0)}
            className="input"
            style={{ width: 64, display: 'inline-block', padding: '0.3rem', marginLeft: 4 }}
          />
        </label>
        <label className="mono muted" style={{ fontSize: '0.75rem' }}>
          Feas ≥
          <input
            type="number"
            min={0}
            max={100}
            value={minFeas}
            onChange={(e) => setMinFeas(Number(e.target.value) || 0)}
            className="input"
            style={{ width: 64, display: 'inline-block', padding: '0.3rem', marginLeft: 4 }}
          />
        </label>
        <label className="mono muted" style={{ fontSize: '0.75rem' }}>
          Opp ≥
          <input
            type="number"
            min={0}
            max={100}
            value={minOpp}
            onChange={(e) => setMinOpp(Number(e.target.value) || 0)}
            className="input"
            style={{ width: 64, display: 'inline-block', padding: '0.3rem', marginLeft: 4 }}
          />
        </label>
        <div className="flex gap-1" style={{ marginLeft: 'auto' }}>
          <button
            type="button"
            className={`btn btn-sm ${view === 'cards' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setView('cards')}
          >
            Cards
          </button>
          <button
            type="button"
            className={`btn btn-sm ${view === 'table' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setView('table')}
          >
            Table
          </button>
        </div>
      </div>

      {view === 'cards' ? (
        <div className="card-grid">
          {filtered.map((p) => (
            <ProjectCard key={p.id} project={p} onCompareChange={setCompare} />
          ))}
        </div>
      ) : (
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>Repository</th>
                <th>Lang</th>
                <th>Category</th>
                <th>Upside</th>
                <th>Feasibility</th>
                <th>Commercial</th>
                <th>Opp</th>
                <th>Strategy</th>
                <th>P50–P90</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id}>
                  <td>
                    <Link to={`/r/${p.owner}/${p.repo}`}>
                      {p.owner}/{p.repo}
                    </Link>
                  </td>
                  <td>{p.primaryLanguage}</td>
                  <td>{p.category}</td>
                  <td>{p.estimate.rustUpside}</td>
                  <td>{p.estimate.migrationFeasibility}</td>
                  <td>{p.estimate.commercialSignal}</td>
                  <td>{p.estimate.opportunityScore}</td>
                  <td>{RECOMMENDATION_LABELS[p.estimate.recommendation]}</td>
                  <td>
                    {p.estimate.p50EngineerMonths}–{p.estimate.p90EngineerMonths}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {filtered.length === 0 && (
        <div className="panel" style={{ marginTop: '1.25rem', textAlign: 'center' }}>
          <p className="mb-0">No projects match. Loosen filters or clear search.</p>
        </div>
      )}
    </div>
  )
}
