import { useEffect, useState } from 'react'
import type { ProjectEstimate } from '../types'

function colorFor(score: number): string {
  if (score >= 70) return '#e8783a'
  if (score >= 45) return '#c9a227'
  return '#5a6a80'
}

const R = 36
const C = 2 * Math.PI * R

function Gauge({
  label,
  value,
  sub,
  animate,
}: {
  label: string
  value: number
  sub: string
  animate: boolean
}) {
  const [display, setDisplay] = useState(animate ? 0 : value)
  const col = colorFor(value)
  const offset = C - (display / 100) * C

  useEffect(() => {
    if (!animate) {
      setDisplay(value)
      return
    }
    const start = performance.now()
    const dur = 850
    let raf = 0
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur)
      const eased = 1 - Math.pow(1 - p, 3)
      setDisplay(Math.round(value * eased))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [value, animate])

  return (
    <div className="gauge">
      <svg className="gauge-svg" viewBox="0 0 88 88" role="img" aria-label={`${label}: ${value} out of 100`}>
        <circle className="track" cx="44" cy="44" r={R} />
        <circle
          className="fill"
          cx="44"
          cy="44"
          r={R}
          stroke={col}
          strokeDasharray={C}
          strokeDashoffset={offset}
        />
        <text
          x="44"
          y="48"
          textAnchor="middle"
          fill="var(--cream)"
          fontFamily="IBM Plex Mono, monospace"
          fontSize="18"
          fontWeight="600"
        >
          {display}
        </text>
      </svg>
      <div className="gauge-label">{label}</div>
      <div className="gauge-sub">{sub}</div>
    </div>
  )
}

export function ScoreGauges({
  estimate,
  animate = true,
}: {
  estimate: ProjectEstimate
  animate?: boolean
}) {
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
        <Gauge key={item.label} {...item} animate={animate} />
      ))}
    </div>
  )
}

export function ScoreBars({ estimate }: { estimate: ProjectEstimate }) {
  const rows = [
    {
      name: 'Rust Upside',
      value: estimate.rustUpside,
      hint: 'Domain fit for memory safety, concurrency, distribution — not a speed promise.',
    },
    {
      name: 'Migration Feasibility',
      value: estimate.migrationFeasibility,
      hint: 'Boundaries, ABI load, testability, and size of a first valuable slice.',
    },
    {
      name: 'Commercial Signal',
      value: estimate.commercialSignal,
      hint: 'Production intensity and likelihood someone funds the work.',
    },
  ]

  return (
    <div className="score-bars" role="group" aria-label="Score breakdown">
      {rows.map((r) => (
        <div className="score-bar-row" key={r.name}>
          <span className="name">{r.name}</span>
          <span className="val">{r.value}</span>
          <div className="score-track" aria-hidden>
            <div className="score-fill" style={{ width: `${r.value}%` }} />
          </div>
          <p className="hint">{r.hint}</p>
        </div>
      ))}
    </div>
  )
}
