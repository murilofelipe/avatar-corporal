import { expect, expectTypeOf, test } from "vitest";
import { BODY_REGIONS, BODY_VIEWS } from "./index.js";
import type { BodyRenderInput, BodyRenderOutput, HeatmapSpot } from "./index.js";

test("BODY_VIEWS: front + back + 2 lados, sem duplicata", () => {
  expect(BODY_VIEWS).toEqual(["front", "back", "side-left", "side-right"]);
  expect(new Set(BODY_VIEWS).size).toBe(BODY_VIEWS.length);
});

test("BODY_REGIONS cobre as 7 regiões, sem duplicata", () => {
  expect(BODY_REGIONS).toEqual([
    "abdomen",
    "waist",
    "chest",
    "hip",
    "thigh",
    "arm",
    "back",
  ]);
  expect(new Set(BODY_REGIONS).size).toBe(BODY_REGIONS.length);
});

test("shape do contrato", () => {
  const input: BodyRenderInput = {
    gender: "female",
    bodyFatPercent: 27.3,
    dominantRegions: ["hip", "thigh"],
  };
  expect(input.view).toBeUndefined();

  expectTypeOf<BodyRenderOutput>().toMatchTypeOf<{
    baseImageUrl: string;
    heatmap: HeatmapSpot[];
  }>();
});
