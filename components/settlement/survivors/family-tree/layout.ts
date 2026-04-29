import { SurvivorDetail } from '@/lib/types'

/**
 * Family Tree Node Position
 *
 * The pixel-space rectangle assigned to a survivor by the layout pass. Layout
 * coordinates are normalized so the leftmost/topmost node sits at the
 * configured padding margin.
 */
export interface FamilyTreeNodePosition {
  /** Survivor ID */
  id: string
  /** Generation Depth (0 = root) */
  generation: number
  /** Top-Left Corner X Position (px) */
  x: number
  /** Top-Left Corner Y Position (px) */
  y: number
}

/**
 * Family Tree Edge
 *
 * Represents one parent → child relationship. The renderer draws a curve from
 * the bottom of the parent's node to the top of the child's node. Edges are
 * deduplicated, so a child with two parents produces two edges.
 */
export interface FamilyTreeEdge {
  /** Parent Survivor ID */
  parentId: string
  /** Child Survivor ID */
  childId: string
}

/**
 * Family Tree Layout
 *
 * Result of laying out a settlement's survivors as a family tree. The
 * dimensions describe the tightest bounding box that contains every node and
 * its surrounding padding, so the canvas can size itself to the tree.
 */
export interface FamilyTreeLayout {
  /** Per-Survivor Positions */
  nodes: FamilyTreeNodePosition[]
  /** Parent → Child Edges */
  edges: FamilyTreeEdge[]
  /** Total Width (px) */
  width: number
  /** Total Height (px) */
  height: number
}

/**
 * Family Tree Layout Options
 */
export interface FamilyTreeLayoutOptions {
  /** Width of Survivor Node (px) */
  nodeWidth?: number
  /** Height of Survivor Node (px) */
  nodeHeight?: number
  /** Horizontal Gap Between Sibling Nodes (px) */
  horizontalGap?: number
  /** Vertical Gap Between Generations (px) */
  verticalGap?: number
  /** Tree Padding (px) */
  padding?: number
}

/** Default Node Width */
const DEFAULT_NODE_WIDTH = 200
/** Default Node Height */
const DEFAULT_NODE_HEIGHT = 110
/** Default Horizontal Gap Between Sibling Nodes */
const DEFAULT_HORIZONTAL_GAP = 32
/** Default Vertical Gap Between Generations */
const DEFAULT_VERTICAL_GAP = 80
/** Default Tree Padding */
const DEFAULT_PADDING = 48

/**
 * Compute Family Tree Layout
 *
 * Lays survivors out top-down by generation. A survivor's generation is the
 * longest parent-chain leading to it; survivors with no parent references in
 * the supplied list are treated as roots at generation 0. Within each
 * generation, nodes are sorted so they appear under (or near) the average
 * x-coordinate of their parents — root-level nodes fall back to alphabetical
 * order so the tree is stable across renders.
 *
 * Cycles cannot exist (the database constraint prevents self-parents and
 * generation-aware insertion ensures monotonic depth), but as a defensive
 * measure any survivor whose parents could not be resolved is treated as a
 * root.
 *
 * @param survivors Settlement Survivors
 * @param options Optional Layout Tuning Parameters
 * @returns Computed Layout
 */
export function computeFamilyTreeLayout(
  survivors: SurvivorDetail[],
  options: FamilyTreeLayoutOptions = {}
): FamilyTreeLayout {
  const nodeWidth = options.nodeWidth ?? DEFAULT_NODE_WIDTH
  const nodeHeight = options.nodeHeight ?? DEFAULT_NODE_HEIGHT
  const horizontalGap = options.horizontalGap ?? DEFAULT_HORIZONTAL_GAP
  const verticalGap = options.verticalGap ?? DEFAULT_VERTICAL_GAP
  const padding = options.padding ?? DEFAULT_PADDING

  if (survivors.length === 0)
    return { nodes: [], edges: [], width: 0, height: 0 }

  const survivorIds = new Set(survivors.map((s) => s.id))
  const survivorById = new Map(survivors.map((s) => [s.id, s]))

  /**
   * Resolve the parent IDs that are actually present in the supplied settlement
   * roster. Parents pointing at survivors that are missing (e.g. filtered out)
   * are dropped so the layout doesn't try to reach an unreachable parent.
   *
   * @param survivor Survivor Whose Parents Should be Resolved
   * @returns Parent IDs (Exist in the Roster)
   */
  const parentsOf = (survivor: SurvivorDetail): string[] =>
    [survivor.parent_1_id, survivor.parent_2_id].filter(
      (id): id is string => typeof id === 'string' && survivorIds.has(id)
    )

  // Memoised generation lookup. A self-loop or cyclic chain falls back to 0 to
  // keep the algorithm bounded.
  const generationCache = new Map<string, number>()
  const inProgress = new Set<string>()

  const generationFor = (id: string): number => {
    const cached = generationCache.get(id)

    if (cached !== undefined) return cached
    if (inProgress.has(id)) return 0

    const survivor = survivorById.get(id)
    if (!survivor) return 0

    inProgress.add(id)

    const parents = parentsOf(survivor)
    const gen =
      parents.length === 0
        ? 0
        : Math.max(...parents.map((p) => generationFor(p))) + 1
    inProgress.delete(id)

    generationCache.set(id, gen)
    return gen
  }

  // Group survivors by generation.
  const byGeneration = new Map<number, SurvivorDetail[]>()
  for (const survivor of survivors) {
    const gen = generationFor(survivor.id)
    const bucket = byGeneration.get(gen) ?? []

    bucket.push(survivor)
    byGeneration.set(gen, bucket)
  }

  const generations = [...byGeneration.keys()].sort((a, b) => a - b)

  // Track centre x for each placed node so children can be aligned beneath the
  // average centre of their parents.
  const centreXById = new Map<string, number>()
  const positions: FamilyTreeNodePosition[] = []

  const stride = nodeWidth + horizontalGap

  for (const gen of generations) {
    const cohort = byGeneration.get(gen) ?? []

    // Determine a sort key for each survivor in this cohort.
    const sortKey = (s: SurvivorDetail): number => {
      const parents = parentsOf(s)
      if (parents.length === 0) return Number.POSITIVE_INFINITY

      const xs = parents
        .map((p) => centreXById.get(p))
        .filter((x): x is number => x !== undefined)

      if (xs.length === 0) return Number.POSITIVE_INFINITY

      return xs.reduce((sum, x) => sum + x, 0) / xs.length
    }

    const sorted = [...cohort].sort((a, b) => {
      const ka = sortKey(a)
      const kb = sortKey(b)

      if (ka === kb) {
        const na = (a.survivor_name ?? '').toLowerCase()
        const nb = (b.survivor_name ?? '').toLowerCase()

        return na.localeCompare(nb)
      }

      return ka - kb
    })

    // First pass: place every node at its desired centre (or sequentially for
    // roots). Second pass resolves overlaps left-to-right.
    const desiredCentres: number[] = sorted.map((s, idx) => {
      const parents = parentsOf(s)
      const parentXs = parents
        .map((p) => centreXById.get(p))
        .filter((x): x is number => x !== undefined)

      if (parentXs.length > 0)
        return parentXs.reduce((sum, x) => sum + x, 0) / parentXs.length

      // Roots: stride them out from 0 so they don't all collapse to one spot.
      return idx * stride
    })

    const placedCentres: number[] = []
    let cursor = Number.NEGATIVE_INFINITY

    for (const desired of desiredCentres) {
      const minCentre = cursor === Number.NEGATIVE_INFINITY ? desired : cursor
      const centre = Math.max(desired, minCentre)

      placedCentres.push(centre)

      cursor = centre + stride
    }

    sorted.forEach((survivor, idx) => {
      const centre = placedCentres[idx]

      centreXById.set(survivor.id, centre)
      positions.push({
        id: survivor.id,
        generation: gen,
        // Top-left corner: centre minus half the node width. Y is computed
        // post-normalisation below.
        x: centre - nodeWidth / 2,
        y: gen * (nodeHeight + verticalGap)
      })
    })
  }

  // Normalise so the leftmost node sits at `padding` and add top padding.
  const minX = positions.reduce((m, p) => Math.min(m, p.x), 0)
  const minY = positions.reduce((m, p) => Math.min(m, p.y), 0)
  const dx = padding - minX
  const dy = padding - minY

  for (const pos of positions) {
    pos.x += dx
    pos.y += dy
  }

  const width =
    positions.reduce((m, p) => Math.max(m, p.x + nodeWidth), 0) + padding
  const height =
    positions.reduce((m, p) => Math.max(m, p.y + nodeHeight), 0) + padding

  // Build edges from each survivor's parent references.
  const edges: FamilyTreeEdge[] = []
  for (const survivor of survivors)
    for (const parentId of parentsOf(survivor))
      edges.push({ parentId, childId: survivor.id })

  return { nodes: positions, edges, width, height }
}
