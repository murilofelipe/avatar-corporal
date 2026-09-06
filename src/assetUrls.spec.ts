import { expect, test } from "vitest";
import { ASSET_URL } from "./assetUrls.js";
import { BODY_VIEWS } from "./index.js";
import { BUCKET_IDS } from "./buckets.js";

test("ASSET_URL cobre gênero × faixa × vista = 96, sem furo", () => {
  const genders = ["male", "female", "neutral"];
  const expected = genders.flatMap((g) =>
    BUCKET_IDS.flatMap((b) => BODY_VIEWS.map((v) => `${g}-${b}-${v}.webp`)),
  );
  expect(Object.keys(ASSET_URL).sort()).toEqual([...expected].sort());
  for (const url of Object.values(ASSET_URL)) {
    expect(url).toMatch(/\/assets\/[a-z0-9-]+\.webp$/);
  }
});
