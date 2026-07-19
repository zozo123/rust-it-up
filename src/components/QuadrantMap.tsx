import { quadrantLabel, quadrantOf, type Quadrant } from '../types'

const CELLS: { id: Quadrant; blurb: string }[] = [
  { id: 'strategic_program', blurb: 'High upside, hard path — program, not a weekend.' },
  { id: 'build_now', blurb: 'High upside and workable feasibility — start a slice.' },
  { id: 'do_not_rewrite', blurb: 'Weak economic case for a rewrite program.' },
  { id: 'nice_oss_port', blurb: 'Moderate signal — good OSS exercise, limited buyer pull.' },
]

export function QuadrantMap({ upside, feasibility }: { upside: number; feasibility: number }) {
  const active = quadrantOf(upside, feasibility)
  return (
    <div>
      <div className="flex justify-between items-center gap-1" style={{ marginBottom: '0.5rem' }}>
        <span className="muted" style={{ fontSize: '0.8rem' }}>
          Feasibility →
        </span>
        <span className="badge">{quadrantLabel(active)}</span>
      </div>
      <div className="quadrant" role="list" aria-label="Strategy quadrant">
        {CELLS.map((c) => (
          <div
            key={c.id}
            className={`quad-cell ${c.id === active ? 'active' : ''}`}
            role="listitem"
            aria-current={c.id === active ? 'true' : undefined}
          >
            <strong>{quadrantLabel(c.id)}</strong>
            <span className="muted">{c.blurb}</span>
          </div>
        ))}
      </div>
      <p className="muted" style={{ fontSize: '0.8rem', marginTop: '0.6rem', marginBottom: 0 }}>
        Axes: Rust Upside (vertical) × Migration Feasibility (horizontal). Commercial Signal is
        separate.
      </p>
    </div>
  )
}
