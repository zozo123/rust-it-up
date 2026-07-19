export type Recommendation =
  | 'do_not_rewrite'
  | 'extract_hotspot'
  | 'replace_subsystem'
  | 'clean_room'
  | 'full_port'

export type Confidence = 'low' | 'medium' | 'high'

export type EffortTier = 'xs' | 's' | 'm' | 'l' | 'xl' | 'xxl'

export type ValueCategory =
  | 'memory_safety'
  | 'latency'
  | 'throughput'
  | 'memory'
  | 'cloud_cost'
  | 'startup'
  | 'distribution'
  | 'concurrency'

export type ScanStatus =
  | 'queued'
  | 'fetching_metadata'
  | 'inspecting_snapshot'
  | 'scoring_paths'
  | 'generating_report'
  | 'complete'
  | 'failed'

export type Quadrant =
  | 'build_now'
  | 'strategic_program'
  | 'nice_oss_port'
  | 'do_not_rewrite'

export interface FirstSlice {
  name: string
  rationale: string
  estimatedWeeks: [number, number]
  risk: 'low' | 'medium' | 'high'
}

export interface ValueScenario {
  category: ValueCategory
  label: string
  hypothesis: string
  requiresBenchmark: boolean
  confidence: Confidence
}

export interface Blocker {
  title: string
  detail: string
  severity: 'low' | 'medium' | 'high'
}

export interface BenchmarkStep {
  name: string
  description: string
}

export interface ArchitectureFact {
  label: string
  value: string
}

export interface ProjectEstimate {
  rustUpside: number
  migrationFeasibility: number
  commercialSignal: number
  opportunityScore: number
  recommendation: Recommendation
  confidence: Confidence
  p50EngineerMonths: number
  p90EngineerMonths: number
  cicdLowDays: number
  cicdHighDays: number
  firstSlice: FirstSlice
  valueScenarios: ValueScenario[]
  blockers: Blocker[]
  assumptions: string[]
  benchmarkPlan: BenchmarkStep[]
  architectureFacts: ArchitectureFact[]
  comparableRust: string[]
  modelVersion: string
}

export interface Project {
  id: string
  owner: string
  repo: string
  canonicalUrl: string
  defaultBranch: string
  latestSha: string
  primaryLanguage: string
  category: string
  licenseSpdx: string | null
  description: string
  stars: number
  estimate: ProjectEstimate
  featured?: boolean
  illustrative: true
}

export interface ScanJob {
  id: string
  owner: string
  repo: string
  commitSha: string
  status: ScanStatus
  scannerVersion: string
  startedAt: string | null
  completedAt: string | null
  failureCode: string | null
  failureMessage: string | null
  createdAt: string
  projectId: string | null
}

export interface Lead {
  id: string
  scanId: string | null
  projectKey: string | null
  email: string
  company: string | null
  productionUse: boolean | null
  monthlyComputeBand: string | null
  primaryPain: string | null
  requestType: string
  createdAt: string
}

export interface ProjectSignal {
  id: string
  projectKey: string
  signalType: string
  createdAt: string
}

export const RECOMMENDATION_LABELS: Record<Recommendation, string> = {
  do_not_rewrite: 'Do not rewrite',
  extract_hotspot: 'Extract a hotspot',
  replace_subsystem: 'Replace a subsystem',
  clean_room: 'Clean-room compatible implementation',
  full_port: 'Full port',
}

export const EFFORT_TIER_LABELS: Record<EffortTier, string> = {
  xs: 'XS · <1 mo',
  s: 'S · 1–3 mo',
  m: 'M · 3–9 mo',
  l: 'L · 9–24 mo',
  xl: 'XL · 2–5 yr',
  xxl: 'XXL · 5+ yr',
}

export const VALUE_LABELS: Record<ValueCategory, string> = {
  memory_safety: 'Memory safety',
  latency: 'Latency',
  throughput: 'Throughput',
  memory: 'Memory footprint',
  cloud_cost: 'Cloud cost',
  startup: 'Startup time',
  distribution: 'Distribution',
  concurrency: 'Concurrency',
}

export function effortTierFromP90(p90: number): EffortTier {
  if (p90 < 1) return 'xs'
  if (p90 < 3) return 's'
  if (p90 < 9) return 'm'
  if (p90 < 24) return 'l'
  if (p90 < 60) return 'xl'
  return 'xxl'
}

export function quadrantOf(upside: number, feasibility: number): Quadrant {
  if (upside >= 60 && feasibility >= 55) return 'build_now'
  if (upside >= 60 && feasibility < 55) return 'strategic_program'
  if (upside >= 40 && feasibility >= 45) return 'nice_oss_port'
  return 'do_not_rewrite'
}

export function quadrantLabel(q: Quadrant): string {
  switch (q) {
    case 'build_now':
      return 'Build now'
    case 'strategic_program':
      return 'Strategic program'
    case 'nice_oss_port':
      return 'Nice open-source port'
    case 'do_not_rewrite':
      return 'Do not rewrite'
  }
}
