/**
 * Contrato do pacote. Ver `docs/DESIGN.md`.
 *
 * O consumidor (ex.: fitness-web) calcula o % de gordura e o ranking de regiões
 * dominantes; aqui só entra o `BodyRenderInput` pronto e sai o `BodyRenderOutput`.
 */

export type Gender = "male" | "female" | "neutral";

/** Só `front` no MVP. Lado/costas são fase 2. */
export type BodyView = "front";

/** Regiões com sinal de dobra cutânea própria no fitness-web. */
export type BodyRegion =
  | "abdomen"
  | "waist"
  | "chest"
  | "hip"
  | "thigh"
  | "arm"
  | "back";

export const BODY_REGIONS: readonly BodyRegion[] = [
  "abdomen",
  "waist",
  "chest",
  "hip",
  "thigh",
  "arm",
  "back",
] as const;

export type BodyRenderInput = {
  gender: Gender;
  /** 0–100. Fora do intervalo dos buckets, clampa nas pontas. */
  bodyFatPercent: number;
  /** Ranking; `[0]` = região com mais gordura. Ausente ⇒ heatmap vazio. */
  dominantRegions?: BodyRegion[];
  /** Default `"front"`. */
  view?: BodyView;
};

/** Um foco de calor sobre a imagem. Coords normalizadas 0–1 (origem: topo-esquerda). */
export type HeatmapSpot = {
  region: BodyRegion;
  cx: number;
  cy: number;
  radius: number;
  /** 0–1. Decai conforme a posição no ranking de `dominantRegions`. */
  intensity: number;
};

export type BodyRenderOutput = {
  /** URL do `.webp` resolvido (via `new URL('./assets/...', import.meta.url)`). */
  baseImageUrl: string;
  heatmap: HeatmapSpot[];
};
