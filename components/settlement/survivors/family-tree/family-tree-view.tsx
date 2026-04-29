'use client'

import { LanternMark } from '@/components/generic/lantern-mark'
import {
  computeFamilyTreeLayout,
  FamilyTreeLayout
} from '@/components/settlement/survivors/family-tree/layout'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle
} from '@/components/ui/empty'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger
} from '@/components/ui/hover-card'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip'
import { ColorChoice } from '@/lib/enums'
import { SurvivorDetail } from '@/lib/types'
import { cn, getColorStyle } from '@/lib/utils'
import {
  HeartCrackIcon,
  LocateFixedIcon,
  MaximizeIcon,
  MinusIcon,
  PlusIcon,
  SkullIcon,
  UserXIcon
} from 'lucide-react'
import {
  ReactElement,
  MouseEvent as ReactMouseEvent,
  ReactNode,
  PointerEvent as ReactPointerEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react'

const NODE_WIDTH = 200
const NODE_HEIGHT = 110
const VERTICAL_GAP = 80
const NODE_RADIUS = 14

const MIN_SCALE = 0.4
const MAX_SCALE = 2.5
const ZOOM_STEP = 0.15

/**
 * Family Tree View Properties
 */
interface FamilyTreeViewProps {
  /** Survivors belonging to the currently selected settlement. */
  survivors: SurvivorDetail[]
  /** Currently selected survivor (highlighted in the tree). */
  selectedSurvivor: SurvivorDetail | null
  /** Callback fired when a node is clicked. */
  onSelectSurvivor: (survivor: SurvivorDetail) => void
  /** Callback fired when the user clicks the empty-state action. */
  onNewSurvivor?: () => void
  /** Optional content rendered to the right of the legend/zoom controls. */
  headerActions?: ReactNode
}

/**
 * Family Tree View Component
 *
 * Renders a settlement's survivors as a generational family tree with smooth
 * curved lineage lines drawn beneath each node. The canvas can be panned (via
 * click-drag on empty space) and zoomed (mouse wheel, pinch, or the on-screen
 * controls), and resizes vertically via a draggable handle so the tree can
 * grow alongside larger settlements.
 *
 * Each node is a Card-styled tile that opens a hover card with a quick-look
 * survivor profile. Clicking a node selects that survivor in the parent
 * settlement view, mirroring the table's behaviour so the two views feel
 * interchangeable.
 *
 * @param props Family Tree View Properties
 * @returns Family Tree View Component
 */
export function FamilyTreeView({
  survivors,
  selectedSurvivor,
  onSelectSurvivor,
  onNewSurvivor,
  headerActions
}: FamilyTreeViewProps): ReactElement {
  const layout: FamilyTreeLayout = useMemo(
    () =>
      computeFamilyTreeLayout(survivors, {
        nodeWidth: NODE_WIDTH,
        nodeHeight: NODE_HEIGHT,
        verticalGap: VERTICAL_GAP
      }),
    [survivors]
  )

  const survivorById = useMemo(
    () => new Map(survivors.map((s) => [s.id, s])),
    [survivors]
  )

  // Derived stats surfaced in the legend.
  const lineageStats = useMemo(() => {
    let withParents = 0
    let roots = 0
    for (const survivor of survivors) {
      const hasParent =
        survivor.parent_1_id !== null || survivor.parent_2_id !== null
      if (hasParent) withParents += 1
      else roots += 1
    }
    return { withParents, roots, total: survivors.length }
  }, [survivors])

  // Pan / zoom state.
  const [scale, setScale] = useState(1)
  const [translate, setTranslate] = useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const panState = useRef<{
    pointerId: number
    startX: number
    startY: number
    originX: number
    originY: number
  } | null>(null)

  // Resizable canvas height (vertical handle).
  const [canvasHeight, setCanvasHeight] = useState(520)
  const resizeState = useRef<{ startY: number; startHeight: number } | null>(
    null
  )
  const viewportRef = useRef<HTMLDivElement | null>(null)

  /**
   * Centre the laid-out tree within the viewport. Used on mount and when the
   * "Center" control is pressed.
   *
   * @returns Void
   */
  const centreTree = useCallback(() => {
    const viewport = viewportRef.current
    if (!viewport) return
    const { clientWidth, clientHeight } = viewport
    const targetX = clientWidth / 2 - (layout.width * scale) / 2
    const targetY = clientHeight / 2 - (layout.height * scale) / 2
    setTranslate({ x: targetX, y: targetY })
  }, [layout.width, layout.height, scale])

  // Centre once on mount and whenever the underlying tree dimensions change
  // by more than a node (so adding survivors recentres but tiny shifts don't
  // disrupt manual panning).
  const lastCentreSig = useRef<string>('')
  useEffect(() => {
    const sig = `${layout.nodes.length}:${Math.round(layout.width)}:${Math.round(layout.height)}`
    if (sig === lastCentreSig.current) return
    lastCentreSig.current = sig
    centreTree()
  }, [centreTree, layout.nodes.length, layout.width, layout.height])

  /**
   * Apply a zoom delta around the viewport centre.
   *
   * @param delta Multiplier added to the current scale.
   * @returns Void
   */
  const applyZoom = useCallback((delta: number) => {
    setScale((current) => {
      const next = Math.min(MAX_SCALE, Math.max(MIN_SCALE, current + delta))
      return Math.round(next * 100) / 100
    })
  }, [])

  /**
   * Bind a non-passive wheel listener so the canvas can call
   * `preventDefault()` when zooming with ⌘/Ctrl. React attaches synthetic
   * wheel handlers as passive listeners (since React 17), which prevents
   * `preventDefault()` from working inside `onWheel`.
   *
   * Holding the meta/ctrl key zooms; an unmodified wheel pans so users can
   * scroll the tree naturally.
   */
  useEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) return

    const handleWheel = (event: WheelEvent) => {
      if (event.ctrlKey || event.metaKey) {
        event.preventDefault()
        const direction = event.deltaY > 0 ? -1 : 1
        setScale((current) => {
          const next = Math.min(
            MAX_SCALE,
            Math.max(MIN_SCALE, current + direction * ZOOM_STEP)
          )
          return Math.round(next * 100) / 100
        })
        return
      }
      setTranslate((current) => ({
        x: current.x - event.deltaX,
        y: current.y - event.deltaY
      }))
    }

    viewport.addEventListener('wheel', handleWheel, { passive: false })
    return () => {
      viewport.removeEventListener('wheel', handleWheel)
    }
  }, [])

  /**
   * Begin a pan gesture when the user presses on empty canvas space.
   *
   * @param event Pointer down event.
   * @returns Void
   */
  const handlePointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      // Only initiate panning from the canvas background, not from a node.
      const target = event.target as HTMLElement
      if (target.closest('[data-family-tree-node="true"]')) return
      if (event.button !== 0) return

      panState.current = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        originX: translate.x,
        originY: translate.y
      }
      setIsPanning(true)
      event.currentTarget.setPointerCapture(event.pointerId)
    },
    [translate.x, translate.y]
  )

  /**
   * Continue an active pan gesture.
   *
   * @param event Pointer move event.
   * @returns Void
   */
  const handlePointerMove = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      const state = panState.current
      if (!state || state.pointerId !== event.pointerId) return
      setTranslate({
        x: state.originX + (event.clientX - state.startX),
        y: state.originY + (event.clientY - state.startY)
      })
    },
    []
  )

  /**
   * Finish a pan gesture.
   *
   * @param event Pointer up/cancel event.
   * @returns Void
   */
  const handlePointerUp = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      const state = panState.current
      if (!state || state.pointerId !== event.pointerId) return
      panState.current = null
      setIsPanning(false)
      event.currentTarget.releasePointerCapture(event.pointerId)
    },
    []
  )

  /**
   * Begin resizing the canvas height by dragging the resize handle.
   *
   * @param event Pointer down event on the resize handle.
   * @returns Void
   */
  const handleResizeStart = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      event.preventDefault()
      resizeState.current = {
        startY: event.clientY,
        startHeight: canvasHeight
      }
      const handleMove = (moveEvent: PointerEvent) => {
        const state = resizeState.current
        if (!state) return
        const next = Math.max(
          280,
          Math.min(1200, state.startHeight + (moveEvent.clientY - state.startY))
        )
        setCanvasHeight(next)
      }
      const handleEnd = () => {
        resizeState.current = null
        window.removeEventListener('pointermove', handleMove)
        window.removeEventListener('pointerup', handleEnd)
      }
      window.addEventListener('pointermove', handleMove)
      window.addEventListener('pointerup', handleEnd)
    },
    [canvasHeight]
  )

  /**
   * Reset zoom to 1 and recentre the tree.
   *
   * @returns Void
   */
  const handleResetView = useCallback(() => {
    setScale(1)
    // Defer centring to the next render so it picks up the reset scale.
    requestAnimationFrame(() => centreTree())
  }, [centreTree])

  if (survivors.length === 0)
    return (
      <Empty className="border bg-card/40">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <LanternMark
              className="h-6 w-6 text-amber-400/90"
              aria-hidden="true"
            />
          </EmptyMedia>
          <EmptyTitle>No lineage to draw.</EmptyTitle>
          <EmptyDescription>
            Lanterns search empty stones. Name a survivor to begin the
            chronicle.
          </EmptyDescription>
        </EmptyHeader>
        {onNewSurvivor && (
          <Button
            variant="outline"
            size="sm"
            className="h-9"
            onClick={onNewSurvivor}>
            <PlusIcon className="h-4 w-4" />
            New Survivor
          </Button>
        )}
      </Empty>
    )

  return (
    <div className="flex flex-col gap-2">
      {/* Header: legend + zoom controls */}
      <div className="flex flex-wrap items-center gap-2 px-1">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <LanternMark className="h-3.5 w-3.5 text-amber-400/90" />
          <span>
            <strong className="text-foreground">{lineageStats.total}</strong>{' '}
            survivors
          </span>
          <span className="text-border">•</span>
          <span>
            <strong className="text-foreground">{lineageStats.roots}</strong>{' '}
            without recorded parents
          </span>
          <span className="text-border">•</span>
          <span>
            <strong className="text-foreground">
              {lineageStats.withParents}
            </strong>{' '}
            with lineage
          </span>
        </div>
        <div className="ml-auto flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => applyZoom(-ZOOM_STEP)}
                disabled={scale <= MIN_SCALE}>
                <MinusIcon className="h-4 w-4" />
                <span className="sr-only">Zoom out</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Zoom out</TooltipContent>
          </Tooltip>
          <div className="px-2 text-xs tabular-nums text-muted-foreground min-w-[3rem] text-center">
            {Math.round(scale * 100)}%
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => applyZoom(ZOOM_STEP)}
                disabled={scale >= MAX_SCALE}>
                <PlusIcon className="h-4 w-4" />
                <span className="sr-only">Zoom in</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Zoom in</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={handleResetView}>
                <LocateFixedIcon className="h-4 w-4" />
                <span className="sr-only">Center tree</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Center tree</TooltipContent>
          </Tooltip>
          {headerActions && (
            <div className="ml-2 flex items-center gap-2">{headerActions}</div>
          )}
        </div>
      </div>

      {/* Canvas */}
      <div
        ref={viewportRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className={cn(
          'relative w-full overflow-hidden rounded-md border bg-gradient-to-br from-background via-background/95 to-background/85 select-none',
          isPanning ? 'cursor-grabbing' : 'cursor-grab'
        )}
        style={{
          height: canvasHeight,
          // Lantern-flicker backdrop: subtle radial vignette + grid.
          backgroundImage:
            'radial-gradient(ellipse at top, hsl(var(--accent)/0.10), transparent 60%), radial-gradient(ellipse at bottom, hsl(var(--accent)/0.06), transparent 70%)'
        }}>
        {/* Subtle grid */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.10]"
          style={{
            backgroundImage:
              'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)',
            backgroundSize: '32px 32px',
            color: 'hsl(var(--foreground))'
          }}
        />

        {/* Transformable layer */}
        <div
          className="absolute left-0 top-0 origin-top-left"
          style={{
            transform: `translate3d(${translate.x}px, ${translate.y}px, 0) scale(${scale})`,
            width: layout.width,
            height: layout.height,
            transition: isPanning ? 'none' : 'transform 120ms ease-out'
          }}>
          <FamilyTreeEdges layout={layout} />
          {layout.nodes.map((node) => {
            const survivor = survivorById.get(node.id)
            if (!survivor) return null
            const isSelected = survivor.id === selectedSurvivor?.id
            return (
              <FamilyTreeNode
                key={survivor.id}
                survivor={survivor}
                x={node.x}
                y={node.y}
                width={NODE_WIDTH}
                height={NODE_HEIGHT}
                isSelected={isSelected}
                onSelect={onSelectSurvivor}
              />
            )
          })}
        </div>

        {/* Hint pill */}
        <div className="pointer-events-none absolute bottom-2 left-2 rounded-md border bg-background/80 px-2 py-1 text-[11px] text-muted-foreground backdrop-blur-sm">
          Drag to pan · Scroll to navigate · Hold {navigatorMetaLabel()} +
          scroll to zoom
        </div>
      </div>

      {/* Resize handle */}
      <div
        role="separator"
        aria-orientation="horizontal"
        aria-label="Resize family tree canvas"
        onPointerDown={handleResizeStart}
        className="group flex h-3 cursor-ns-resize items-center justify-center rounded-md border border-dashed border-border/60 bg-background/40 transition-colors hover:border-amber-400/60 hover:bg-amber-400/5">
        <MaximizeIcon className="h-3 w-3 rotate-45 text-muted-foreground/70 transition-colors group-hover:text-amber-400/90" />
      </div>
    </div>
  )
}

/**
 * Determine an OS-appropriate label for the modifier key used to zoom.
 *
 * @returns Modifier key label (`⌘` on macOS, `Ctrl` elsewhere)
 */
function navigatorMetaLabel(): string {
  if (typeof navigator === 'undefined') return 'Ctrl'
  return /Mac|iPhone|iPad/.test(navigator.platform) ? '⌘' : 'Ctrl'
}

/**
 * Family Tree Edges Component
 *
 * Draws lineage lines as smooth bezier curves beneath the survivor nodes. The
 * SVG layer is sized to match the layout bounds and pointer-events are
 * disabled so the connectors never block clicks on nodes.
 *
 * @param props Component properties
 * @returns Family Tree Edges Component
 */
function FamilyTreeEdges({
  layout
}: {
  /** Computed layout. */
  layout: FamilyTreeLayout
}): ReactElement {
  const positionById = useMemo(
    () => new Map(layout.nodes.map((n) => [n.id, n])),
    [layout.nodes]
  )

  return (
    <svg
      className="pointer-events-none absolute left-0 top-0"
      width={layout.width}
      height={layout.height}
      aria-hidden="true">
      <defs>
        <linearGradient id="lineage-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="rgb(251 191 36 / 0.65)" />
          <stop offset="100%" stopColor="rgb(251 191 36 / 0.20)" />
        </linearGradient>
      </defs>
      {layout.edges.map(({ parentId, childId }, idx) => {
        const parent = positionById.get(parentId)
        const child = positionById.get(childId)
        if (!parent || !child) return null
        const px = parent.x + NODE_WIDTH / 2
        const py = parent.y + NODE_HEIGHT
        const cx = child.x + NODE_WIDTH / 2
        const cy = child.y
        const midY = (py + cy) / 2
        const path = `M ${px} ${py} C ${px} ${midY}, ${cx} ${midY}, ${cx} ${cy}`
        return (
          <path
            key={`${parentId}-${childId}-${idx}`}
            d={path}
            fill="none"
            stroke="url(#lineage-gradient)"
            strokeWidth={2}
            strokeLinecap="round"
          />
        )
      })}
    </svg>
  )
}

/**
 * Family Tree Node Properties
 */
interface FamilyTreeNodeProps {
  /** Survivor to render. */
  survivor: SurvivorDetail
  /** X position (top-left, layout coordinates). */
  x: number
  /** Y position (top-left, layout coordinates). */
  y: number
  /** Node width. */
  width: number
  /** Node height. */
  height: number
  /** Whether this node is the currently selected survivor. */
  isSelected: boolean
  /** Click handler. */
  onSelect: (survivor: SurvivorDetail) => void
}

/**
 * Family Tree Node Component
 *
 * A single survivor tile in the family tree. Hovering reveals a richer
 * preview via a HoverCard; clicking selects the survivor in the parent view.
 *
 * @param props Family Tree Node Properties
 * @returns Family Tree Node Component
 */
function FamilyTreeNode({
  survivor,
  x,
  y,
  width,
  height,
  isSelected,
  onSelect
}: FamilyTreeNodeProps): ReactElement {
  const colorBg = getColorStyle(
    (survivor.color as ColorChoice) ?? ColorChoice.SLATE,
    'bg'
  )
  const colorBorder = getColorStyle(
    (survivor.color as ColorChoice) ?? ColorChoice.SLATE,
    'border'
  )
  const initials = (survivor.survivor_name ?? '??')
    .split(' ')
    .map((part) => part[0])
    .filter(Boolean)
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const handleClick = useCallback(
    (event: ReactMouseEvent<HTMLButtonElement>) => {
      event.stopPropagation()
      onSelect(survivor)
    },
    [onSelect, survivor]
  )

  return (
    <HoverCard openDelay={140} closeDelay={80}>
      <HoverCardTrigger asChild>
        <button
          data-family-tree-node="true"
          type="button"
          onClick={handleClick}
          className={cn(
            'absolute flex flex-col items-stretch gap-1 rounded-xl border-2 bg-card/95 p-2 text-left shadow-sm backdrop-blur-sm transition-all duration-150',
            'hover:-translate-y-0.5 hover:shadow-md hover:shadow-amber-400/10',
            isSelected
              ? 'border-amber-400 ring-2 ring-amber-400/50 shadow-amber-400/20'
              : colorBorder
          )}
          style={{
            left: x,
            top: y,
            width,
            height,
            borderRadius: NODE_RADIUS
          }}>
          <div className="flex items-center gap-2 min-w-0">
            <Avatar
              className={cn(
                'h-8 w-8 shrink-0 border-2 border-background',
                colorBg
              )}>
              <AvatarFallback className="bg-transparent text-xs font-bold">
                {survivor.dead ? (
                  <SkullIcon className="h-3.5 w-3.5" />
                ) : survivor.retired ? (
                  <UserXIcon className="h-3.5 w-3.5" />
                ) : (
                  initials
                )}
              </AvatarFallback>
            </Avatar>
            <div className="flex min-w-0 flex-col">
              <span className="truncate text-sm font-semibold leading-tight">
                {survivor.survivor_name ?? 'Unnamed'}
              </span>
              <span className="truncate text-[11px] text-muted-foreground">
                {survivor.gender ?? '—'} · HXP {survivor.hunt_xp ?? 0}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1">
            {survivor.wanderer && (
              <Badge variant="outline" className="h-5 px-1.5 text-[10px]">
                Wanderer
              </Badge>
            )}
            {survivor.embarked && (
              <Badge
                variant="outline"
                className="h-5 px-1.5 text-[10px] border-amber-400/50 text-amber-400">
                Hunting
              </Badge>
            )}
            {survivor.dead && (
              <Badge variant="destructive" className="h-5 px-1.5 text-[10px]">
                <HeartCrackIcon className="mr-1 h-3 w-3" />
                Dead
              </Badge>
            )}
            {survivor.retired && !survivor.dead && (
              <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
                Retired
              </Badge>
            )}
          </div>

          {(survivor.parent_1_id || survivor.parent_2_id) && (
            <div className="mt-auto text-[10px] uppercase tracking-wide text-muted-foreground/80">
              Lineage recorded
            </div>
          )}
        </button>
      </HoverCardTrigger>
      <HoverCardContent
        align="center"
        side="top"
        className="w-72 border-2"
        sideOffset={12}>
        <div className="flex items-center gap-3">
          <Avatar
            className={cn(
              'h-12 w-12 border-2 border-background shrink-0',
              colorBg
            )}>
            <AvatarFallback className="bg-transparent text-sm font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate font-semibold">
              {survivor.survivor_name ?? 'Unnamed'}
            </p>
            <p className="text-xs text-muted-foreground">
              {survivor.gender ?? '—'}
            </p>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
          <div className="rounded-md border bg-muted/30 p-1">
            <div className="text-[10px] uppercase text-muted-foreground">
              Hunt XP
            </div>
            <div className="font-semibold">{survivor.hunt_xp ?? 0}</div>
          </div>
          <div className="rounded-md border bg-muted/30 p-1">
            <div className="text-[10px] uppercase text-muted-foreground">
              Courage
            </div>
            <div className="font-semibold">{survivor.courage ?? 0}</div>
          </div>
          <div className="rounded-md border bg-muted/30 p-1">
            <div className="text-[10px] uppercase text-muted-foreground">
              Underst.
            </div>
            <div className="font-semibold">{survivor.understanding ?? 0}</div>
          </div>
        </div>
        {survivor.philosophy && (
          <div className="mt-3 rounded-md border bg-muted/20 px-2 py-1 text-xs">
            <span className="font-medium">
              {survivor.philosophy.philosophy_name}
            </span>
            <span className="ml-auto text-muted-foreground">
              {' '}
              · Rank {survivor.philosophy_rank ?? 0}
            </span>
          </div>
        )}
        {survivor.disorders.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {survivor.disorders.slice(0, 4).map((d) => (
              <Badge key={d.id} variant="outline" className="text-[10px]">
                {d.disorder_name}
              </Badge>
            ))}
            {survivor.disorders.length > 4 && (
              <Badge variant="outline" className="text-[10px]">
                +{survivor.disorders.length - 4}
              </Badge>
            )}
          </div>
        )}
        <p className="mt-3 text-[11px] text-muted-foreground">
          Click to focus this survivor in the panel below.
        </p>
      </HoverCardContent>
    </HoverCard>
  )
}
