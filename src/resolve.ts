import regionsData from "../assets/regions.json" with { type: "json" };
import { ASSET_URL } from "./assetUrls.js";
import { bucketFor } from "./buckets.js";
import {
  BODY_VIEWS,
  type BodyRegion,
  type BodyRenderInput,
  type BodyRenderOutput,
  type BodyView,
  type Gender,
  type HeatmapSpot,
} from "./types.js";

const GENDERS: readonly Gender[] = ["male", "female", "neutral"];
const DEFAULT_VIEW: BodyView = "front";

/** No máximo 3 focos; intensidade decai com a posição no ranking. */
const MAX_SPOTS = 3;
const INTENSITY_STEP = 0.3;
const MIN_INTENSITY = 0.2;

type RegionCoord = { cx: number; cy: number; radius: number };
type RegionMap = Partial<Record<BodyRegion, RegionCoord>>;

const regions = regionsData as Record<
  string,
  Partial<Record<BodyView, RegionMap>>
>;

function normalizeGender(gender: unknown): Gender {
  return GENDERS.includes(gender as Gender) ? (gender as Gender) : "neutral";
}

function normalizeView(view: unknown): BodyView {
  return BODY_VIEWS.includes(view as BodyView) ? (view as BodyView) : DEFAULT_VIEW;
}

function buildHeatmap(
  dominant: BodyRegion[] | undefined,
  coords: RegionMap,
): HeatmapSpot[] {
  if (!dominant?.length) return [];
  const spots: HeatmapSpot[] = [];
  for (const region of dominant.slice(0, MAX_SPOTS)) {
    const c = coords[region];
    if (!c) continue; // região sem coord calibrada — ignora
    spots.push({
      region,
      cx: c.cx,
      cy: c.cy,
      radius: c.radius,
      intensity: Math.max(MIN_INTENSITY, 1 - spots.length * INTENSITY_STEP),
    });
  }
  return spots;
}

/**
 * Resolve a imagem de corpo e o heatmap da região dominante.
 * Síncrona e determinística — lookup por faixa, sem cálculo geométrico.
 */
export function resolveBodyImage(input: BodyRenderInput): BodyRenderOutput {
  const gender = normalizeGender(input.gender);
  const view = normalizeView(input.view);
  const bucket = bucketFor(input.bodyFatPercent);

  const file = `${gender}-${bucket}-${view}.webp`;
  // Lookup num mapa de `new URL` LITERAIS (ver scripts/gen-asset-urls.mjs) — um
  // `new URL(`./assets/${x}`)` com interpolação não é emitido pelo bundler do
  // consumidor e a URL apontaria pro nada em produção.
  const baseImageUrl = ASSET_URL[file] ?? "";

  const coords = regions[gender]?.[view] ?? {};
  return { baseImageUrl, heatmap: buildHeatmap(input.dominantRegions, coords) };
}
