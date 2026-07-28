import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Presentational only — the dot grid and the marker positions are sampled on
 * the server (see `lib/trips-map.ts`) and arrive already projected into viewBox
 * units. This component must not import `svg-dotted-map`: it renders inside a
 * client component, and pulling the sampler back in here would ship the world
 * map data to the browser again.
 */

export interface Marker {
  /** viewBox units, already projected */
  x: number
  y: number
  size?: number
  pulse?: boolean
}

/** Cell (col, row) sits at (x0 + col * stepX, y0 + row * stepY). */
export interface DotGrid {
  x0: number
  y0: number
  stepX: number
  stepY: number
}

export interface DottedMapProps extends React.SVGProps<SVGSVGElement> {
  width?: number
  height?: number
  /** Flat [col0, row0, col1, row1, …] into `grid` */
  dots: number[]
  grid: DotGrid
  markers?: Marker[]
  dotColor?: string
  markerColor?: string
  dotRadius?: number
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
}

export function DottedMap({
  width = 150,
  height = 75,
  dots,
  grid,
  markers = [],
  dotColor = "currentColor",
  markerColor = "#FF6900",
  dotRadius = 0.2,
  pulse = false,
  zoom = 1,
  zoomOrigin,
  pan = { x: 0, y: 0 },
  className,
  style,
  ...svgProps
}: DottedMapProps) {
  // Zoom scales positions around the origin; radii are left untouched. The
  // result is rounded because it goes straight into an SVG attribute ~2,400
  // times — 0.01 of a 165-unit viewBox is far below a device pixel, and full
  // float precision would add tens of kB to the prerendered markup.
  const ox = zoomOrigin?.x ?? width / 2
  const oy = zoomOrigin?.y ?? height / 2
  const round = (n: number) => Math.round(n * 100) / 100
  const zx = (x: number) => round((x - ox) * zoom + ox)
  const zy = (y: number) => round((y - oy) * zoom + oy)

  const circles: React.ReactNode[] = []
  for (let i = 0; i < dots.length; i += 2) {
    circles.push(
      <circle
        cx={zx(grid.x0 + dots[i] * grid.stepX)}
        cy={zy(grid.y0 + dots[i + 1] * grid.stepY)}
        r={dotRadius}
        fill={dotColor}
        key={i}
      />
    )
  }

  return (
    <svg
      viewBox={`${pan.x} ${pan.y} ${width} ${height}`}
      className={cn("text-gray-500 dark:text-gray-500", className)}
      style={{ width: "100%", height: "100%", ...style }}
      {...svgProps}
    >
      {circles}

      {markers.map((marker, index) => {
        const x = zx(marker.x)
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
          </g>
        )
      })}
    </svg>
  )
}
