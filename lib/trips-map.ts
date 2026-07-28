import { createMap } from "svg-dotted-map";
import { getMapPins, type MapPin } from "@/lib/trips";

/*
 * Server-only map geometry.
 *
 * Sampling the world into a dot grid is pure, depends only on TRIPS, and never
 * changes between renders — so it happens once at build time instead of twice
 * in the browser on every visit (the client used to sample the map here *and*
 * again inside DottedMap). Keeping `svg-dotted-map` behind this module also
 * keeps it out of the client bundle: nothing under components/ may import it,
 * and TripsMap must import from here with `import type` only.
 */

const MAP_WIDTH = 165;
const MAP_HEIGHT = 75;
const MAP_SAMPLES = 7000;
/** Degrees to step a marker when two cities collide on the same dot. */
const NUDGE_DEG = 0.25;

export type MapPinPoint = MapPin & { x: number; y: number };

/** Cell (col, row) sits at (x0 + col * stepX, y0 + row * stepY). */
export type DotGrid = {
  x0: number;
  y0: number;
  stepX: number;
  stepY: number;
};

export type MapGeometry = {
  width: number;
  height: number;
  grid: DotGrid;
  /**
   * Flat [col0, row0, col1, row1, …]. The sampler lands on a perfectly regular
   * lattice with only the land cells filled, so shipping small integers costs a
   * fraction of what ~2,400 pairs of viewBox floats would.
   */
  dots: number[];
  pins: MapPinPoint[];
  /** Centroid of the pins; zoom expands around it, not the canvas center. */
  origin: { x: number; y: number };
};

/** Lattice start and pitch for one axis — the smallest gap between two dots. */
function axis(values: number[]): { min: number; step: number } {
  const sorted = [...values].sort((a, b) => a - b);
  let step = Infinity;
  for (let i = 1; i < sorted.length; i++) {
    const gap = sorted[i] - sorted[i - 1];
    if (gap > 0) step = Math.min(step, gap);
  }
  return { min: sorted[0], step: Number.isFinite(step) ? step : 1 };
}

export function getMapGeometry(): MapGeometry {
  const { points, addMarkers } = createMap({
    width: MAP_WIDTH,
    height: MAP_HEIGHT,
    mapSamples: MAP_SAMPLES,
  });

  const project = (lat: number, lng: number) => addMarkers([{ lat, lng }])[0];
  const cell = (p: { x: number; y: number }) => `${p.x},${p.y}`;

  // Cities closer together than one dot land on the same grid point and hide
  // each other — Florianópolis and Balneário Camboriú are ~75km apart. Walk
  // the second one out to a free dot, along the bearing it really sits on.
  const taken = new Map<string, { lat: number; lng: number }>();
  const pins = getMapPins().map<MapPinPoint>((trip) => {
    let { lat, lng } = trip;
    let point = project(lat, lng);
    const occupant = taken.get(cell(point));
    if (occupant) {
      const dLat = trip.lat - occupant.lat;
      const dLng = trip.lng - occupant.lng;
      const mag = Math.hypot(dLat, dLng) || 1;
      for (let n = 1; n <= 20 && taken.has(cell(point)); n++) {
        lat = trip.lat + (dLat / mag) * n * NUDGE_DEG;
        lng = trip.lng + (dLng / mag) * n * NUDGE_DEG;
        point = project(lat, lng);
      }
    }
    taken.set(cell(point), { lat: trip.lat, lng: trip.lng });
    return { ...trip, x: point.x, y: point.y };
  });

  const xAxis = axis(points.map((p) => p.x));
  const yAxis = axis(points.map((p) => p.y));
  const grid: DotGrid = {
    x0: xAxis.min,
    y0: yAxis.min,
    stepX: xAxis.step,
    stepY: yAxis.step,
  };

  const dots: number[] = [];
  for (const point of points) {
    dots.push(
      Math.round((point.x - grid.x0) / grid.stepX),
      Math.round((point.y - grid.y0) / grid.stepY)
    );
  }

  return {
    width: MAP_WIDTH,
    height: MAP_HEIGHT,
    grid,
    dots,
    pins,
    origin: {
      x: pins.reduce((s, p) => s + p.x, 0) / pins.length,
      y: pins.reduce((s, p) => s + p.y, 0) / pins.length,
    },
  };
}
