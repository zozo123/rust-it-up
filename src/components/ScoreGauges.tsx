import type { CSSProperties } from 'react'
import type { ProjectEstimate } from '../types'

function colorFor(score: number): string {
  if (score >= 70) return '#c45c26'
  if (score >= 45) return '#c9a227'
  return '#5a6a80'
}

export function ScoreGauges({ estimate }: { estimate: ProjectEstimate }) {
  const items = [
    { label: 'Rust Upside', value: estimate.rustUpside, sub: 'Why Rust might help' },
    {
      label: 'Migration Feasibility',
      value: estimate.migrationFeasibility,
      sub: 'How practical a move is',
    },
    {
      label: 'Commercial Signal',
      value: estimate.commercialSignal,
      sub: 'Buyer / production intensity',
    },
  ]

  return (
    <div className="gauges" role="group" aria-label="Score gauges">
      {items.map((item) => (
        <div className="gauge" key={item.label}>
          <div
            className="gauge-ring"
            style={
              {
                '--pct': item.value,
                '--col': colorFor(item.value),
              } as CSSProperties
            }
            role="img"
            aria-label={`${item.label}: ${item.value} out of 100`}
          >
            <span className="gauge-value">{item.value}</span>
          </div>
          <div className="gauge-label">{item.label}</div>
          <div className="gauge-sub">{item.sub}</div>
        </div>
      ))}
    </div>
  )
}
