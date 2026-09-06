import { expect, test } from "vitest";
import { BUCKET_IDS, bucketFor } from "./buckets.js";

test.each([
  [0, "lt10"],
  [9.99, "lt10"],
  [10, "10-15"],
  [14.9, "10-15"],
  [15, "15-20"],
  [27.3, "25-30"],
  [39.99, "35-40"],
  [40, "gte40"],
  [80, "gte40"],
])("bucketFor(%s) === %s", (pct, expected) => {
  expect(bucketFor(pct)).toBe(expected);
});

test("entradas inválidas caem em lt10 (clamp inferior)", () => {
  expect(bucketFor(Number.NaN)).toBe("lt10");
  expect(bucketFor(-5)).toBe("lt10");
});

test("todo bucket retornável está em BUCKET_IDS", () => {
  for (let p = 0; p <= 60; p += 0.5) {
    expect(BUCKET_IDS).toContain(bucketFor(p));
  }
});
