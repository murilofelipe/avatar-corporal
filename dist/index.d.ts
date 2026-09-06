/**
 * Contrato do pacote. Ver `docs/DESIGN.md`.
 *
 * O consumidor (ex.: fitness-web) calcula o % de gordura e o ranking de regiões
 * dominantes; aqui só entra o `BodyRenderInput` pronto e sai o `BodyRenderOutput`.
 */
type Gender = "male" | "female" | "neutral";
/** Vistas disponíveis no banco de imagens. `side-left`/`side-right` = o corpo
 * visto de perfil, virado para a esquerda / direita. */
type BodyView = "front" | "back" | "side-left" | "side-right";
declare const BODY_VIEWS: readonly BodyView[];
/** Regiões com sinal de dobra cutânea própria no fitness-web. */
type BodyRegion = "abdomen" | "waist" | "chest" | "hip" | "thigh" | "arm" | "back";
declare const BODY_REGIONS: readonly BodyRegion[];
type BodyRenderInput = {
    gender: Gender;
    /** 0–100. Fora do intervalo dos buckets, clampa nas pontas. */
    bodyFatPercent: number;
    /** Ranking; `[0]` = região com mais gordura. Ausente ⇒ heatmap vazio. */
    dominantRegions?: BodyRegion[];
    /** Default `"front"`. */
    view?: BodyView;
};
/** Um foco de calor sobre a imagem. Coords normalizadas 0–1 (origem: topo-esquerda). */
type HeatmapSpot = {
    region: BodyRegion;
    cx: number;
    cy: number;
    radius: number;
    /** 0–1. Decai conforme a posição no ranking de `dominantRegions`. */
    intensity: number;
};
type BodyRenderOutput = {
    /** URL do `.webp` resolvido (via `new URL('./assets/...', import.meta.url)`). */
    baseImageUrl: string;
    heatmap: HeatmapSpot[];
};

/** Faixas de % de gordura. Ver `docs/DESIGN.md` §buckets. */
type BucketId = "lt10" | "10-15" | "15-20" | "20-25" | "25-30" | "30-35" | "35-40" | "gte40";
declare const BUCKET_IDS: readonly BucketId[];
/**
 * Faixa de `bodyFatPercent`. Determinística, sem interpolação.
 * `< 10` e `>= 40` clampam nas pontas; `NaN`/negativo caem em `lt10`.
 */
declare function bucketFor(bodyFatPercent: number): BucketId;

/**
 * Resolve a imagem de corpo e o heatmap da região dominante.
 * Síncrona e determinística — lookup por faixa, sem cálculo geométrico.
 */
declare function resolveBodyImage(input: BodyRenderInput): BodyRenderOutput;

export { BODY_REGIONS, BODY_VIEWS, BUCKET_IDS, type BodyRegion, type BodyRenderInput, type BodyRenderOutput, type BodyView, type BucketId, type Gender, type HeatmapSpot, bucketFor, resolveBodyImage };
