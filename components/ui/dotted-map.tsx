import * as React from "react"
import { createMap } from "svg-dotted-map"

import { cn } from "@/lib/utils"

export interface Marker {
  lat: number
  lng: number
  size?: number
  pulse?: boolean
}

/** addMarkers returns markers with lat/lng removed; only x, y and other props (e.g. size) remain */
type MapMarker<M extends Marker> = Omit<M, "lat" | "lng"> & {
  x: number
  y: number
}

export interface DottedMapProps<
  M extends Marker = Marker,
> extends React.SVGProps<SVGSVGElement> {
  width?: number
  height?: number
  mapSamples?: number
  markers?: M[]
  dotColor?: string
  markerColor?: string
  dotRadius?: number
  stagger?: boolean
  pulse?: boolean

  /**
   * Zoom factor applied to dot/marker POSITIONS only — radii stay constant,
   * so dots keep their size and simply spread apart (a true map zoom).
   */
  zoom?: number
  /** Point (in viewBox units) the zoom expands around. Defaults to center. */
  zoomOrigin?: { x: number; y: number }
  /** Pan offset in viewBox units — shifts the viewBox window over the dots. */
  pan?: { x: number; y: number }

  renderMarkerOverlay?: (args: {
    marker: MapMarker<M>
    index: number
    x: number
    y: number
    r: number
  }) => React.ReactNode
}

export function DottedMap<M extends Marker = Marker>({
  width = 150,
  height = 75,
  mapSamples = 5000,
  markers = [],
  dotColor = "currentColor",
  markerColor = "#FF6900",
  dotRadius = 0.2,
  stagger = true,
  pulse = false,
  zoom = 1,
  zoomOrigin,
  pan = { x: 0, y: 0 },
  renderMarkerOverlay,
  className,
  style,
  ...svgProps
}: DottedMapProps<M>) {
  const { points, addMarkers } = createMap({
    width,
    height,
    mapSamples,
  })
  const processedMarkers = addMarkers(markers)

  // Zoom scales positions around the origin; radii are left untouched.
  const ox = zoomOrigin?.x ?? width / 2
  const oy = zoomOrigin?.y ?? height / 2
  const zx = (x: number) => (x - ox) * zoom + ox
  const zy = (y: number) => (y - oy) * zoom + oy

  // Compute stagger helpers in a single, simple pass
  const { xStep, yToRowIndex } = React.useMemo(() => {
    const sorted = [...points].sort((a, b) => a.y - b.y || a.x - b.x)
    const rowMap = new Map<number, number>()
    let step = 0
    let prevY = Number.NaN
    let prevXInRow = Number.NaN

    for (const p of sorted) {
      if (p.y !== prevY) {
        // new row
        prevY = p.y
        prevXInRow = Number.NaN
        if (!rowMap.has(p.y)) rowMap.set(p.y, rowMap.size)
      }
      if (!Number.isNaN(prevXInRow)) {
        const delta = p.x - prevXInRow
        if (delta > 0) step = step === 0 ? delta : Math.min(step, delta)
      }
      prevXInRow = p.x
    }

    return { xStep: step || 1, yToRowIndex: rowMap }
  }, [points])

  return (
    <svg
      viewBox={`${pan.x} ${pan.y} ${width} ${height}`}
      className={cn("text-gray-500 dark:text-gray-500", className)}
      style={{ width: "100%", height: "100%", ...style }}
      {...svgProps}
    >
      {points.map((point, index) => {
        const rowIndex = yToRowIndex.get(point.y) ?? 0
        const offsetX = stagger && rowIndex % 2 === 1 ? xStep / 2 : 0
        return (
          <circle
            cx={zx(point.x + offsetX)}
            cy={zy(point.y)}
            r={dotRadius}
            fill={dotColor}
            key={`${point.x}-${point.y}-${index}`}
          />
        )
      })}

      {processedMarkers.map((marker, index) => {
        const rowIndex = yToRowIndex.get(marker.y) ?? 0
        const offsetX = stagger && rowIndex % 2 === 1 ? xStep / 2 : 0

        const x = zx(marker.x + offsetX)
        const y = zy(marker.y)
        const r = marker.size ?? dotRadius
        const shouldPulse = pulse
          ? marker.pulse !== false
          : marker.pulse === true
        const pulseTo = r * 2.8

        return (
          <g key={`${marker.x}-${marker.y}-${index}`}>
            <circle cx={x} cy={y} r={r} fill={markerColor} />

            {shouldPulse ? (
              <g pointerEvents="none">
                <circle
                  cx={x}
                  cy={y}
                  r={r}
                  fill="none"
                  stroke={markerColor}
                  strokeOpacity={1}
                  strokeWidth={0.35}
                >
                  <animate
                    attributeName="r"
                    values={`${r};${pulseTo}`}
                    dur="1.4s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    values="1;0"
                    dur="1.4s"
                    repeatCount="indefinite"
                  />
                </circle>
                <circle
                  cx={x}
                  cy={y}
                  r={r}
                  fill="none"
                  stroke={markerColor}
                  strokeOpacity={0.9}
                  strokeWidth={0.3}
                >
                  <animate
                    attributeName="r"
                    values={`${r};${pulseTo}`}
                    dur="1.4s"
                    begin="0.7s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    values="0.9;0"
                    dur="1.4s"
                    begin="0.7s"
                    repeatCount="indefinite"
                  />
                </circle>
              </g>
            ) : null}

            {renderMarkerOverlay?.({
              marker: { ...marker, x, y },
              index,
              x,
              y,
              r,
            })}
          </g>
        )
      })}
    </svg>
  )
}
