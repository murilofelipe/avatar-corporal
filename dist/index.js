// src/types.ts
var BODY_VIEWS = [
  "front",
  "back",
  "side-left",
  "side-right"
];
var BODY_REGIONS = [
  "abdomen",
  "waist",
  "chest",
  "hip",
  "thigh",
  "arm",
  "back"
];

// src/buckets.ts
var BUCKET_IDS = [
  "lt10",
  "10-15",
  "15-20",
  "20-25",
  "25-30",
  "30-35",
  "35-40",
  "gte40"
];
function bucketFor(bodyFatPercent) {
  if (!(bodyFatPercent >= 10)) return "lt10";
  if (bodyFatPercent >= 40) return "gte40";
  const lower = Math.floor(bodyFatPercent / 5) * 5;
  return `${lower}-${lower + 5}`;
}

// assets/regions.json
var regions_default = {
  _comment: "Coords normalizadas 0-1 (origem topo-esquerda). Calibrado contra as 96 imagens fatiadas de 2026-09-06 (enquadramento fixo: corpo em y 0.04-0.96). front tem ajuste por g\xEAnero; back/side-* usam a mesma coord nos 3 g\xEAneros por ora. Ajuste fino: issue #6. side-left = corpo virado p/ esquerda (barriga aponta p/ x baixo); side-right = espelhado.",
  male: {
    front: {
      chest: { cx: 0.5, cy: 0.31, radius: 0.15 },
      abdomen: { cx: 0.5, cy: 0.45, radius: 0.16 },
      waist: { cx: 0.5, cy: 0.4, radius: 0.13 },
      hip: { cx: 0.5, cy: 0.51, radius: 0.16 },
      thigh: { cx: 0.42, cy: 0.63, radius: 0.1 },
      arm: { cx: 0.27, cy: 0.33, radius: 0.06 },
      back: { cx: 0.5, cy: 0.33, radius: 0.16 }
    },
    back: {
      chest: { cx: 0.5, cy: 0.3, radius: 0.15 },
      abdomen: { cx: 0.5, cy: 0.46, radius: 0.15 },
      waist: { cx: 0.5, cy: 0.4, radius: 0.13 },
      hip: { cx: 0.5, cy: 0.52, radius: 0.17 },
      thigh: { cx: 0.42, cy: 0.63, radius: 0.1 },
      arm: { cx: 0.27, cy: 0.33, radius: 0.06 },
      back: { cx: 0.5, cy: 0.32, radius: 0.17 }
    },
    "side-left": {
      chest: { cx: 0.42, cy: 0.3, radius: 0.11 },
      abdomen: { cx: 0.4, cy: 0.46, radius: 0.12 },
      waist: { cx: 0.42, cy: 0.4, radius: 0.1 },
      hip: { cx: 0.55, cy: 0.53, radius: 0.12 },
      thigh: { cx: 0.5, cy: 0.63, radius: 0.1 },
      arm: { cx: 0.5, cy: 0.33, radius: 0.06 },
      back: { cx: 0.6, cy: 0.34, radius: 0.11 }
    },
    "side-right": {
      chest: { cx: 0.58, cy: 0.3, radius: 0.11 },
      abdomen: { cx: 0.6, cy: 0.46, radius: 0.12 },
      waist: { cx: 0.58, cy: 0.4, radius: 0.1 },
      hip: { cx: 0.45, cy: 0.53, radius: 0.12 },
      thigh: { cx: 0.5, cy: 0.63, radius: 0.1 },
      arm: { cx: 0.5, cy: 0.33, radius: 0.06 },
      back: { cx: 0.4, cy: 0.34, radius: 0.11 }
    }
  },
  female: {
    front: {
      chest: { cx: 0.5, cy: 0.31, radius: 0.14 },
      abdomen: { cx: 0.5, cy: 0.45, radius: 0.15 },
      waist: { cx: 0.5, cy: 0.39, radius: 0.12 },
      hip: { cx: 0.5, cy: 0.53, radius: 0.18 },
      thigh: { cx: 0.41, cy: 0.64, radius: 0.11 },
      arm: { cx: 0.26, cy: 0.33, radius: 0.06 },
      back: { cx: 0.5, cy: 0.34, radius: 0.16 }
    },
    back: {
      chest: { cx: 0.5, cy: 0.3, radius: 0.14 },
      abdomen: { cx: 0.5, cy: 0.46, radius: 0.14 },
      waist: { cx: 0.5, cy: 0.39, radius: 0.12 },
      hip: { cx: 0.5, cy: 0.53, radius: 0.19 },
      thigh: { cx: 0.41, cy: 0.64, radius: 0.11 },
      arm: { cx: 0.26, cy: 0.33, radius: 0.06 },
      back: { cx: 0.5, cy: 0.33, radius: 0.17 }
    },
    "side-left": {
      chest: { cx: 0.42, cy: 0.31, radius: 0.11 },
      abdomen: { cx: 0.4, cy: 0.46, radius: 0.12 },
      waist: { cx: 0.42, cy: 0.4, radius: 0.1 },
      hip: { cx: 0.56, cy: 0.54, radius: 0.13 },
      thigh: { cx: 0.5, cy: 0.64, radius: 0.11 },
      arm: { cx: 0.5, cy: 0.33, radius: 0.06 },
      back: { cx: 0.6, cy: 0.35, radius: 0.11 }
    },
    "side-right": {
      chest: { cx: 0.58, cy: 0.31, radius: 0.11 },
      abdomen: { cx: 0.6, cy: 0.46, radius: 0.12 },
      waist: { cx: 0.58, cy: 0.4, radius: 0.1 },
      hip: { cx: 0.44, cy: 0.54, radius: 0.13 },
      thigh: { cx: 0.5, cy: 0.64, radius: 0.11 },
      arm: { cx: 0.5, cy: 0.33, radius: 0.06 },
      back: { cx: 0.4, cy: 0.35, radius: 0.11 }
    }
  },
  neutral: {
    front: {
      chest: { cx: 0.5, cy: 0.31, radius: 0.15 },
      abdomen: { cx: 0.5, cy: 0.45, radius: 0.15 },
      waist: { cx: 0.5, cy: 0.4, radius: 0.13 },
      hip: { cx: 0.5, cy: 0.52, radius: 0.17 },
      thigh: { cx: 0.42, cy: 0.63, radius: 0.1 },
      arm: { cx: 0.27, cy: 0.33, radius: 0.06 },
      back: { cx: 0.5, cy: 0.33, radius: 0.16 }
    },
    back: {
      chest: { cx: 0.5, cy: 0.3, radius: 0.15 },
      abdomen: { cx: 0.5, cy: 0.46, radius: 0.15 },
      waist: { cx: 0.5, cy: 0.4, radius: 0.13 },
      hip: { cx: 0.5, cy: 0.52, radius: 0.18 },
      thigh: { cx: 0.42, cy: 0.63, radius: 0.1 },
      arm: { cx: 0.27, cy: 0.33, radius: 0.06 },
      back: { cx: 0.5, cy: 0.32, radius: 0.17 }
    },
    "side-left": {
      chest: { cx: 0.42, cy: 0.3, radius: 0.11 },
      abdomen: { cx: 0.4, cy: 0.46, radius: 0.12 },
      waist: { cx: 0.42, cy: 0.4, radius: 0.1 },
      hip: { cx: 0.55, cy: 0.53, radius: 0.12 },
      thigh: { cx: 0.5, cy: 0.63, radius: 0.1 },
      arm: { cx: 0.5, cy: 0.33, radius: 0.06 },
      back: { cx: 0.6, cy: 0.34, radius: 0.11 }
    },
    "side-right": {
      chest: { cx: 0.58, cy: 0.3, radius: 0.11 },
      abdomen: { cx: 0.6, cy: 0.46, radius: 0.12 },
      waist: { cx: 0.58, cy: 0.4, radius: 0.1 },
      hip: { cx: 0.45, cy: 0.53, radius: 0.12 },
      thigh: { cx: 0.5, cy: 0.63, radius: 0.1 },
      arm: { cx: 0.5, cy: 0.33, radius: 0.06 },
      back: { cx: 0.4, cy: 0.34, radius: 0.11 }
    }
  }
};

// src/resolve.ts
var GENDERS = ["male", "female", "neutral"];
var DEFAULT_VIEW = "front";
var MAX_SPOTS = 3;
var INTENSITY_STEP = 0.3;
var MIN_INTENSITY = 0.2;
var regions = regions_default;
function normalizeGender(gender) {
  return GENDERS.includes(gender) ? gender : "neutral";
}
function normalizeView(view) {
  return BODY_VIEWS.includes(view) ? view : DEFAULT_VIEW;
}
function buildHeatmap(dominant, coords) {
  if (!dominant?.length) return [];
  const spots = [];
  for (const region of dominant.slice(0, MAX_SPOTS)) {
    const c = coords[region];
    if (!c) continue;
    spots.push({
      region,
      cx: c.cx,
      cy: c.cy,
      radius: c.radius,
      intensity: Math.max(MIN_INTENSITY, 1 - spots.length * INTENSITY_STEP)
    });
  }
  return spots;
}
function resolveBodyImage(input) {
  const gender = normalizeGender(input.gender);
  const view = normalizeView(input.view);
  const bucket = bucketFor(input.bodyFatPercent);
  const file = `${gender}-${bucket}-${view}.webp`;
  const baseImageUrl = new URL(`./assets/${file}`, import.meta.url).href;
  const coords = regions[gender]?.[view] ?? {};
  return { baseImageUrl, heatmap: buildHeatmap(input.dominantRegions, coords) };
}
export {
  BODY_REGIONS,
  BODY_VIEWS,
  BUCKET_IDS,
  bucketFor,
  resolveBodyImage
};
