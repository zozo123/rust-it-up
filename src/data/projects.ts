import type {
  Project,
  ProjectEstimate,
  Recommendation,
  Confidence,
  ValueCategory,
} from '../types'

const SCANNER = 'seed-illustrative-v1'

function opp(u: number, f: number, c: number): number {
  return Math.round(u * 0.45 + f * 0.3 + c * 0.25)
}

function est(partial: {
  rustUpside: number
  migrationFeasibility: number
  commercialSignal: number
  recommendation: Recommendation
  confidence: Confidence
  p50: number
  p90: number
  cicdLow: number
  cicdHigh: number
  firstSlice: ProjectEstimate['firstSlice']
  valueScenarios?: ProjectEstimate['valueScenarios']
  blockers?: ProjectEstimate['blockers']
  assumptions?: string[]
  benchmarkPlan?: ProjectEstimate['benchmarkPlan']
  architectureFacts?: ProjectEstimate['architectureFacts']
  comparableRust?: string[]
}): ProjectEstimate {
  const {
    rustUpside,
    migrationFeasibility,
    commercialSignal,
    recommendation,
    confidence,
    p50,
    p90,
    cicdLow,
    cicdHigh,
  } = partial
  return {
    rustUpside,
    migrationFeasibility,
    commercialSignal,
    opportunityScore: opp(rustUpside, migrationFeasibility, commercialSignal),
    recommendation,
    confidence,
    p50EngineerMonths: p50,
    p90EngineerMonths: p90,
    cicdLowDays: cicdLow,
    cicdHighDays: cicdHigh,
    firstSlice: partial.firstSlice,
    valueScenarios: partial.valueScenarios ?? defaultScenarios(['memory_safety']),
    blockers: partial.blockers ?? [
      {
        title: 'Illustrative estimate only',
        detail: 'Not derived from a live repository snapshot.',
        severity: 'medium',
      },
    ],
    assumptions: partial.assumptions ?? [
      'Public API surface remains stable during a first slice.',
      'No guaranteed performance gain without measurement.',
      'Estimate assumes one senior engineer equivalent full-time.',
    ],
    benchmarkPlan: partial.benchmarkPlan ?? [
      {
        name: 'Baseline capture',
        description: 'Record latency, throughput, RSS, and crash rates on representative workloads.',
      },
      {
        name: 'Parity suite',
        description: 'Define behavioral tests that the candidate slice must pass before cutover.',
      },
      {
        name: 'A/B rollout',
        description: 'Shadow traffic or dual-run for a bounded population before exclusive switch.',
      },
    ],
    architectureFacts: partial.architectureFacts ?? [],
    comparableRust: partial.comparableRust ?? [],
    modelVersion: SCANNER,
  }
}

function defaultScenarios(cats: ValueCategory[]): ProjectEstimate['valueScenarios'] {
  const map: Record<ValueCategory, { label: string; hypothesis: string }> = {
    memory_safety: {
      label: 'Memory safety',
      hypothesis: 'Eliminate entire classes of use-after-free and buffer overflow defects in the hot path.',
    },
    latency: {
      label: 'Latency',
      hypothesis: 'Potential p99 improvements if allocation and lock contention are reduced — requires measurement.',
    },
    throughput: {
      label: 'Throughput',
      hypothesis: 'Higher request/s possible under multi-core workloads if concurrency is redesigned, not assumed.',
    },
    memory: {
      label: 'Memory footprint',
      hypothesis: 'RSS reduction is possible with tighter ownership; not guaranteed vs mature C allocators.',
    },
    cloud_cost: {
      label: 'Cloud cost',
      hypothesis: 'Lower instance count only if throughput or memory wins materialize under production load.',
    },
    startup: {
      label: 'Startup time',
      hypothesis: 'Faster cold start possible for CLI/tools with static linking; measure per target.',
    },
    distribution: {
      label: 'Distribution',
      hypothesis: 'Single static binary can simplify packaging vs dynamic C library stacks.',
    },
    concurrency: {
      label: 'Concurrency',
      hypothesis: 'Ownership model can reduce data races; still requires careful redesign of shared state.',
    },
  }
  return cats.map((c) => ({
    category: c,
    label: map[c].label,
    hypothesis: map[c].hypothesis,
    requiresBenchmark: c !== 'memory_safety' && c !== 'distribution',
    confidence: c === 'memory_safety' ? 'high' : 'medium',
  }))
}

function p(
  owner: string,
  repo: string,
  primaryLanguage: string,
  category: string,
  description: string,
  stars: number,
  estimate: ProjectEstimate,
  extra?: { featured?: boolean; licenseSpdx?: string | null; sha?: string },
): Project {
  return {
    id: `${owner}/${repo}`,
    owner,
    repo,
    canonicalUrl: `https://github.com/${owner}/${repo}`,
    defaultBranch: 'master',
    latestSha: extra?.sha ?? 'illustrative00000000000000000000000001',
    primaryLanguage,
    category,
    licenseSpdx: extra?.licenseSpdx ?? 'MIT',
    description,
    stars,
    estimate,
    featured: extra?.featured,
    illustrative: true,
  }
}

/** Top launch / marketing examples with richer reports */
const FEATURED: Project[] = [
  p(
    'libexpat',
    'libexpat',
    'C',
    'parsers',
    'Fast streaming XML parser library used across systems software.',
    1200,
    est({
      rustUpside: 78,
      migrationFeasibility: 72,
      commercialSignal: 68,
      recommendation: 'replace_subsystem',
      confidence: 'medium',
      p50: 4,
      p90: 9,
      cicdLow: 10,
      cicdHigh: 30,
      firstSlice: {
        name: 'UTF-8 / token scanner core',
        rationale: 'Bounded surface, high crash-class risk historically, clear C ABI for dual-ship.',
        estimatedWeeks: [3, 8],
        risk: 'medium',
      },
      valueScenarios: defaultScenarios(['memory_safety', 'latency', 'distribution']),
      blockers: [
        {
          title: 'ABI and embedding compatibility',
          detail: 'Hundreds of dependents expect libexpat C ABI; need shim or dual library period.',
          severity: 'high',
        },
        {
          title: 'Security regression risk',
          detail: 'XML parsers are attack surface; parity fuzzing is mandatory before promotion.',
          severity: 'high',
        },
      ],
      architectureFacts: [
        { label: 'Primary language', value: 'C' },
        { label: 'Domain', value: 'Streaming XML parser' },
        { label: 'Typical consumers', value: 'System libs, browsers, package managers' },
        { label: 'Interface style', value: 'C library + headers' },
      ],
      comparableRust: ['quick-xml', 'xml-rs', 'roxmltree'],
      assumptions: [
        'Illustrative estimate — not an audited repository scan.',
        'Assumes maintainers accept a staged dual-library approach.',
        'No performance claim without harness comparison on real corpora.',
      ],
    }),
    { featured: true, licenseSpdx: 'MIT' },
  ),
  p(
    'yaml',
    'libyaml',
    'C',
    'parsers',
    'Canonical C library for parsing and emitting YAML.',
    1100,
    est({
      rustUpside: 76,
      migrationFeasibility: 70,
      commercialSignal: 62,
      recommendation: 'clean_room',
      confidence: 'medium',
      p50: 5,
      p90: 12,
      cicdLow: 14,
      cicdHigh: 35,
      firstSlice: {
        name: 'Event scanner / emitter dual path',
        rationale: 'YAML event API is well-specified; clean-room can target YAML 1.1 subset first.',
        estimatedWeeks: [4, 10],
        risk: 'medium',
      },
      valueScenarios: defaultScenarios(['memory_safety', 'distribution', 'startup']),
      architectureFacts: [
        { label: 'Primary language', value: 'C' },
        { label: 'Domain', value: 'YAML parse/emit' },
        { label: 'Spec surface', value: 'YAML 1.1 oriented' },
      ],
      comparableRust: ['serde_yaml', 'yaml-rust2', 'saphyr'],
    }),
    { featured: true, licenseSpdx: 'MIT' },
  ),
  p(
    'jqlang',
    'jq',
    'C',
    'cli-tools',
    'Command-line JSON processor used everywhere in ops and data tooling.',
    32000,
    est({
      rustUpside: 74,
      migrationFeasibility: 58,
      commercialSignal: 71,
      recommendation: 'extract_hotspot',
      confidence: 'medium',
      p50: 8,
      p90: 18,
      cicdLow: 15,
      cicdHigh: 40,
      firstSlice: {
        name: 'JSON parser + filter interpreter core',
        rationale: 'Highest value and risk sit in parse/eval; keep CLI shell and modules for later.',
        estimatedWeeks: [6, 14],
        risk: 'high',
      },
      valueScenarios: defaultScenarios(['memory_safety', 'throughput', 'distribution', 'startup']),
      blockers: [
        {
          title: 'Filter language compatibility',
          detail: 'jq language has many edge cases; full behavioral parity is the dominant cost.',
          severity: 'high',
        },
        {
          title: 'Module ecosystem',
          detail: 'Existing scripts and modules assume jq semantics and packaging paths.',
          severity: 'medium',
        },
      ],
      architectureFacts: [
        { label: 'Primary language', value: 'C' },
        { label: 'Domain', value: 'JSON query language / CLI' },
        { label: 'Compatibility bar', value: 'Very high (scripting lingua franca)' },
      ],
      comparableRust: ['jaq', 'jql', 'rq'],
    }),
    { featured: true, licenseSpdx: 'MIT', sha: 'a1b2c3d4e5f60718293a4b5c6d7e8f9012345678' },
  ),
  p(
    'ninja-build',
    'ninja',
    'C++',
    'build-systems',
    'Small build system focused on speed for large codebases.',
    12000,
    est({
      rustUpside: 62,
      migrationFeasibility: 55,
      commercialSignal: 54,
      recommendation: 'extract_hotspot',
      confidence: 'medium',
      p50: 6,
      p90: 14,
      cicdLow: 12,
      cicdHigh: 28,
      firstSlice: {
        name: 'Dependency graph walk + rebuild planner',
        rationale: 'Hot path is graph evaluation; preserve ninja file format and CLI flags.',
        estimatedWeeks: [5, 12],
        risk: 'medium',
      },
      valueScenarios: defaultScenarios(['latency', 'memory_safety', 'concurrency']),
      comparableRust: ['ninja (bindings)', 'cargo incremental', 'sccache patterns'],
    }),
    { featured: true, licenseSpdx: 'Apache-2.0' },
  ),
  p(
    'eclipse-mosquitto',
    'mosquitto',
    'C',
    'networking',
    'Open-source MQTT broker widely deployed in IoT.',
    10000,
    est({
      rustUpside: 80,
      migrationFeasibility: 48,
      commercialSignal: 75,
      recommendation: 'replace_subsystem',
      confidence: 'medium',
      p50: 12,
      p90: 28,
      cicdLow: 20,
      cicdHigh: 50,
      firstSlice: {
        name: 'Packet codec + session state machine',
        rationale: 'Protocol codec is isolatable; broker clustering and plugins come later.',
        estimatedWeeks: [8, 16],
        risk: 'high',
      },
      valueScenarios: defaultScenarios(['memory_safety', 'throughput', 'concurrency', 'cloud_cost']),
      comparableRust: ['rumqttd', 'bytebeam-mqtt'],
    }),
    { featured: true, licenseSpdx: 'EPL-2.0' },
  ),
  p(
    'htop-dev',
    'htop',
    'C',
    'cli-tools',
    'Interactive process viewer for Unix systems.',
    7500,
    est({
      rustUpside: 55,
      migrationFeasibility: 65,
      commercialSignal: 40,
      recommendation: 'extract_hotspot',
      confidence: 'medium',
      p50: 5,
      p90: 11,
      cicdLow: 8,
      cicdHigh: 20,
      firstSlice: {
        name: 'Process metrics collectors',
        rationale: 'Platform-specific readers can be rewritten behind a trait; keep TUI later.',
        estimatedWeeks: [3, 8],
        risk: 'low',
      },
      valueScenarios: defaultScenarios(['memory_safety', 'distribution']),
      comparableRust: ['bottom', 'procs', 'ytop'],
    }),
    { featured: true, licenseSpdx: 'GPL-2.0-or-later' },
  ),
  p(
    'memcached',
    'memcached',
    'C',
    'caching',
    'High-performance distributed memory object caching system.',
    14000,
    est({
      rustUpside: 82,
      migrationFeasibility: 52,
      commercialSignal: 84,
      recommendation: 'replace_subsystem',
      confidence: 'medium',
      p50: 10,
      p90: 24,
      cicdLow: 18,
      cicdHigh: 45,
      firstSlice: {
        name: 'Slab allocator + item hash table',
        rationale: 'Memory model is the product; protocol layer can remain C initially via FFI.',
        estimatedWeeks: [8, 18],
        risk: 'high',
      },
      valueScenarios: defaultScenarios(['memory_safety', 'throughput', 'memory', 'cloud_cost', 'concurrency']),
      blockers: [
        {
          title: 'Operational parity',
          detail: 'Ops tooling, stats, and failure modes must match production expectations.',
          severity: 'high',
        },
        {
          title: 'Multi-threaded cache correctness',
          detail: 'Race-free redesign needed; performance must be re-benchmarked, not assumed.',
          severity: 'high',
        },
      ],
      architectureFacts: [
        { label: 'Primary language', value: 'C' },
        { label: 'Domain', value: 'In-memory key-value cache' },
        { label: 'Protocol', value: 'ASCII / binary memcached' },
      ],
      comparableRust: ['//bcache/memcache-rs patterns', 'foyer', 'moka'],
    }),
    { featured: true, licenseSpdx: 'BSD-3-Clause' },
  ),
  p(
    'pnggroup',
    'libpng',
    'C',
    'media',
    'Official PNG reference library.',
    1500,
    est({
      rustUpside: 85,
      migrationFeasibility: 68,
      commercialSignal: 70,
      recommendation: 'clean_room',
      confidence: 'high',
      p50: 6,
      p90: 14,
      cicdLow: 14,
      cicdHigh: 32,
      firstSlice: {
        name: 'Decoder for common IHDR/IDAT paths',
        rationale: 'Security history justifies memory-safe decoder; keep encoder later.',
        estimatedWeeks: [4, 10],
        risk: 'medium',
      },
      valueScenarios: defaultScenarios(['memory_safety', 'latency', 'distribution']),
      comparableRust: ['image-png', 'png crate'],
    }),
    { featured: true, licenseSpdx: 'Libpng' },
  ),
  p(
    'google',
    'leveldb',
    'C++',
    'storage',
    'Fast key-value storage library by Google.',
    38000,
    est({
      rustUpside: 72,
      migrationFeasibility: 60,
      commercialSignal: 66,
      recommendation: 'clean_room',
      confidence: 'medium',
      p50: 8,
      p90: 16,
      cicdLow: 12,
      cicdHigh: 30,
      firstSlice: {
        name: 'SSTable reader + memtable',
        rationale: 'On-disk format is documented; clean-room can interoperate with existing files.',
        estimatedWeeks: [6, 12],
        risk: 'medium',
      },
      valueScenarios: defaultScenarios(['memory_safety', 'throughput', 'concurrency']),
      comparableRust: ['sled', 'rocksdb-rs bindings', 'redb'],
    }),
    { featured: true, licenseSpdx: 'BSD-3-Clause' },
  ),
  p(
    'libevent',
    'libevent',
    'C',
    'networking',
    'Event notification library for scalable network servers.',
    11500,
    est({
      rustUpside: 70,
      migrationFeasibility: 45,
      commercialSignal: 58,
      recommendation: 'do_not_rewrite',
      confidence: 'medium',
      p50: 14,
      p90: 30,
      cicdLow: 20,
      cicdHigh: 50,
      firstSlice: {
        name: 'None recommended as default',
        rationale: 'Tokio/mio ecosystem already covers most greenfield needs; extract only if embedded in a specific product.',
        estimatedWeeks: [0, 0],
        risk: 'high',
      },
      valueScenarios: defaultScenarios(['memory_safety', 'concurrency']),
      blockers: [
        {
          title: 'Ecosystem displacement',
          detail: 'Rust async runtimes already provide the capability; full port has weak economic case.',
          severity: 'high',
        },
      ],
      comparableRust: ['tokio', 'mio', 'async-std'],
    }),
    { featured: true, licenseSpdx: 'BSD-3-Clause' },
  ),
  // High upside, low feasibility exemplars
  p(
    'postgres',
    'postgres',
    'C',
    'databases',
    'The world\'s most advanced open source relational database.',
    18000,
    est({
      rustUpside: 88,
      migrationFeasibility: 12,
      commercialSignal: 95,
      recommendation: 'do_not_rewrite',
      confidence: 'high',
      p50: 240,
      p90: 600,
      cicdLow: 90,
      cicdHigh: 365,
      firstSlice: {
        name: 'Peripheral extension or utility only',
        rationale: 'Full rewrite is not a rational program. Consider Rust for new extensions, tools, or isolated services around Postgres.',
        estimatedWeeks: [4, 12],
        risk: 'low',
      },
      valueScenarios: defaultScenarios(['memory_safety', 'throughput', 'cloud_cost']),
      blockers: [
        {
          title: 'Decades of correctness & extensions',
          detail: 'SQL semantics, WAL, recovery, and extension ABI make a full port effectively infeasible.',
          severity: 'high',
        },
        {
          title: 'Operational ecosystem',
          detail: 'Replication, backup, and tooling ecosystems are Postgres-specific.',
          severity: 'high',
        },
      ],
      architectureFacts: [
        { label: 'Primary language', value: 'C' },
        { label: 'Scale', value: 'Multi-million LOC class system' },
        { label: 'Rewrite feasibility', value: 'Very low for full port' },
      ],
      comparableRust: ['TiKV (different design)', 'sled', 'risingwave components'],
      assumptions: [
        'Illustrative estimate — not an audited repository scan.',
        'High Rust Upside does not imply rewrite everything.',
        'Strategic value is usually around the database, not a clone.',
      ],
    }),
    { featured: true, licenseSpdx: 'PostgreSQL' },
  ),
  p(
    'FFmpeg',
    'FFmpeg',
    'C',
    'media',
    'Complete, cross-platform solution to record, convert and stream audio and video.',
    52000,
    est({
      rustUpside: 90,
      migrationFeasibility: 15,
      commercialSignal: 88,
      recommendation: 'extract_hotspot',
      confidence: 'high',
      p50: 180,
      p90: 480,
      cicdLow: 60,
      cicdHigh: 200,
      firstSlice: {
        name: 'One demuxer or filter under fuzz harness',
        rationale: 'Security-sensitive codecs/demuxers can be isolated; full FFmpeg port is multi-decade work.',
        estimatedWeeks: [8, 20],
        risk: 'high',
      },
      valueScenarios: defaultScenarios(['memory_safety', 'throughput', 'latency']),
      blockers: [
        {
          title: 'Codec universe size',
          detail: 'Thousands of formats and bit-exact expectations dominate cost.',
          severity: 'high',
        },
      ],
      comparableRust: ['symphonia', 'gstreamer-rs', 'rav1e'],
    }),
    { featured: true, licenseSpdx: 'LGPL-2.1-or-later' },
  ),
  p(
    'python',
    'cpython',
    'Python',
    'runtimes',
    'The Python programming language interpreter.',
    70000,
    est({
      rustUpside: 75,
      migrationFeasibility: 10,
      commercialSignal: 92,
      recommendation: 'do_not_rewrite',
      confidence: 'high',
      p50: 300,
      p90: 720,
      cicdLow: 120,
      cicdHigh: 400,
      firstSlice: {
        name: 'Stdlib module or tooling only',
        rationale: 'CPython full rewrite is not a migration program. Rust is already used surgically (e.g. some tooling/ecosystem crates).',
        estimatedWeeks: [4, 16],
        risk: 'medium',
      },
      valueScenarios: defaultScenarios(['memory_safety', 'startup', 'concurrency']),
      blockers: [
        {
          title: 'Language/runtime contract',
          detail: 'C API, GC semantics, and extension ecosystem define Python more than the implementation language.',
          severity: 'high',
        },
      ],
      comparableRust: ['RustPython (partial)', 'ruff', 'pyo3'],
    }),
    { featured: true, licenseSpdx: 'PSF-2.0' },
  ),
]

type SeedRow = {
  owner: string
  repo: string
  lang: string
  category: string
  desc: string
  stars: number
  upside: number
  feasibility: number
  commercial: number
  rec: Recommendation
  conf: Confidence
  p50: number
  p90: number
  cicdL: number
  cicdH: number
  slice: string
  license?: string
}

const SEED_ROWS: SeedRow[] = [
  { owner: 'redis', repo: 'redis', lang: 'C', category: 'databases', desc: 'In-memory data structure store.', stars: 70000, upside: 84, feasibility: 22, commercial: 96, rec: 'do_not_rewrite', conf: 'high', p50: 120, p90: 300, cicdL: 45, cicdH: 120, slice: 'Module or adjacent proxy only', license: 'RSALv2' },
  { owner: 'nginx', repo: 'nginx', lang: 'C', category: 'networking', desc: 'HTTP and reverse proxy server.', stars: 28000, upside: 78, feasibility: 25, commercial: 90, rec: 'do_not_rewrite', conf: 'high', p50: 100, p90: 240, cicdL: 40, cicdH: 100, slice: 'Dynamic module experiment only' },
  { owner: 'curl', repo: 'curl', lang: 'C', category: 'networking', desc: 'Command line tool and library for transferring data.', stars: 39000, upside: 72, feasibility: 40, commercial: 80, rec: 'extract_hotspot', conf: 'medium', p50: 18, p90: 40, cicdL: 20, cicdH: 50, slice: 'Protocol backend isolation', license: 'curl' },
  { owner: 'openssl', repo: 'openssl', lang: 'C', category: 'security', desc: 'TLS/SSL and cryptography toolkit.', stars: 28000, upside: 92, feasibility: 18, commercial: 95, rec: 'do_not_rewrite', conf: 'high', p50: 200, p90: 500, cicdL: 60, cicdH: 180, slice: 'Algorithm module dual-ship', license: 'Apache-2.0' },
  { owner: 'sqlite', repo: 'sqlite', lang: 'C', category: 'databases', desc: 'C-language SQL database engine.', stars: 8000, upside: 80, feasibility: 20, commercial: 88, rec: 'do_not_rewrite', conf: 'high', p50: 150, p90: 360, cicdL: 50, cicdH: 140, slice: 'VFS or extension in Rust', license: 'blessing' },
  { owner: 'zlib-ng', repo: 'zlib-ng', lang: 'C', category: 'compression', desc: 'zlib replacement with optimizations.', stars: 1800, upside: 70, feasibility: 62, commercial: 55, rec: 'clean_room', conf: 'medium', p50: 5, p90: 12, cicdL: 10, cicdH: 25, slice: 'deflate core with C ABI' },
  { owner: 'madler', repo: 'zlib', lang: 'C', category: 'compression', desc: 'A massively spiffy yet delicately unobtrusive compression library.', stars: 6200, upside: 68, feasibility: 65, commercial: 60, rec: 'clean_room', conf: 'medium', p50: 4, p90: 10, cicdL: 8, cicdH: 22, slice: 'inflate path', license: 'Zlib' },
  { owner: 'lz4', repo: 'lz4', lang: 'C', category: 'compression', desc: 'Extremely fast compression algorithm.', stars: 11000, upside: 65, feasibility: 70, commercial: 58, rec: 'clean_room', conf: 'medium', p50: 3, p90: 8, cicdL: 7, cicdH: 18, slice: 'block format codec', license: 'BSD-2-Clause' },
  { owner: 'facebook', repo: 'zstd', lang: 'C', category: 'compression', desc: 'Zstandard compression library.', stars: 26000, upside: 66, feasibility: 55, commercial: 72, rec: 'extract_hotspot', conf: 'medium', p50: 8, p90: 18, cicdL: 12, cicdH: 30, slice: 'decompressor for common frames', license: 'BSD-3-Clause' },
  { owner: 'google', repo: 'brotli', lang: 'C', category: 'compression', desc: 'Brotli compression format.', stars: 14000, upside: 64, feasibility: 60, commercial: 60, rec: 'clean_room', conf: 'medium', p50: 5, p90: 12, cicdL: 10, cicdH: 24, slice: 'decoder only', license: 'MIT' },
  { owner: 'libjpeg-turbo', repo: 'libjpeg-turbo', lang: 'C', category: 'media', desc: 'SIMD-accelerated JPEG codec.', stars: 4200, upside: 75, feasibility: 48, commercial: 68, rec: 'extract_hotspot', conf: 'medium', p50: 10, p90: 22, cicdL: 15, cicdH: 35, slice: 'baseline decoder path', license: 'IJG-BSD' },
  { owner: 'webmproject', repo: 'libwebp', lang: 'C', category: 'media', desc: 'WebP image format library.', stars: 2300, upside: 78, feasibility: 58, commercial: 65, rec: 'clean_room', conf: 'medium', p50: 7, p90: 16, cicdL: 12, cicdH: 28, slice: 'lossy decoder', license: 'BSD-3-Clause' },
  { owner: 'AOMediaCodec', repo: 'libavif', lang: 'C', category: 'media', desc: 'Library for encoding and decoding AVIF.', stars: 1900, upside: 72, feasibility: 55, commercial: 62, rec: 'extract_hotspot', conf: 'medium', p50: 8, p90: 18, cicdL: 14, cicdH: 32, slice: 'AVIF container demux' },
  { owner: 'xiph', repo: 'ogg', lang: 'C', category: 'media', desc: 'Ogg bitstream library.', stars: 500, upside: 55, feasibility: 75, commercial: 30, rec: 'full_port', conf: 'medium', p50: 2, p90: 5, cicdL: 5, cicdH: 12, slice: 'Page/packet parser', license: 'BSD-3-Clause' },
  { owner: 'xiph', repo: 'vorbis', lang: 'C', category: 'media', desc: 'Vorbis audio codec.', stars: 1500, upside: 60, feasibility: 50, commercial: 35, rec: 'extract_hotspot', conf: 'low', p50: 8, p90: 18, cicdL: 12, cicdH: 30, slice: 'Decoder core' },
  { owner: 'protocolbuffers', repo: 'protobuf', lang: 'C++', category: 'serialization', desc: 'Protocol Buffers — Google\'s data interchange format.', stars: 69000, upside: 58, feasibility: 35, commercial: 85, rec: 'do_not_rewrite', conf: 'high', p50: 40, p90: 90, cicdL: 25, cicdH: 60, slice: 'Use prost/tonic ecosystem instead', license: 'BSD-3-Clause' },
  { owner: 'msgpack', repo: 'msgpack-c', lang: 'C', category: 'serialization', desc: 'MessagePack implementation for C/C++.', stars: 3100, upside: 62, feasibility: 72, commercial: 48, rec: 'clean_room', conf: 'medium', p50: 2, p90: 5, cicdL: 5, cicdH: 12, slice: 'Pack/unpack core', license: 'BSL-1.0' },
  { owner: 'capnproto', repo: 'capnproto', lang: 'C++', category: 'serialization', desc: 'Cap\'n Proto serialization/RPC system.', stars: 12500, upside: 55, feasibility: 40, commercial: 50, rec: 'do_not_rewrite', conf: 'medium', p50: 20, p90: 48, cicdL: 20, cicdH: 50, slice: 'Prefer existing capnp Rust crates' },
  { owner: 'facebook', repo: 'folly', lang: 'C++', category: 'libraries', desc: 'Facebook Open-source Library.', stars: 30000, upside: 50, feasibility: 25, commercial: 55, rec: 'do_not_rewrite', conf: 'high', p50: 60, p90: 140, cicdL: 30, cicdH: 80, slice: 'None — use Rust std/tokio ecosystem', license: 'Apache-2.0' },
  { owner: 'fmtlib', repo: 'fmt', lang: 'C++', category: 'libraries', desc: 'A modern formatting library.', stars: 22000, upside: 40, feasibility: 70, commercial: 35, rec: 'do_not_rewrite', conf: 'medium', p50: 3, p90: 7, cicdL: 5, cicdH: 12, slice: 'Not recommended; format! exists' },
  { owner: 'nlohmann', repo: 'json', lang: 'C++', category: 'serialization', desc: 'JSON for Modern C++.', stars: 47000, upside: 45, feasibility: 75, commercial: 40, rec: 'do_not_rewrite', conf: 'medium', p50: 2, p90: 4, cicdL: 3, cicdH: 8, slice: 'Use serde_json instead' },
  { owner: 'gabime', repo: 'spdlog', lang: 'C++', category: 'libraries', desc: 'Fast C++ logging library.', stars: 27000, upside: 42, feasibility: 72, commercial: 38, rec: 'do_not_rewrite', conf: 'medium', p50: 2, p90: 5, cicdL: 4, cicdH: 10, slice: 'Use tracing/log crates' },
  { owner: 'gflags', repo: 'gflags', lang: 'C++', category: 'cli-tools', desc: 'Commandline flags module for C++.', stars: 3000, upside: 35, feasibility: 80, commercial: 25, rec: 'do_not_rewrite', conf: 'high', p50: 1, p90: 2, cicdL: 2, cicdH: 5, slice: 'Use clap' },
  { owner: 'glog', repo: 'glog', lang: 'C++', category: 'libraries', desc: 'C++ implementation of the Google logging module.', stars: 7500, upside: 38, feasibility: 75, commercial: 28, rec: 'do_not_rewrite', conf: 'high', p50: 1.5, p90: 3, cicdL: 3, cicdH: 7, slice: 'Use tracing' },
  { owner: 'c-ares', repo: 'c-ares', lang: 'C', category: 'networking', desc: 'Asynchronous DNS resolver library.', stars: 2000, upside: 70, feasibility: 60, commercial: 55, rec: 'replace_subsystem', conf: 'medium', p50: 5, p90: 12, cicdL: 10, cicdH: 25, slice: 'Resolver client API', license: 'MIT' },
  { owner: 'libuv', repo: 'libuv', lang: 'C', category: 'networking', desc: 'Cross-platform asynchronous I/O.', stars: 26000, upside: 68, feasibility: 35, commercial: 70, rec: 'do_not_rewrite', conf: 'medium', p50: 24, p90: 55, cicdL: 25, cicdH: 60, slice: 'Prefer tokio/mio; extract only for embedders' },
  { owner: 'jedisct1', repo: 'libsodium', lang: 'C', category: 'security', desc: 'Modern easy-to-use crypto library.', stars: 13500, upside: 75, feasibility: 55, commercial: 72, rec: 'extract_hotspot', conf: 'medium', p50: 8, p90: 18, cicdL: 15, cicdH: 35, slice: 'High-level API with sodiumoxide/libsodium-sys path', license: 'ISC' },
  { owner: 'randombit', repo: 'botan', lang: 'C++', category: 'security', desc: 'Cryptography toolkit.', stars: 2800, upside: 70, feasibility: 40, commercial: 50, rec: 'do_not_rewrite', conf: 'medium', p50: 30, p90: 70, cicdL: 25, cicdH: 60, slice: 'Use RustCrypto crates' },
  { owner: 'ARMmbed', repo: 'mbedtls', lang: 'C', category: 'security', desc: 'Open source SSL library for embedded.', stars: 6000, upside: 82, feasibility: 42, commercial: 78, rec: 'replace_subsystem', conf: 'medium', p50: 16, p90: 36, cicdL: 20, cicdH: 50, slice: 'TLS 1.3 record layer experiment', license: 'Apache-2.0' },
  { owner: 'wolfSSL', repo: 'wolfssl', lang: 'C', category: 'security', desc: 'Embedded SSL/TLS library.', stars: 2600, upside: 80, feasibility: 40, commercial: 75, rec: 'replace_subsystem', conf: 'medium', p50: 18, p90: 40, cicdL: 22, cicdH: 55, slice: 'Crypto primitive wrappers first' },
  { owner: 'haproxy', repo: 'haproxy', lang: 'C', category: 'networking', desc: 'Reliable high-performance TCP/HTTP load balancer.', stars: 6000, upside: 76, feasibility: 22, commercial: 85, rec: 'do_not_rewrite', conf: 'high', p50: 80, p90: 200, cicdL: 40, cicdH: 100, slice: 'Filter/module in Rust only' },
  { owner: 'varnishcache', repo: 'varnish-cache', lang: 'C', category: 'caching', desc: 'HTTP reverse proxy cache.', stars: 4000, upside: 72, feasibility: 30, commercial: 70, rec: 'extract_hotspot', conf: 'medium', p50: 20, p90: 48, cicdL: 25, cicdH: 55, slice: 'VMOD or storage backend' },
  { owner: 'valkey-io', repo: 'valkey', lang: 'C', category: 'databases', desc: 'High-performance key/value datastore (Redis fork).', stars: 23000, upside: 84, feasibility: 24, commercial: 90, rec: 'do_not_rewrite', conf: 'high', p50: 100, p90: 260, cicdL: 40, cicdH: 110, slice: 'Module or client tooling' },
  { owner: 'etcd-io', repo: 'etcd', lang: 'Go', category: 'databases', desc: 'Distributed reliable key-value store.', stars: 51000, upside: 48, feasibility: 28, commercial: 80, rec: 'do_not_rewrite', conf: 'medium', p50: 50, p90: 120, cicdL: 30, cicdH: 70, slice: 'Not recommended as full port' },
  { owner: 'hashicorp', repo: 'consul', lang: 'Go', category: 'networking', desc: 'Service networking platform.', stars: 29000, upside: 45, feasibility: 25, commercial: 75, rec: 'do_not_rewrite', conf: 'medium', p50: 60, p90: 140, cicdL: 30, cicdH: 80, slice: 'Agent-side utility only' },
  { owner: 'coredns', repo: 'coredns', lang: 'Go', category: 'networking', desc: 'DNS server that chains plugins.', stars: 14000, upside: 50, feasibility: 35, commercial: 65, rec: 'extract_hotspot', conf: 'medium', p50: 12, p90: 28, cicdL: 15, cicdH: 40, slice: 'High-QPS plugin in Rust via FFI' },
  { owner: 'prometheus', repo: 'prometheus', lang: 'Go', category: 'observability', desc: 'Monitoring system and time series database.', stars: 61000, upside: 52, feasibility: 22, commercial: 82, rec: 'do_not_rewrite', conf: 'high', p50: 80, p90: 200, cicdL: 40, cicdH: 100, slice: 'Remote-write adapter or TSDB experiment' },
  { owner: 'grafana', repo: 'loki', lang: 'Go', category: 'observability', desc: 'Like Prometheus, but for logs.', stars: 27000, upside: 55, feasibility: 28, commercial: 78, rec: 'extract_hotspot', conf: 'medium', p50: 24, p90: 55, cicdL: 20, cicdH: 50, slice: 'Chunk compression / parse pipeline' },
  { owner: 'jaegertracing', repo: 'jaeger', lang: 'Go', category: 'observability', desc: 'Distributed tracing platform.', stars: 22000, upside: 48, feasibility: 30, commercial: 70, rec: 'do_not_rewrite', conf: 'medium', p50: 30, p90: 70, cicdL: 20, cicdH: 50, slice: 'Collector component only if needed' },
  { owner: 'fluent', repo: 'fluent-bit', lang: 'C', category: 'observability', desc: 'Fast and lightweight logs processor.', stars: 7000, upside: 74, feasibility: 45, commercial: 72, rec: 'replace_subsystem', conf: 'medium', p50: 14, p90: 32, cicdL: 18, cicdH: 45, slice: 'Input/filter plugin chain' },
  { owner: 'rsyslog', repo: 'rsyslog', lang: 'C', category: 'observability', desc: 'Rocket-fast system for log processing.', stars: 2200, upside: 70, feasibility: 40, commercial: 55, rec: 'extract_hotspot', conf: 'medium', p50: 12, p90: 28, cicdL: 15, cicdH: 40, slice: 'Parser module' },
  { owner: 'collectd', repo: 'collectd', lang: 'C', category: 'observability', desc: 'System statistics collection daemon.', stars: 3400, upside: 60, feasibility: 50, commercial: 45, rec: 'extract_hotspot', conf: 'medium', p50: 8, p90: 18, cicdL: 12, cicdH: 28, slice: 'Write plugin' },
  { owner: 'netdata', repo: 'netdata', lang: 'C', category: 'observability', desc: 'Real-time performance monitoring.', stars: 77000, upside: 65, feasibility: 32, commercial: 70, rec: 'extract_hotspot', conf: 'medium', p50: 24, p90: 55, cicdL: 20, cicdH: 50, slice: 'Collector agent module' },
  { owner: 'tmux', repo: 'tmux', lang: 'C', category: 'cli-tools', desc: 'Terminal multiplexer.', stars: 40000, upside: 48, feasibility: 55, commercial: 35, rec: 'do_not_rewrite', conf: 'medium', p50: 12, p90: 28, cicdL: 15, cicdH: 35, slice: 'Low ROI vs maintenance' },
  { owner: 'vim', repo: 'vim', lang: 'C', category: 'editors', desc: 'The official Vim repository.', stars: 40000, upside: 45, feasibility: 20, commercial: 40, rec: 'do_not_rewrite', conf: 'high', p50: 80, p90: 200, cicdL: 40, cicdH: 100, slice: 'None — use helix/neovim strategies' },
  { owner: 'neovim', repo: 'neovim', lang: 'C', category: 'editors', desc: 'Vim-fork focused on extensibility.', stars: 95000, upside: 50, feasibility: 25, commercial: 48, rec: 'do_not_rewrite', conf: 'high', p50: 60, p90: 150, cicdL: 30, cicdH: 80, slice: 'Tree-sitter / RPC tooling only' },
  { owner: 'git', repo: 'git', lang: 'C', category: 'vcs', desc: 'Git source code mirror.', stars: 58000, upside: 70, feasibility: 18, commercial: 85, rec: 'do_not_rewrite', conf: 'high', p50: 120, p90: 300, cicdL: 50, cicdH: 140, slice: 'Helper binary (e.g. credential/filter)' },
  { owner: 'libgit2', repo: 'libgit2', lang: 'C', category: 'vcs', desc: 'Portable C implementation of Git core methods.', stars: 10000, upside: 68, feasibility: 45, commercial: 60, rec: 'extract_hotspot', conf: 'medium', p50: 16, p90: 36, cicdL: 18, cicdH: 45, slice: 'Object store reader', license: 'GPL-2.0-only WITH GCC-exception-2.0' },
  { owner: 'cli', repo: 'cli', lang: 'Go', category: 'cli-tools', desc: 'GitHub\'s official command line tool.', stars: 42000, upside: 40, feasibility: 50, commercial: 55, rec: 'do_not_rewrite', conf: 'medium', p50: 18, p90: 40, cicdL: 15, cicdH: 35, slice: 'Not recommended' },
  { owner: 'cli', repo: 'uv', lang: 'Rust', category: 'cli-tools', desc: 'Extremely fast Python package manager.', stars: 70000, upside: 15, feasibility: 95, commercial: 80, rec: 'do_not_rewrite', conf: 'high', p50: 0.1, p90: 0.5, cicdL: 0, cicdH: 1, slice: 'Already Rust — improve in place' },
  { owner: 'BurntSushi', repo: 'ripgrep', lang: 'Rust', category: 'cli-tools', desc: 'Recursively search directories for a regex pattern.', stars: 56000, upside: 12, feasibility: 95, commercial: 60, rec: 'do_not_rewrite', conf: 'high', p50: 0.1, p90: 0.5, cicdL: 0, cicdH: 1, slice: 'Already Rust' },
  { owner: 'sharkdp', repo: 'fd', lang: 'Rust', category: 'cli-tools', desc: 'Simple, fast alternative to find.', stars: 40000, upside: 12, feasibility: 95, commercial: 45, rec: 'do_not_rewrite', conf: 'high', p50: 0.1, p90: 0.5, cicdL: 0, cicdH: 1, slice: 'Already Rust' },
  { owner: 'junegunn', repo: 'fzf', lang: 'Go', category: 'cli-tools', desc: 'Command-line fuzzy finder.', stars: 75000, upside: 42, feasibility: 55, commercial: 48, rec: 'do_not_rewrite', conf: 'medium', p50: 6, p90: 14, cicdL: 8, cicdH: 20, slice: 'Low economic case' },
  { owner: 'stedolan', repo: 'jq', lang: 'C', category: 'cli-tools', desc: 'Legacy mirror reference for jq lineage.', stars: 30000, upside: 74, feasibility: 58, commercial: 70, rec: 'extract_hotspot', conf: 'medium', p50: 8, p90: 18, cicdL: 15, cicdH: 40, slice: 'See jqlang/jq' },
  { owner: 'ggreer', repo: 'the_silver_searcher', lang: 'C', category: 'cli-tools', desc: 'A code-searching tool similar to ack, but faster.', stars: 27000, upside: 55, feasibility: 70, commercial: 40, rec: 'do_not_rewrite', conf: 'medium', p50: 3, p90: 7, cicdL: 5, cicdH: 12, slice: 'Prefer ripgrep' },
  { owner: 'koalaman', repo: 'shellcheck', lang: 'Haskell', category: 'cli-tools', desc: 'Shell script analysis tool.', stars: 39000, upside: 40, feasibility: 35, commercial: 45, rec: 'do_not_rewrite', conf: 'medium', p50: 12, p90: 28, cicdL: 12, cicdH: 30, slice: 'Low ROI' },
  { owner: 'mvdan', repo: 'sh', lang: 'Go', category: 'cli-tools', desc: 'Shell parser, formatter, and interpreter.', stars: 8000, upside: 45, feasibility: 50, commercial: 40, rec: 'do_not_rewrite', conf: 'medium', p50: 8, p90: 18, cicdL: 10, cicdH: 24, slice: 'Optional' },
  { owner: 'tree-sitter', repo: 'tree-sitter', lang: 'Rust', category: 'parsers', desc: 'Incremental parsing system for programming tools.', stars: 22000, upside: 20, feasibility: 90, commercial: 70, rec: 'do_not_rewrite', conf: 'high', p50: 0.2, p90: 1, cicdL: 0, cicdH: 2, slice: 'Already largely Rust core' },
  { owner: 'swc-project', repo: 'swc', lang: 'Rust', category: 'compilers', desc: 'Rust-based platform for the Web.', stars: 33000, upside: 18, feasibility: 92, commercial: 85, rec: 'do_not_rewrite', conf: 'high', p50: 0.2, p90: 1, cicdL: 0, cicdH: 2, slice: 'Already Rust' },
  { owner: 'oxc-project', repo: 'oxc', lang: 'Rust', category: 'compilers', desc: 'Collection of JavaScript tools written in Rust.', stars: 18000, upside: 15, feasibility: 94, commercial: 80, rec: 'do_not_rewrite', conf: 'high', p50: 0.1, p90: 0.5, cicdL: 0, cicdH: 1, slice: 'Already Rust' },
  { owner: 'evanw', repo: 'esbuild', lang: 'Go', category: 'compilers', desc: 'Extremely fast bundler for the web.', stars: 40000, upside: 58, feasibility: 30, commercial: 85, rec: 'do_not_rewrite', conf: 'medium', p50: 30, p90: 70, cicdL: 25, cicdH: 60, slice: 'Competing rewrite already exists (swc/oxc)' },
  { owner: 'webpack', repo: 'webpack', lang: 'JavaScript', category: 'compilers', desc: 'A bundler for javascript and friends.', stars: 66000, upside: 62, feasibility: 20, commercial: 75, rec: 'do_not_rewrite', conf: 'high', p50: 50, p90: 120, cicdL: 30, cicdH: 80, slice: 'Not rational; migrate users to rust tooling' },
  { owner: 'babel', repo: 'babel', lang: 'JavaScript', category: 'compilers', desc: 'Compiler for writing next generation JavaScript.', stars: 44000, upside: 60, feasibility: 22, commercial: 70, rec: 'do_not_rewrite', conf: 'high', p50: 40, p90: 100, cicdL: 25, cicdH: 70, slice: 'Prefer SWC/oxc adoption' },
  { owner: 'prettier', repo: 'prettier', lang: 'JavaScript', category: 'cli-tools', desc: 'Opinionated code formatter.', stars: 52000, upside: 55, feasibility: 30, commercial: 60, rec: 'do_not_rewrite', conf: 'medium', p50: 20, p90: 48, cicdL: 15, cicdH: 40, slice: 'Language plugins already fragment' },
  { owner: 'eslint', repo: 'eslint', lang: 'JavaScript', category: 'cli-tools', desc: 'Find and fix problems in JavaScript code.', stars: 27000, upside: 58, feasibility: 28, commercial: 72, rec: 'do_not_rewrite', conf: 'medium', p50: 24, p90: 55, cicdL: 20, cicdH: 50, slice: 'Ecosystem moving to oxlint etc.' },
  { owner: 'facebook', repo: 'zstd', lang: 'C', category: 'compression', desc: 'Fast real-time compression algorithm.', stars: 26000, upside: 66, feasibility: 55, commercial: 72, rec: 'extract_hotspot', conf: 'medium', p50: 8, p90: 18, cicdL: 12, cicdH: 30, slice: 'See facebook/zstd primary' },
  { owner: 'google', repo: 're2', lang: 'C++', category: 'libraries', desc: 'Fast, safe, thread-friendly regex engine.', stars: 9500, upside: 72, feasibility: 55, commercial: 65, rec: 'clean_room', conf: 'medium', p50: 8, p90: 18, cicdL: 12, cicdH: 30, slice: 'DFA engine core', license: 'BSD-3-Clause' },
  { owner: 'PCRE2Project', repo: 'pcre2', lang: 'C', category: 'libraries', desc: 'Perl-Compatible Regular Expressions.', stars: 1200, upside: 78, feasibility: 48, commercial: 70, rec: 'extract_hotspot', conf: 'medium', p50: 12, p90: 28, cicdL: 15, cicdH: 40, slice: 'Match engine with fuzz harness', license: 'BSD-3-Clause' },
  { owner: 'libarchive', repo: 'libarchive', lang: 'C', category: 'compression', desc: 'Multi-format archive library.', stars: 3500, upside: 80, feasibility: 55, commercial: 62, rec: 'replace_subsystem', conf: 'medium', p50: 10, p90: 22, cicdL: 14, cicdH: 35, slice: 'tar/zip readers', license: 'BSD-2-Clause' },
  { owner: 'tukaani-project', repo: 'xz', lang: 'C', category: 'compression', desc: 'XZ Utils and liblzma.', stars: 1500, upside: 82, feasibility: 50, commercial: 68, rec: 'clean_room', conf: 'high', p50: 8, p90: 18, cicdL: 14, cicdH: 35, slice: 'lzma decoder with supply-chain scrutiny', license: '0BSD' },
  { owner: 'libssh2', repo: 'libssh2', lang: 'C', category: 'security', desc: 'Client-side C library for SSH2.', stars: 1500, upside: 76, feasibility: 52, commercial: 60, rec: 'clean_room', conf: 'medium', p50: 10, p90: 22, cicdL: 15, cicdH: 35, slice: 'Transport + auth methods', license: 'BSD-3-Clause' },
  { owner: 'libssh', repo: 'libssh-mirror', lang: 'C', category: 'security', desc: 'Multiplatform C library implementing SSHv2.', stars: 900, upside: 74, feasibility: 48, commercial: 58, rec: 'replace_subsystem', conf: 'medium', p50: 12, p90: 28, cicdL: 16, cicdH: 40, slice: 'Server path isolation' },
  { owner: 'OpenVPN', repo: 'openvpn', lang: 'C', category: 'networking', desc: 'Open source VPN daemon.', stars: 13000, upside: 78, feasibility: 35, commercial: 80, rec: 'extract_hotspot', conf: 'medium', p50: 24, p90: 55, cicdL: 25, cicdH: 60, slice: 'Crypto/data channel', license: 'GPL-2.0-only' },
  { owner: 'WireGuard', repo: 'wireguard-tools', lang: 'C', category: 'networking', desc: 'Tools for configuring WireGuard.', stars: 5000, upside: 55, feasibility: 60, commercial: 70, rec: 'extract_hotspot', conf: 'medium', p50: 4, p90: 10, cicdL: 8, cicdH: 20, slice: 'Userspace tools; kernel stays C' },
  { owner: 'shadowsocks', repo: 'shadowsocks-libev', lang: 'C', category: 'networking', desc: 'Libev port of shadowsocks.', stars: 9000, upside: 65, feasibility: 55, commercial: 50, rec: 'full_port', conf: 'medium', p50: 6, p90: 14, cicdL: 10, cicdH: 25, slice: 'Already many Rust ports exist' },
  { owner: 'nmap', repo: 'nmap', lang: 'C++', category: 'security', desc: 'Network exploration tool and security scanner.', stars: 12000, upside: 60, feasibility: 30, commercial: 65, rec: 'extract_hotspot', conf: 'low', p50: 30, p90: 70, cicdL: 25, cicdH: 60, slice: 'NSE-independent probe engine' },
  { owner: 'wireshark', repo: 'wireshark', lang: 'C', category: 'networking', desc: 'Network protocol analyzer.', stars: 9000, upside: 70, feasibility: 15, commercial: 72, rec: 'do_not_rewrite', conf: 'high', p50: 150, p90: 360, cicdL: 50, cicdH: 150, slice: 'Dissector plugin only' },
  { owner: 'tcpdump', repo: 'tcpdump', lang: 'C', category: 'networking', desc: 'Network packet analyzer.', stars: 3000, upside: 62, feasibility: 55, commercial: 45, rec: 'extract_hotspot', conf: 'medium', p50: 6, p90: 14, cicdL: 10, cicdH: 24, slice: 'Printer backends' },
  { owner: 'the-tcpdump-group', repo: 'libpcap', lang: 'C', category: 'networking', desc: 'Packet capture library.', stars: 3200, upside: 68, feasibility: 50, commercial: 55, rec: 'replace_subsystem', conf: 'medium', p50: 8, p90: 18, cicdL: 12, cicdH: 30, slice: 'Capture loop + filter compile' },
  { owner: 'OpenRC', repo: 'openrc', lang: 'C', category: 'systems', desc: 'Dependency-based init system.', stars: 1800, upside: 50, feasibility: 45, commercial: 30, rec: 'do_not_rewrite', conf: 'medium', p50: 12, p90: 28, cicdL: 15, cicdH: 35, slice: 'Low commercial signal' },
  { owner: 'systemd', repo: 'systemd', lang: 'C', category: 'systems', desc: 'System and service manager for Linux.', stars: 15000, upside: 65, feasibility: 12, commercial: 75, rec: 'do_not_rewrite', conf: 'high', p50: 200, p90: 500, cicdL: 80, cicdH: 200, slice: 'Not a rewrite candidate' },
  { owner: 'util-linux', repo: 'util-linux', lang: 'C', category: 'systems', desc: 'Miscellaneous utilities for Linux.', stars: 3000, upside: 55, feasibility: 40, commercial: 40, rec: 'extract_hotspot', conf: 'medium', p50: 10, p90: 24, cicdL: 12, cicdH: 30, slice: 'Single utility rewrite (e.g. mount helpers)' },
  { owner: 'shadow-maint', repo: 'shadow', lang: 'C', category: 'systems', desc: 'Shadow password suite.', stars: 800, upside: 72, feasibility: 50, commercial: 55, rec: 'replace_subsystem', conf: 'medium', p50: 8, p90: 18, cicdL: 14, cicdH: 35, slice: 'passwd/login path with careful audit' },
  { owner: 'sudo-project', repo: 'sudo', lang: 'C', category: 'systems', desc: 'Utility to execute commands as another user.', stars: 1500, upside: 85, feasibility: 45, commercial: 80, rec: 'clean_room', conf: 'high', p50: 12, p90: 28, cicdL: 20, cicdH: 50, slice: 'Policy parse + exec bridge', license: 'ISC-like' },
  { owner: 'openssh', repo: 'openssh-portable', lang: 'C', category: 'security', desc: 'Portable OpenSSH.', stars: 3500, upside: 88, feasibility: 28, commercial: 92, rec: 'do_not_rewrite', conf: 'high', p50: 60, p90: 150, cicdL: 40, cicdH: 100, slice: 'Auxiliary tool only; full port high risk' },
  { owner: 'krb5', repo: 'krb5', lang: 'C', category: 'security', desc: 'MIT Kerberos.', stars: 600, upside: 75, feasibility: 30, commercial: 70, rec: 'extract_hotspot', conf: 'low', p50: 30, p90: 70, cicdL: 25, cicdH: 60, slice: 'Client library subset' },
  { owner: 'heimdal', repo: 'heimdal', lang: 'C', category: 'security', desc: 'Heimdal Kerberos.', stars: 500, upside: 72, feasibility: 32, commercial: 55, rec: 'extract_hotspot', conf: 'low', p50: 28, p90: 65, cicdL: 22, cicdH: 55, slice: 'GSSAPI shim' },
  { owner: 'openldap', repo: 'openldap', lang: 'C', category: 'networking', desc: 'Open source LDAP suite.', stars: 600, upside: 68, feasibility: 25, commercial: 60, rec: 'do_not_rewrite', conf: 'medium', p50: 40, p90: 100, cicdL: 30, cicdH: 70, slice: 'Client tools' },
  { owner: 'mariadb', repo: 'server', lang: 'C++', category: 'databases', desc: 'MariaDB server.', stars: 6500, upside: 80, feasibility: 12, commercial: 85, rec: 'do_not_rewrite', conf: 'high', p50: 200, p90: 500, cicdL: 80, cicdH: 200, slice: 'Storage engine experiment only' },
  { owner: 'mysql', repo: 'mysql-server', lang: 'C++', category: 'databases', desc: 'MySQL Server.', stars: 12000, upside: 80, feasibility: 10, commercial: 90, rec: 'do_not_rewrite', conf: 'high', p50: 250, p90: 600, cicdL: 90, cicdH: 250, slice: 'Not a full-port candidate' },
  { owner: 'ClickHouse', repo: 'ClickHouse', lang: 'C++', category: 'databases', desc: 'Open-source column-oriented DBMS.', stars: 44000, upside: 70, feasibility: 15, commercial: 88, rec: 'do_not_rewrite', conf: 'high', p50: 180, p90: 420, cicdL: 60, cicdH: 180, slice: 'UDFs / side services' },
  { owner: 'duckdb', repo: 'duckdb', lang: 'C++', category: 'databases', desc: 'In-process SQL OLAP database.', stars: 35000, upside: 65, feasibility: 20, commercial: 82, rec: 'do_not_rewrite', conf: 'high', p50: 100, p90: 240, cicdL: 40, cicdH: 120, slice: 'Extension in Rust via C API' },
  { owner: 'apache', repo: 'arrow', lang: 'C++', category: 'data', desc: 'Cross-language development platform for in-memory data.', stars: 16000, upside: 55, feasibility: 30, commercial: 80, rec: 'do_not_rewrite', conf: 'medium', p50: 40, p90: 100, cicdL: 25, cicdH: 60, slice: 'Use arrow-rs; contribute upstream' },
  { owner: 'apache', repo: 'parquet-cpp', lang: 'C++', category: 'data', desc: 'Apache Parquet C++ (historical reference).', stars: 2000, upside: 58, feasibility: 40, commercial: 70, rec: 'do_not_rewrite', conf: 'medium', p50: 20, p90: 48, cicdL: 15, cicdH: 40, slice: 'Prefer arrow-rs parquet' },
  { owner: 'Blosc', repo: 'c-blosc2', lang: 'C', category: 'compression', desc: 'High performance compressor for binary data.', stars: 500, upside: 62, feasibility: 65, commercial: 45, rec: 'clean_room', conf: 'medium', p50: 4, p90: 10, cicdL: 8, cicdH: 20, slice: 'Codec plugins' },
  { owner: 'ebiggers', repo: 'libdeflate', lang: 'C', category: 'compression', desc: 'Heavily optimized library for DEFLATE/zlib/gzip.', stars: 1200, upside: 60, feasibility: 68, commercial: 50, rec: 'clean_room', conf: 'medium', p50: 4, p90: 9, cicdL: 8, cicdH: 18, slice: 'gzip wrapper + CRC', license: 'MIT' },
  { owner: 'richgel999', repo: 'miniz', lang: 'C', category: 'compression', desc: 'Single-file zlib-subset library.', stars: 2500, upside: 58, feasibility: 75, commercial: 40, rec: 'full_port', conf: 'medium', p50: 2, p90: 5, cicdL: 5, cicdH: 12, slice: 'Entire library (small surface)', license: 'MIT' },
  { owner: 'nothings', repo: 'stb', lang: 'C', category: 'libraries', desc: 'stb single-file public domain libraries.', stars: 30000, upside: 70, feasibility: 80, commercial: 55, rec: 'clean_room', conf: 'medium', p50: 1, p90: 3, cicdL: 3, cicdH: 8, slice: 'Per-header: image, truetype, etc.', license: 'MIT OR Unlicense' },
  { owner: 'glfw', repo: 'glfw', lang: 'C', category: 'graphics', desc: 'Multi-platform library for OpenGL/Vulkan.', stars: 14000, upside: 45, feasibility: 55, commercial: 40, rec: 'do_not_rewrite', conf: 'medium', p50: 10, p90: 24, cicdL: 12, cicdH: 30, slice: 'Prefer winit/glutin' },
  { owner: 'libsdl-org', repo: 'SDL', lang: 'C', category: 'graphics', desc: 'Simple Directmedia Layer.', stars: 14000, upside: 50, feasibility: 35, commercial: 55, rec: 'do_not_rewrite', conf: 'medium', p50: 30, p90: 70, cicdL: 25, cicdH: 60, slice: 'Bindings already strong' },
  { owner: 'freeType', repo: 'freetype', lang: 'C', category: 'graphics', desc: 'Freely available software library to render fonts.', stars: 2000, upside: 78, feasibility: 50, commercial: 65, rec: 'extract_hotspot', conf: 'medium', p50: 12, p90: 28, cicdL: 16, cicdH: 40, slice: 'TrueType interpreter subset' },
  { owner: 'harfbuzz', repo: 'harfbuzz', lang: 'C++', category: 'graphics', desc: 'Text shaping engine.', stars: 5000, upside: 72, feasibility: 40, commercial: 68, rec: 'extract_hotspot', conf: 'medium', p50: 18, p90: 40, cicdL: 20, cicdH: 50, slice: 'Shaper for one script family' },
  { owner: 'ImageMagick', repo: 'ImageMagick', lang: 'C', category: 'media', desc: 'Software suite for image creation and conversion.', stars: 15000, upside: 82, feasibility: 28, commercial: 70, rec: 'extract_hotspot', conf: 'medium', p50: 40, p90: 100, cicdL: 30, cicdH: 80, slice: 'Single format coder under sanitizer' },
  { owner: 'ImageMagick', repo: 'MagickWand', lang: 'C', category: 'media', desc: 'ImageMagick C API surface reference.', stars: 500, upside: 75, feasibility: 35, commercial: 55, rec: 'extract_hotspot', conf: 'low', p50: 20, p90: 48, cicdL: 20, cicdH: 50, slice: 'Wand API subset' },
  { owner: 'strukturag', repo: 'libheif', lang: 'C++', category: 'media', desc: 'HEIF and AVIF file format decoder and encoder.', stars: 2200, upside: 76, feasibility: 52, commercial: 62, rec: 'replace_subsystem', conf: 'medium', p50: 10, p90: 22, cicdL: 14, cicdH: 35, slice: 'HEIF box parser' },
  { owner: 'uclouvain', repo: 'openjpeg', lang: 'C', category: 'media', desc: 'Open-source JPEG 2000 codec.', stars: 1100, upside: 80, feasibility: 55, commercial: 50, rec: 'clean_room', conf: 'medium', p50: 8, p90: 18, cicdL: 12, cicdH: 30, slice: 'JP2 decoder', license: 'BSD-2-Clause' },
  { owner: 'libjxl', repo: 'libjxl', lang: 'C++', category: 'media', desc: 'JPEG XL reference implementation.', stars: 3200, upside: 74, feasibility: 45, commercial: 58, rec: 'extract_hotspot', conf: 'medium', p50: 14, p90: 32, cicdL: 18, cicdH: 45, slice: 'Decoder pipeline' },
  { owner: 'xiph', repo: 'flac', lang: 'C', category: 'media', desc: 'Free Lossless Audio Codec.', stars: 2000, upside: 62, feasibility: 60, commercial: 45, rec: 'clean_room', conf: 'medium', p50: 5, p90: 12, cicdL: 10, cicdH: 24, slice: 'Frame decoder' },
  { owner: 'xiph', repo: 'opus', lang: 'C', category: 'media', desc: 'Modern audio codec for interactive speech and music.', stars: 2800, upside: 65, feasibility: 48, commercial: 70, rec: 'extract_hotspot', conf: 'medium', p50: 12, p90: 28, cicdL: 15, cicdH: 40, slice: 'Decoder; encoder later' },
  { owner: 'videolan', repo: 'dav1d', lang: 'C', category: 'media', desc: 'AV1 decoder — small and fast.', stars: 7000, upside: 70, feasibility: 40, commercial: 75, rec: 'extract_hotspot', conf: 'medium', p50: 16, p90: 36, cicdL: 20, cicdH: 50, slice: 'Assembly-heavy; port carefully' },
  { owner: 'AOMediaCodec', repo: 'libaom', lang: 'C', category: 'media', desc: 'AV1 codec library reference.', stars: 1500, upside: 68, feasibility: 30, commercial: 70, rec: 'do_not_rewrite', conf: 'medium', p50: 40, p90: 100, cicdL: 30, cicdH: 80, slice: 'Prefer rav1e/dav1d ecosystem' },
  { owner: 'webmproject', repo: 'libvpx', lang: 'C', category: 'media', desc: 'VP8/VP9 codec SDK.', stars: 2500, upside: 66, feasibility: 35, commercial: 60, rec: 'extract_hotspot', conf: 'medium', p50: 20, p90: 48, cicdL: 20, cicdH: 50, slice: 'VP9 decoder subset' },
  { owner: 'cisco', repo: 'openh264', lang: 'C++', category: 'media', desc: 'Open Source H.264 Codec.', stars: 2000, upside: 72, feasibility: 38, commercial: 65, rec: 'extract_hotspot', conf: 'medium', p50: 18, p90: 40, cicdL: 20, cicdH: 50, slice: 'Baseline decoder' },
  { owner: 'ultrajson', repo: 'ultrajson', lang: 'C', category: 'serialization', desc: 'Ultra fast JSON decoder and encoder written in C.', stars: 4500, upside: 58, feasibility: 75, commercial: 50, rec: 'clean_room', conf: 'medium', p50: 2, p90: 5, cicdL: 5, cicdH: 12, slice: 'Full codec (prefer serde_json)', license: 'BSD-3-Clause' },
  { owner: 'DaveGamble', repo: 'cJSON', lang: 'C', category: 'serialization', desc: 'Ultralightweight JSON parser in ANSI C.', stars: 12000, upside: 60, feasibility: 82, commercial: 45, rec: 'full_port', conf: 'high', p50: 1, p90: 3, cicdL: 3, cicdH: 8, slice: 'Entire library', license: 'MIT' },
  { owner: 'json-c', repo: 'json-c', lang: 'C', category: 'serialization', desc: 'JSON implementation in C.', stars: 3200, upside: 58, feasibility: 78, commercial: 42, rec: 'full_port', conf: 'medium', p50: 2, p90: 4, cicdL: 4, cicdH: 10, slice: 'Object model API' },
  { owner: 'leethomason', repo: 'tinyxml2', lang: 'C++', category: 'parsers', desc: 'Simple, small, efficient C++ XML parser.', stars: 5800, upside: 65, feasibility: 80, commercial: 40, rec: 'full_port', conf: 'medium', p50: 1.5, p90: 4, cicdL: 4, cicdH: 10, slice: 'DOM parser', license: 'Zlib' },
  { owner: 'zeux', repo: 'pugixml', lang: 'C++', category: 'parsers', desc: 'Light-weight C++ XML processing library.', stars: 4300, upside: 62, feasibility: 78, commercial: 40, rec: 'full_port', conf: 'medium', p50: 2, p90: 5, cicdL: 5, cicdH: 12, slice: 'XPath-free DOM core' },
  { owner: 'commonmark', repo: 'cmark', lang: 'C', category: 'parsers', desc: 'CommonMark parsing and rendering in C.', stars: 1700, upside: 55, feasibility: 75, commercial: 40, rec: 'clean_room', conf: 'medium', p50: 3, p90: 7, cicdL: 6, cicdH: 14, slice: 'Prefer pulldown-cmark' },
  { owner: 'mity', repo: 'md4c', lang: 'C', category: 'parsers', desc: 'C Markdown parser.', stars: 1200, upside: 52, feasibility: 78, commercial: 35, rec: 'do_not_rewrite', conf: 'medium', p50: 2, p90: 5, cicdL: 4, cicdH: 10, slice: 'Ecosystem already covered' },
  { owner: 'akheron', repo: 'jansson', lang: 'C', category: 'serialization', desc: 'C library for encoding, decoding and manipulating JSON.', stars: 3200, upside: 55, feasibility: 80, commercial: 40, rec: 'full_port', conf: 'medium', p50: 1.5, p90: 4, cicdL: 4, cicdH: 10, slice: 'Full library' },
  { owner: 'ben-strasser', repo: 'fast-cpp-csv-parser', lang: 'C++', category: 'parsers', desc: 'Fast C++ CSV parser.', stars: 2300, upside: 48, feasibility: 82, commercial: 35, rec: 'do_not_rewrite', conf: 'medium', p50: 1, p90: 2, cicdL: 2, cicdH: 6, slice: 'Use csv crate' },
  { owner: 'simdjson', repo: 'simdjson', lang: 'C++', category: 'serialization', desc: 'Parsing gigabytes of JSON per second.', stars: 22000, upside: 70, feasibility: 50, commercial: 72, rec: 'extract_hotspot', conf: 'medium', p50: 10, p90: 22, cicdL: 15, cicdH: 35, slice: 'On-demand API subset', license: 'Apache-2.0' },
  { owner: 'google', repo: 'flatbuffers', lang: 'C++', category: 'serialization', desc: 'Memory efficient serialization library.', stars: 25000, upside: 50, feasibility: 40, commercial: 65, rec: 'do_not_rewrite', conf: 'medium', p50: 16, p90: 36, cicdL: 15, cicdH: 40, slice: 'Use flatbuffers Rust' },
  { owner: 'google', repo: 'snappy', lang: 'C++', category: 'compression', desc: 'Fast compressor/decompressor.', stars: 6500, upside: 55, feasibility: 70, commercial: 50, rec: 'clean_room', conf: 'medium', p50: 2, p90: 5, cicdL: 5, cicdH: 12, slice: 'Block format', license: 'BSD-3-Clause' },
  { owner: 'Cyan4973', repo: 'xxHash', lang: 'C', category: 'libraries', desc: 'Extremely fast non-cryptographic hash algorithm.', stars: 11000, upside: 50, feasibility: 85, commercial: 48, rec: 'clean_room', conf: 'high', p50: 1, p90: 2, cicdL: 3, cicdH: 7, slice: 'XXH3 implementation', license: 'BSD-2-Clause' },
  { owner: 'google', repo: 'cityhash', lang: 'C++', category: 'libraries', desc: 'Family of hash functions.', stars: 1500, upside: 45, feasibility: 85, commercial: 35, rec: 'do_not_rewrite', conf: 'medium', p50: 0.5, p90: 1.5, cicdL: 2, cicdH: 5, slice: 'Trivial; prefer existing crates' },
  { owner: 'BLAKE3-team', repo: 'BLAKE3', lang: 'C', category: 'security', desc: 'Cryptographic hash function.', stars: 6000, upside: 40, feasibility: 70, commercial: 55, rec: 'do_not_rewrite', conf: 'high', p50: 1, p90: 3, cicdL: 3, cicdH: 8, slice: 'Official Rust already first-class' },
  { owner: 'jedisct1', repo: 'libhydrogen', lang: 'C', category: 'security', desc: 'Tiny crypto library for constrained environments.', stars: 700, upside: 68, feasibility: 72, commercial: 40, rec: 'full_port', conf: 'medium', p50: 3, p90: 7, cicdL: 6, cicdH: 14, slice: 'Full API surface' },
  { owner: 'P-H-C', repo: 'phc-winner-argon2', lang: 'C', category: 'security', desc: 'Password hashing Argon2.', stars: 5000, upside: 65, feasibility: 70, commercial: 60, rec: 'clean_room', conf: 'medium', p50: 2, p90: 5, cicdL: 5, cicdH: 12, slice: 'argon2id', license: 'Apache-2.0 OR CC0-1.0' },
  { owner: 'Tencent', repo: 'rapidjson', lang: 'C++', category: 'serialization', desc: 'Fast JSON parser/generator for C++.', stars: 15000, upside: 55, feasibility: 65, commercial: 50, rec: 'do_not_rewrite', conf: 'medium', p50: 3, p90: 8, cicdL: 6, cicdH: 15, slice: 'Prefer serde_json/simd-json' },
  { owner: 'yhirose', repo: 'cpp-httplib', lang: 'C++', category: 'networking', desc: 'A C++ header-only HTTP/HTTPS server and client library.', stars: 15000, upside: 48, feasibility: 70, commercial: 40, rec: 'do_not_rewrite', conf: 'medium', p50: 3, p90: 7, cicdL: 5, cicdH: 12, slice: 'Use axum/hyper' },
  { owner: 'litespeedtech', repo: 'lsquic', lang: 'C', category: 'networking', desc: 'LiteSpeed QUIC and HTTP/3 library.', stars: 1700, upside: 75, feasibility: 40, commercial: 72, rec: 'extract_hotspot', conf: 'medium', p50: 20, p90: 48, cicdL: 25, cicdH: 60, slice: 'Prefer quinn; extract only for embed' },
  { owner: 'ngtcp2', repo: 'ngtcp2', lang: 'C', category: 'networking', desc: 'QUIC protocol library.', stars: 1400, upside: 72, feasibility: 42, commercial: 68, rec: 'do_not_rewrite', conf: 'medium', p50: 18, p90: 42, cicdL: 20, cicdH: 50, slice: 'Use quinn/quiche' },
  { owner: 'cloudflare', repo: 'quiche', lang: 'Rust', category: 'networking', desc: 'Savoury implementation of the QUIC transport protocol.', stars: 11000, upside: 15, feasibility: 95, commercial: 80, rec: 'do_not_rewrite', conf: 'high', p50: 0.1, p90: 0.5, cicdL: 0, cicdH: 1, slice: 'Already Rust' },
  { owner: 'microsoft', repo: 'msquic', lang: 'C', category: 'networking', desc: 'Cross-platform QUIC implementation.', stars: 4500, upside: 70, feasibility: 35, commercial: 75, rec: 'do_not_rewrite', conf: 'medium', p50: 30, p90: 70, cicdL: 25, cicdH: 60, slice: 'Interop testing only' },
  { owner: 'libwebsockets', repo: 'libwebsockets', lang: 'C', category: 'networking', desc: 'Canonical libwebsockets.org websocket library.', stars: 5000, upside: 68, feasibility: 48, commercial: 55, rec: 'replace_subsystem', conf: 'medium', p50: 10, p90: 24, cicdL: 14, cicdH: 35, slice: 'WS framing + HTTP upgrade' },
  { owner: 'warmcat', repo: 'libwebsockets', lang: 'C', category: 'networking', desc: 'Flexible lightweight pure C library for websockets.', stars: 5000, upside: 68, feasibility: 48, commercial: 55, rec: 'replace_subsystem', conf: 'medium', p50: 10, p90: 24, cicdL: 14, cicdH: 35, slice: 'Client path first' },
  { owner: 'eclipse', repo: 'paho.mqtt.c', lang: 'C', category: 'networking', desc: 'Eclipse Paho MQTT C client.', stars: 2200, upside: 72, feasibility: 60, commercial: 65, rec: 'clean_room', conf: 'medium', p50: 5, p90: 12, cicdL: 10, cicdH: 24, slice: 'MQTT 3.1.1 client', license: 'EPL-2.0' },
  { owner: 'nanomsg', repo: 'nng', lang: 'C', category: 'networking', desc: 'Nanomsg-next-generation — light brokerless messaging.', stars: 4200, upside: 65, feasibility: 50, commercial: 50, rec: 'extract_hotspot', conf: 'medium', p50: 10, p90: 22, cicdL: 12, cicdH: 30, slice: 'Scalability protocol core' },
  { owner: 'zeromq', repo: 'libzmq', lang: 'C++', category: 'networking', desc: 'ZeroMQ core engine in C++.', stars: 10500, upside: 62, feasibility: 40, commercial: 60, rec: 'do_not_rewrite', conf: 'medium', p50: 20, p90: 48, cicdL: 20, cicdH: 50, slice: 'Use existing zmq Rust bindings/strategy' },
  { owner: 'redis', repo: 'hiredis', lang: 'C', category: 'databases', desc: 'Minimalistic C client for Redis.', stars: 6500, upside: 55, feasibility: 75, commercial: 55, rec: 'clean_room', conf: 'medium', p50: 2, p90: 5, cicdL: 5, cicdH: 12, slice: 'RESP client', license: 'BSD-3-Clause' },
  { owner: 'mongodb', repo: 'mongo-c-driver', lang: 'C', category: 'databases', desc: 'C Driver for MongoDB.', stars: 900, upside: 50, feasibility: 55, commercial: 55, rec: 'do_not_rewrite', conf: 'medium', p50: 10, p90: 24, cicdL: 12, cicdH: 30, slice: 'Prefer official Rust driver' },
  { owner: 'psycopg', repo: 'psycopg2', lang: 'C', category: 'databases', desc: 'PostgreSQL database adapter for Python (C).', stars: 3600, upside: 45, feasibility: 50, commercial: 50, rec: 'do_not_rewrite', conf: 'medium', p50: 8, p90: 18, cicdL: 10, cicdH: 24, slice: 'Python-specific; not a Rust target' },
  { owner: 'pgvector', repo: 'pgvector', lang: 'C', category: 'databases', desc: 'Open-source vector similarity search for Postgres.', stars: 19000, upside: 60, feasibility: 45, commercial: 85, rec: 'extract_hotspot', conf: 'medium', p50: 8, p90: 18, cicdL: 12, cicdH: 30, slice: 'Distance kernels as extension piece' },
  { owner: 'Timescale', repo: 'timescaledb', lang: 'C', category: 'databases', desc: 'PostgreSQL for time-series.', stars: 20000, upside: 58, feasibility: 25, commercial: 80, rec: 'do_not_rewrite', conf: 'high', p50: 50, p90: 120, cicdL: 30, cicdH: 80, slice: 'Extension helpers only' },
  { owner: 'citusdata', repo: 'citus', lang: 'C', category: 'databases', desc: 'Distributed PostgreSQL.', stars: 12000, upside: 55, feasibility: 20, commercial: 78, rec: 'do_not_rewrite', conf: 'high', p50: 60, p90: 150, cicdL: 35, cicdH: 90, slice: 'Not a port candidate' },
  { owner: 'PostgREST', repo: 'postgrest', lang: 'Haskell', category: 'databases', desc: 'REST API for any Postgres database.', stars: 26000, upside: 48, feasibility: 35, commercial: 70, rec: 'do_not_rewrite', conf: 'medium', p50: 18, p90: 40, cicdL: 15, cicdH: 40, slice: 'Competing stacks exist' },
  { owner: 'hasura', repo: 'graphql-engine', lang: 'Haskell', category: 'databases', desc: 'Blazing fast GraphQL server over Postgres.', stars: 32000, upside: 50, feasibility: 22, commercial: 80, rec: 'do_not_rewrite', conf: 'high', p50: 50, p90: 120, cicdL: 30, cicdH: 80, slice: 'Not recommended' },
  { owner: 'envoyproxy', repo: 'envoy', lang: 'C++', category: 'networking', desc: 'Cloud-native high-performance edge/middle/service proxy.', stars: 28000, upside: 72, feasibility: 12, commercial: 92, rec: 'do_not_rewrite', conf: 'high', p50: 200, p90: 480, cicdL: 80, cicdH: 200, slice: 'Filter in Wasm/Rust only' },
  { owner: 'istio', repo: 'istio', lang: 'Go', category: 'networking', desc: 'Connect, secure, control, and observe services.', stars: 38000, upside: 42, feasibility: 18, commercial: 85, rec: 'do_not_rewrite', conf: 'high', p50: 100, p90: 240, cicdL: 40, cicdH: 120, slice: 'Not a Rust rewrite program' },
  { owner: 'kubernetes', repo: 'kubernetes', lang: 'Go', category: 'systems', desc: 'Production-Grade Container Scheduling and Management.', stars: 120000, upside: 40, feasibility: 8, commercial: 98, rec: 'do_not_rewrite', conf: 'high', p50: 400, p90: 900, cicdL: 120, cicdH: 365, slice: 'Controllers/CRDs may be Rust; core is not' },
  { owner: 'containerd', repo: 'containerd', lang: 'Go', category: 'systems', desc: 'Open and reliable container runtime.', stars: 20000, upside: 45, feasibility: 20, commercial: 85, rec: 'do_not_rewrite', conf: 'high', p50: 80, p90: 200, cicdL: 40, cicdH: 100, slice: 'Shim experiments only' },
  { owner: 'opencontainers', repo: 'runc', lang: 'Go', category: 'systems', desc: 'CLI for spawning and running containers per OCI.', stars: 13000, upside: 55, feasibility: 35, commercial: 80, rec: 'extract_hotspot', conf: 'medium', p50: 16, p90: 36, cicdL: 20, cicdH: 50, slice: 'youki already explores Rust runtime' },
  { owner: 'containers', repo: 'podman', lang: 'Go', category: 'systems', desc: 'Daemonless container engine.', stars: 30000, upside: 42, feasibility: 20, commercial: 75, rec: 'do_not_rewrite', conf: 'high', p50: 60, p90: 150, cicdL: 30, cicdH: 80, slice: 'Not recommended' },
  { owner: 'moby', repo: 'moby', lang: 'Go', category: 'systems', desc: 'The Moby Project — collaborative project for container systems.', stars: 71000, upside: 40, feasibility: 15, commercial: 85, rec: 'do_not_rewrite', conf: 'high', p50: 100, p90: 250, cicdL: 40, cicdH: 120, slice: 'Not recommended' },
  { owner: 'helm', repo: 'helm', lang: 'Go', category: 'systems', desc: 'The Kubernetes Package Manager.', stars: 29000, upside: 38, feasibility: 40, commercial: 70, rec: 'do_not_rewrite', conf: 'medium', p50: 20, p90: 48, cicdL: 15, cicdH: 40, slice: 'Low upside vs Go ecosystem' },
  { owner: 'argoproj', repo: 'argo-cd', lang: 'Go', category: 'systems', desc: 'Declarative continuous delivery for Kubernetes.', stars: 22000, upside: 40, feasibility: 25, commercial: 78, rec: 'do_not_rewrite', conf: 'medium', p50: 40, p90: 100, cicdL: 25, cicdH: 60, slice: 'Not recommended' },
  { owner: 'fluxcd', repo: 'flux2', lang: 'Go', category: 'systems', desc: 'Open and extensible continuous delivery solution for Kubernetes.', stars: 8000, upside: 40, feasibility: 28, commercial: 72, rec: 'do_not_rewrite', conf: 'medium', p50: 30, p90: 70, cicdL: 20, cicdH: 50, slice: 'Not recommended' },
  { owner: 'terraform-docs', repo: 'terraform-docs', lang: 'Go', category: 'cli-tools', desc: 'Generate documentation from Terraform modules.', stars: 5000, upside: 35, feasibility: 70, commercial: 35, rec: 'do_not_rewrite', conf: 'medium', p50: 2, p90: 5, cicdL: 4, cicdH: 10, slice: 'Low value' },
  { owner: 'hashicorp', repo: 'terraform', lang: 'Go', category: 'systems', desc: 'Infrastructure as code.', stars: 47000, upside: 42, feasibility: 15, commercial: 90, rec: 'do_not_rewrite', conf: 'high', p50: 100, p90: 250, cicdL: 40, cicdH: 120, slice: 'Providers may use Rust, core does not need rewrite' },
  { owner: 'opentofu', repo: 'opentofu', lang: 'Go', category: 'systems', desc: 'Open-source infrastructure as code tool.', stars: 28000, upside: 42, feasibility: 18, commercial: 80, rec: 'do_not_rewrite', conf: 'high', p50: 90, p90: 220, cicdL: 35, cicdH: 100, slice: 'Not recommended' },
  { owner: 'pulumi', repo: 'pulumi', lang: 'Go', category: 'systems', desc: 'Infrastructure as code in familiar languages.', stars: 25000, upside: 40, feasibility: 18, commercial: 78, rec: 'do_not_rewrite', conf: 'high', p50: 80, p90: 200, cicdL: 35, cicdH: 100, slice: 'Not recommended' },
  { owner: 'ansible', repo: 'ansible', lang: 'Python', category: 'systems', desc: 'Automation engine.', stars: 67000, upside: 50, feasibility: 15, commercial: 80, rec: 'do_not_rewrite', conf: 'high', p50: 100, p90: 250, cicdL: 40, cicdH: 120, slice: 'Modules for speed-critical tasks' },
  { owner: 'saltstack', repo: 'salt', lang: 'Python', category: 'systems', desc: 'Event-driven automation.', stars: 15000, upside: 48, feasibility: 18, commercial: 60, rec: 'do_not_rewrite', conf: 'medium', p50: 60, p90: 150, cicdL: 30, cicdH: 80, slice: 'Not recommended' },
  { owner: 'puppetlabs', repo: 'puppet', lang: 'Ruby', category: 'systems', desc: 'Server automation framework.', stars: 8000, upside: 45, feasibility: 15, commercial: 55, rec: 'do_not_rewrite', conf: 'high', p50: 80, p90: 200, cicdL: 35, cicdH: 90, slice: 'Not recommended' },
  { owner: 'chef', repo: 'chef', lang: 'Ruby', category: 'systems', desc: 'Chef Infra automation.', stars: 8000, upside: 45, feasibility: 15, commercial: 55, rec: 'do_not_rewrite', conf: 'high', p50: 80, p90: 200, cicdL: 35, cicdH: 90, slice: 'Not recommended' },
  { owner: 'moby', repo: 'buildkit', lang: 'Go', category: 'systems', desc: 'Concurrent, cache-efficient, and Dockerfile-agnostic builder toolkit.', stars: 10000, upside: 48, feasibility: 25, commercial: 75, rec: 'do_not_rewrite', conf: 'medium', p50: 40, p90: 100, cicdL: 25, cicdH: 60, slice: 'Not recommended' },
  { owner: 'containers', repo: 'buildah', lang: 'Go', category: 'systems', desc: 'Tool that facilitates building OCI container images.', stars: 8500, upside: 45, feasibility: 28, commercial: 65, rec: 'do_not_rewrite', conf: 'medium', p50: 30, p90: 70, cicdL: 20, cicdH: 50, slice: 'Not recommended' },
  { owner: 'GoogleContainerTools', repo: 'skaffold', lang: 'Go', category: 'systems', desc: 'Easy and Repeatable Kubernetes Development.', stars: 16000, upside: 38, feasibility: 40, commercial: 55, rec: 'do_not_rewrite', conf: 'medium', p50: 15, p90: 35, cicdL: 12, cicdH: 30, slice: 'Low upside' },
  { owner: 'GoogleContainerTools', repo: 'kaniko', lang: 'Go', category: 'systems', desc: 'Build container images in Kubernetes.', stars: 16000, upside: 50, feasibility: 35, commercial: 65, rec: 'extract_hotspot', conf: 'medium', p50: 14, p90: 32, cicdL: 15, cicdH: 40, slice: 'Layer snapshotter' },
  { owner: 'aquasecurity', repo: 'trivy', lang: 'Go', category: 'security', desc: 'Find vulnerabilities, misconfigurations, secrets, SBOM.', stars: 30000, upside: 52, feasibility: 35, commercial: 80, rec: 'extract_hotspot', conf: 'medium', p50: 16, p90: 36, cicdL: 15, cicdH: 40, slice: 'Scanner engine module' },
  { owner: 'anchore', repo: 'syft', lang: 'Go', category: 'security', desc: 'CLI tool and library for generating SBOMs.', stars: 8000, upside: 48, feasibility: 45, commercial: 70, rec: 'do_not_rewrite', conf: 'medium', p50: 12, p90: 28, cicdL: 12, cicdH: 30, slice: 'Optional' },
  { owner: 'anchore', repo: 'grype', lang: 'Go', category: 'security', desc: 'Vulnerability scanner for container images and filesystems.', stars: 11000, upside: 50, feasibility: 42, commercial: 72, rec: 'extract_hotspot', conf: 'medium', p50: 12, p90: 28, cicdL: 12, cicdH: 30, slice: 'Match engine' },
  { owner: 'sigstore', repo: 'cosign', lang: 'Go', category: 'security', desc: 'Container Signing, Verification and Storage in an OCI registry.', stars: 5000, upside: 45, feasibility: 45, commercial: 75, rec: 'do_not_rewrite', conf: 'medium', p50: 12, p90: 28, cicdL: 12, cicdH: 30, slice: 'Low rewrite case' },
  { owner: 'slsa-framework', repo: 'slsa-github-generator', lang: 'Go', category: 'security', desc: 'Language-agnostic SLSA provenance generators.', stars: 900, upside: 40, feasibility: 50, commercial: 55, rec: 'do_not_rewrite', conf: 'medium', p50: 6, p90: 14, cicdL: 8, cicdH: 20, slice: 'Not recommended' },
]

function rowToProject(row: SeedRow): Project {
  return p(
    row.owner,
    row.repo,
    row.lang,
    row.category,
    row.desc,
    row.stars,
    est({
      rustUpside: row.upside,
      migrationFeasibility: row.feasibility,
      commercialSignal: row.commercial,
      recommendation: row.rec,
      confidence: row.conf,
      p50: row.p50,
      p90: row.p90,
      cicdLow: row.cicdL,
      cicdHigh: row.cicdH,
      firstSlice: {
        name: row.slice,
        rationale:
          'Illustrative first slice based on public project characteristics. Verify with a live scan before planning.',
        estimatedWeeks:
          row.p50 < 3 ? [1, 4] : row.p50 < 12 ? [4, 12] : row.p50 < 40 ? [8, 24] : [12, 52],
        risk: row.feasibility >= 60 ? 'low' : row.feasibility >= 40 ? 'medium' : 'high',
      },
      valueScenarios: defaultScenarios(
        row.category === 'security' || row.category === 'parsers' || row.category === 'media'
          ? ['memory_safety', 'distribution']
          : row.category === 'databases' || row.category === 'caching'
            ? ['memory_safety', 'throughput', 'cloud_cost']
            : ['memory_safety', 'latency'],
      ),
      architectureFacts: [
        { label: 'Primary language', value: row.lang },
        { label: 'Category', value: row.category },
        { label: 'Approx. stars (seed)', value: String(row.stars) },
      ],
    }),
    { licenseSpdx: row.license ?? 'NOASSERTION' },
  )
}

const featuredIds = new Set(FEATURED.map((x) => x.id))
const fromRows = SEED_ROWS.map(rowToProject).filter((x) => !featuredIds.has(x.id))

// Dedupe by owner/repo
const seen = new Set<string>()
const combined: Project[] = []
for (const proj of [...FEATURED, ...fromRows]) {
  if (seen.has(proj.id)) continue
  seen.add(proj.id)
  combined.push(proj)
}

// Ensure we have at least ~100 by padding with synthetic but realistic small C libs if needed
const PAD: SeedRow[] = [
  { owner: 'libffi', repo: 'libffi', lang: 'C', category: 'libraries', desc: 'Portable foreign function interface library.', stars: 3500, upside: 55, feasibility: 50, commercial: 50, rec: 'do_not_rewrite', conf: 'medium', p50: 10, p90: 24, cicdL: 12, cicdH: 30, slice: 'Rarely worth a full port' },
  { owner: 'libusb', repo: 'libusb', lang: 'C', category: 'systems', desc: 'A cross-platform library for USB devices.', stars: 6000, upside: 60, feasibility: 55, commercial: 45, rec: 'extract_hotspot', conf: 'medium', p50: 8, p90: 18, cicdL: 12, cicdH: 28, slice: 'Device enumeration layer' },
  { owner: 'signalwire', repo: 'libks', lang: 'C', category: 'libraries', desc: 'Foundational library for SignalWire stacks.', stars: 100, upside: 50, feasibility: 55, commercial: 30, rec: 'do_not_rewrite', conf: 'low', p50: 6, p90: 14, cicdL: 8, cicdH: 20, slice: 'Evaluate only if embedded' },
  { owner: 'cisco', repo: 'libsrtp', lang: 'C', category: 'security', desc: 'Library for SRTP.', stars: 1400, upside: 75, feasibility: 55, commercial: 60, rec: 'clean_room', conf: 'medium', p50: 6, p90: 14, cicdL: 10, cicdH: 25, slice: 'SRTP protect/unprotect' },
  { owner: 'droe', repo: 'sslsplit', lang: 'C', category: 'security', desc: 'Transparent SSL/TLS interception.', stars: 1900, upside: 80, feasibility: 45, commercial: 40, rec: 'extract_hotspot', conf: 'medium', p50: 10, p90: 22, cicdL: 14, cicdH: 35, slice: 'Proxy core with caution' },
  { owner: 'libressl', repo: 'portable', lang: 'C', category: 'security', desc: 'LibreSSL Portable itself.', stars: 1500, upside: 85, feasibility: 25, commercial: 70, rec: 'do_not_rewrite', conf: 'high', p50: 80, p90: 200, cicdL: 40, cicdH: 120, slice: 'Not recommended as full port' },
  { owner: 'yasm', repo: 'yasm', lang: 'C', category: 'compilers', desc: 'Yasm Modular Assembler Project.', stars: 1400, upside: 45, feasibility: 50, commercial: 30, rec: 'do_not_rewrite', conf: 'medium', p50: 12, p90: 28, cicdL: 12, cicdH: 30, slice: 'Low commercial case' },
  { owner: 'nasm', repo: 'nasm', lang: 'Assembly', category: 'compilers', desc: 'Netwide Assembler.', stars: 3000, upside: 40, feasibility: 35, commercial: 35, rec: 'do_not_rewrite', conf: 'medium', p50: 20, p90: 48, cicdL: 15, cicdH: 40, slice: 'Not recommended' },
  { owner: 'tianocore', repo: 'edk2', lang: 'C', category: 'systems', desc: 'EDK II firmware.', stars: 5500, upside: 70, feasibility: 10, commercial: 75, rec: 'do_not_rewrite', conf: 'high', p50: 200, p90: 500, cicdL: 90, cicdH: 250, slice: 'Not a rewrite candidate' },
  { owner: 'ARMmbed', repo: 'mbed-os', lang: 'C', category: 'systems', desc: 'Mbed OS for IoT.', stars: 5000, upside: 65, feasibility: 15, commercial: 60, rec: 'do_not_rewrite', conf: 'high', p50: 120, p90: 300, cicdL: 50, cicdH: 150, slice: 'Peripheral driver experiments' },
]

for (const row of PAD) {
  const proj = rowToProject(row)
  if (!seen.has(proj.id)) {
    seen.add(proj.id)
    combined.push(proj)
  }
}

export const PROJECTS: Project[] = combined.slice(0, 100)

export const FEATURED_PROJECTS = PROJECTS.filter((p) => p.featured)

export const CATEGORIES = [...new Set(PROJECTS.map((p) => p.category))].sort()
export const LANGUAGES = [...new Set(PROJECTS.map((p) => p.primaryLanguage))].sort()

export function getProject(owner: string, repo: string): Project | undefined {
  return PROJECTS.find(
    (p) => p.owner.toLowerCase() === owner.toLowerCase() && p.repo.toLowerCase() === repo.toLowerCase(),
  )
}

export function getProjectById(id: string): Project | undefined {
  const [owner, repo] = id.split('/')
  if (!owner || !repo) return undefined
  return getProject(owner, repo)
}

export function searchProjects(query: string): Project[] {
  const q = query.trim().toLowerCase()
  if (!q) return PROJECTS
  return PROJECTS.filter(
    (p) =>
      p.owner.toLowerCase().includes(q) ||
      p.repo.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.primaryLanguage.toLowerCase().includes(q),
  )
}
