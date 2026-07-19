import { Link } from 'react-router-dom'
import type { Project } from '../types'
import { RECOMMENDATION_LABELS } from '../types'
import { getCompareSelection, toggleCompare } from '../lib/storage'
import { useState } from 'react'

export function ProjectCard({
  project,
  onCompareChange,
}: {
  project: Project
  onCompareChange?: (ids: string[]) => void
}) {
  const [selected, setSelected] = useState(() => getCompareSelection().includes(project.id))
  const e = project.estimate

  return (
    <article className="project-card" style={{ position: 'relative' }}>
      <div className="flex justify-between items-center gap-1">
        <span className="meta">
          {project.primaryLanguage} · {project.category}
        </span>
        <button
          type="button"
          className={`chip ${selected ? 'active' : ''}`}
          aria-pressed={selected}
          onClick={(ev) => {
            ev.preventDefault()
            const next = toggleCompare(project.id)
            setSelected(next.includes(project.id))
            onCompareChange?.(next)
          }}
          title="Add to compare (max 3)"
        >
          {selected ? 'Comparing' : 'Compare'}
        </button>
      </div>
      <h3>
        <Link to={`/r/${project.owner}/${project.repo}`}>
          {project.owner}/{project.repo}
        </Link>
      </h3>
      <p>{project.description}</p>
      <div className="score-row">
        <span className="score-pill">
          <span className="sr-only">Rust upside</span>
          <span aria-hidden>↑</span> <strong>{e.rustUpside}</strong>
        </span>
        <span className="score-pill">
          feas <strong>{e.migrationFeasibility}</strong>
        </span>
        <span className="score-pill">
          opp <strong>{e.opportunityScore}</strong>
        </span>
      </div>
      <div className="flex justify-between items-center gap-1">
        <span className="badge badge-rust">{RECOMMENDATION_LABELS[e.recommendation]}</span>
        <span className="meta">
          {e.p50EngineerMonths}–{e.p90EngineerMonths} mo
        </span>
      </div>
    </article>
  )
}
