import type { Lead, ProjectSignal, ScanJob } from '../types'

const SCANS_KEY = 'rustitup:scans'
const LEADS_KEY = 'rustitup:leads'
const SIGNALS_KEY = 'rustitup:signals'
const COMPARE_KEY = 'rustitup:compare'
const ADMIN_KEY = 'rustitup:admin_authed'

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function writeJson<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value))
}

export function listScans(): ScanJob[] {
  return readJson<ScanJob[]>(SCANS_KEY, [])
}

export function getScan(id: string): ScanJob | undefined {
  return listScans().find((s) => s.id === id)
}

export function saveScan(scan: ScanJob): void {
  const all = listScans()
  const idx = all.findIndex((s) => s.id === scan.id)
  if (idx >= 0) all[idx] = scan
  else all.unshift(scan)
  writeJson(SCANS_KEY, all.slice(0, 200))
}

export function listLeads(): Lead[] {
  return readJson<Lead[]>(LEADS_KEY, [])
}

export function saveLead(lead: Lead): void {
  const all = listLeads()
  all.unshift(lead)
  writeJson(LEADS_KEY, all.slice(0, 500))
}

export function listSignals(): ProjectSignal[] {
  return readJson<ProjectSignal[]>(SIGNALS_KEY, [])
}

export function saveSignal(signal: ProjectSignal): void {
  const all = listSignals()
  all.unshift(signal)
  writeJson(SIGNALS_KEY, all.slice(0, 1000))
}

export function getCompareSelection(): string[] {
  return readJson<string[]>(COMPARE_KEY, [])
}

export function setCompareSelection(ids: string[]): void {
  writeJson(COMPARE_KEY, ids.slice(0, 3))
}

export function toggleCompare(id: string): string[] {
  const cur = getCompareSelection()
  if (cur.includes(id)) {
    const next = cur.filter((x) => x !== id)
    setCompareSelection(next)
    return next
  }
  if (cur.length >= 3) return cur
  const next = [...cur, id]
  setCompareSelection(next)
  return next
}

export function isAdminAuthed(): boolean {
  return readJson(ADMIN_KEY, false)
}

export function setAdminAuthed(v: boolean): void {
  writeJson(ADMIN_KEY, v)
}

export function uid(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}
