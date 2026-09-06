import { expect, test } from "vitest";
import { resolveBodyImage } from "./resolve.js";

test("nome do arquivo = gender-bucket-view", () => {
  const { baseImageUrl } = resolveBodyImage({
    gender: "female",
    bodyFatPercent: 27.3,
  });
  expect(baseImageUrl).toMatch(/\/assets\/female-25-30-front\.webp$/);
});

test("gênero ausente/inválido → neutral", () => {
  const { baseImageUrl } = resolveBodyImage({
    // @ts-expect-error entrada suja de runtime
    gender: "outro",
    bodyFatPercent: 12,
  });
  expect(baseImageUrl).toMatch(/\/assets\/neutral-10-15-front\.webp$/);
});

test("%G clampa nas pontas", () => {
  expect(
    resolveBodyImage({ gender: "male", bodyFatPercent: 3 }).baseImageUrl,
  ).toMatch(/male-lt10-front/);
  expect(
    resolveBodyImage({ gender: "male", bodyFatPercent: 55 }).baseImageUrl,
  ).toMatch(/male-gte40-front/);
});

test("heatmap: ordem preservada, intensidade decai, máx 3", () => {
  const { heatmap } = resolveBodyImage({
    gender: "male",
    bodyFatPercent: 30,
    dominantRegions: ["abdomen", "waist", "chest", "hip"],
  });
  expect(heatmap.map((s) => s.region)).toEqual(["abdomen", "waist", "chest"]);
  expect(heatmap[0]!.intensity).toBeGreaterThan(heatmap[1]!.intensity);
  heatmap.forEach((s) => {
    expect(s.cx).toBeGreaterThanOrEqual(0);
    expect(s.cx).toBeLessThanOrEqual(1);
    expect(s.intensity).toBeGreaterThanOrEqual(0.2);
  });
});

test("sem dominantRegions → heatmap vazio", () => {
  expect(
    resolveBodyImage({ gender: "female", bodyFatPercent: 20 }).heatmap,
  ).toEqual([]);
});
