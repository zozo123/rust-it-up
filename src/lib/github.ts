export interface ParsedGitHubUrl {
  owner: string
  repo: string
  canonicalUrl: string
}

const GITHUB_RE =
  /^(?:https?:\/\/)?(?:www\.)?github\.com\/([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+?)(?:\.git)?(?:\/.*)?$/i

/** Accepts owner/repo or full GitHub URL */
export function parseGitHubUrl(input: string): ParsedGitHubUrl | null {
  const raw = input.trim()
  if (!raw) return null

  const short = raw.match(/^([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+)$/)
  if (short) {
    const owner = short[1]
    const repo = short[2].replace(/\.git$/, '')
    if (isReserved(owner)) return null
    return {
      owner,
      repo,
      canonicalUrl: `https://github.com/${owner}/${repo}`,
    }
  }

  const m = raw.match(GITHUB_RE)
  if (!m) return null
  const owner = m[1]
  const repo = m[2].replace(/\.git$/, '')
  if (isReserved(owner)) return null
  return {
    owner,
    repo,
    canonicalUrl: `https://github.com/${owner}/${repo}`,
  }
}

function isReserved(owner: string): boolean {
  const reserved = new Set([
    'settings',
    'marketplace',
    'explore',
    'topics',
    'notifications',
    'login',
    'join',
    'features',
    'pricing',
    'about',
    'orgs',
    'pulls',
    'issues',
    'codespaces',
  ])
  return reserved.has(owner.toLowerCase())
}

export function validationMessage(input: string): string | null {
  if (!input.trim()) return 'Enter a GitHub repository URL or owner/repo.'
  if (!parseGitHubUrl(input)) {
    return 'Use a public GitHub URL like https://github.com/jqlang/jq or jqlang/jq.'
  }
  return null
}
