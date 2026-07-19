import { getProject } from '../data/projects'
import type { Project, ScanJob, ScanStatus } from '../types'
import { getScan, saveScan, uid } from './storage'
import type { ParsedGitHubUrl } from './github'

export const SCANNER_VERSION = 'mock-scanner-v1'

const STATUS_FLOW: ScanStatus[] = [
  'queued',
  'fetching_metadata',
  'inspecting_snapshot',
  'scoring_paths',
  'generating_report',
  'complete',
]

const STATUS_MS: Record<ScanStatus, number> = {
  queued: 600,
  fetching_metadata: 900,
  inspecting_snapshot: 1400,
  scoring_paths: 1200,
  generating_report: 1000,
  complete: 0,
  failed: 0,
}

export const STATUS_LABELS: Record<ScanStatus, string> = {
  queued: 'Queued',
  fetching_metadata: 'Fetching metadata',
  inspecting_snapshot: 'Inspecting repository snapshot',
  scoring_paths: 'Scoring migration paths',
  generating_report: 'Generating report',
  complete: 'Complete',
  failed: 'Failed',
}

/** Deterministic pseudo-estimate for unknown repos (mocked) */
export function syntheticProject(parsed: ParsedGitHubUrl): Project {
  const seed = hash(`${parsed.owner}/${parsed.repo}`)
  const upside = 35 + (seed % 50)
  const feasibility = 20 + ((seed >> 3) % 55)
  const commercial = 25 + ((seed >> 6) % 50)
  const opportunityScore = Math.round(upside * 0.45 + feasibility * 0.3 + commercial * 0.25)
  const p50 = Math.round((10 + ((seed >> 2) % 40)) * (100 - feasibility) / 50) / 10
  const p90 = Math.round(p50 * (1.8 + (seed % 10) / 20) * 10) / 10

  let recommendation: Project['estimate']['recommendation'] = 'do_not_rewrite'
  if (upside >= 65 && feasibility >= 55) recommendation = 'replace_subsystem'
  else if (upside >= 60 && feasibility >= 40) recommendation = 'extract_hotspot'
  else if (upside >= 50 && feasibility >= 65) recommendation = 'clean_room'
  else if (upside >= 70 && feasibility < 40) recommendation = 'do_not_rewrite'

  return {
    id: `${parsed.owner}/${parsed.repo}`,
    owner: parsed.owner,
    repo: parsed.repo,
    canonicalUrl: parsed.canonicalUrl,
    defaultBranch: 'main',
    latestSha: shaFromSeed(seed),
    primaryLanguage: ['C', 'C++', 'Go', 'Python', 'JavaScript'][seed % 5],
    category: 'unknown',
    licenseSpdx: null,
    description: 'Live mock analysis for an unlisted public repository.',
    stars: 0,
    illustrative: true,
    estimate: {
      rustUpside: upside,
      migrationFeasibility: feasibility,
      commercialSignal: commercial,
      opportunityScore,
      recommendation,
      confidence: 'low',
      p50EngineerMonths: p50,
      p90EngineerMonths: p90,
      cicdLowDays: 5 + (seed % 15),
      cicdHighDays: 20 + (seed % 40),
      firstSlice: {
        name: 'Identify a bounded library boundary',
        rationale:
          'Without a full static snapshot worker, this mock suggests starting at the smallest compile unit with clear I/O contracts.',
        estimatedWeeks: [2, 8],
        risk: feasibility < 40 ? 'high' : 'medium',
      },
      valueScenarios: [
        {
          category: 'memory_safety',
          label: 'Memory safety',
          hypothesis: 'If the repo is systems-level C/C++, memory safety is the primary non-performance benefit.',
          requiresBenchmark: false,
          confidence: 'medium',
        },
        {
          category: 'latency',
          label: 'Latency',
          hypothesis: 'Any latency claim requires a benchmark plan — not assumed by this score.',
          requiresBenchmark: true,
          confidence: 'low',
        },
      ],
      blockers: [
        {
          title: 'Mock analysis only',
          detail: 'This repository is not in the seed universe. Scores are deterministic placeholders until the worker is connected.',
          severity: 'high',
        },
        {
          title: 'No artifact download',
          detail: 'GitHub Pages demo does not fetch or execute repository contents.',
          severity: 'medium',
        },
      ],
      assumptions: [
        'Illustrative estimate — not an audited repository scan.',
        'Static analysis first. We do not execute public repository code.',
        'Scores will change when the real scanner is connected.',
      ],
      benchmarkPlan: [
        {
          name: 'Baseline capture',
          description: 'Record latency, throughput, RSS, and crash rates on representative workloads.',
        },
        {
          name: 'Parity suite',
          description: 'Define behavioral tests the candidate slice must pass before cutover.',
        },
      ],
      architectureFacts: [
        { label: 'Source', value: 'Mock generator (no live clone)' },
        { label: 'Scanner', value: SCANNER_VERSION },
        { label: 'Confidence', value: 'low' },
      ],
      comparableRust: [],
      modelVersion: SCANNER_VERSION,
    },
  }
}

export function resolveProject(owner: string, repo: string): Project {
  return getProject(owner, repo) ?? syntheticProject({
    owner,
    repo,
    canonicalUrl: `https://github.com/${owner}/${repo}`,
  })
}

export function startScan(parsed: ParsedGitHubUrl): ScanJob {
  const project = resolveProject(parsed.owner, parsed.repo)
  const job: ScanJob = {
    id: uid(),
    owner: parsed.owner,
    repo: parsed.repo,
    commitSha: project.latestSha,
    status: 'queued',
    scannerVersion: SCANNER_VERSION,
    startedAt: new Date().toISOString(),
    completedAt: null,
    failureCode: null,
    failureMessage: null,
    createdAt: new Date().toISOString(),
    projectId: project.id,
  }
  saveScan(job)
  scheduleAdvance(job.id)
  return job
}

function scheduleAdvance(scanId: string): void {
  const tick = () => {
    const scan = getScan(scanId)
    if (!scan) return
    if (scan.status === 'complete' || scan.status === 'failed') return

    const idx = STATUS_FLOW.indexOf(scan.status)
    const next = STATUS_FLOW[Math.min(idx + 1, STATUS_FLOW.length - 1)]
    const updated: ScanJob = {
      ...scan,
      status: next,
      completedAt: next === 'complete' ? new Date().toISOString() : null,
    }
    saveScan(updated)

    if (next !== 'complete' && next !== 'failed') {
      window.setTimeout(tick, STATUS_MS[next] || 800)
    }
  }
  window.setTimeout(tick, STATUS_MS.queued)
}

/** Resume progression if user refreshes mid-scan */
export function ensureScanProgress(scanId: string): ScanJob | undefined {
  const scan = getScan(scanId)
  if (!scan) return undefined
  if (scan.status !== 'complete' && scan.status !== 'failed') {
    scheduleAdvance(scanId)
  }
  return scan
}

function hash(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function shaFromSeed(seed: number): string {
  const hex = (seed.toString(16) + 'a1b2c3d4e5f67890').slice(0, 40)
  return hex.padEnd(40, '0')
}
