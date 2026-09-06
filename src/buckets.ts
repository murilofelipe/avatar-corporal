/** Faixas de % de gordura. Ver `docs/DESIGN.md` §buckets. */

export type BucketId =
  | "lt10"
  | "10-15"
  | "15-20"
  | "20-25"
  | "25-30"
  | "30-35"
  | "35-40"
  | "gte40";

export const BUCKET_IDS: readonly BucketId[] = [
  "lt10",
  "10-15",
  "15-20",
  "20-25",
  "25-30",
  "30-35",
  "35-40",
  "gte40",
] as const;

/**
 * Faixa de `bodyFatPercent`. Determinística, sem interpolação.
 * `< 10` e `>= 40` clampam nas pontas; `NaN`/negativo caem em `lt10`.
 */
export function bucketFor(bodyFatPercent: number): BucketId {
  if (!(bodyFatPercent >= 10)) return "lt10"; // pega NaN e negativos também
  if (bodyFatPercent >= 40) return "gte40";
  const lower = Math.floor(bodyFatPercent / 5) * 5; // 10,15,20,25,30,35
  return `${lower}-${lower + 5}` as BucketId;
}
