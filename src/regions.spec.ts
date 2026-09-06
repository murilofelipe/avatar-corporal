import { expect, test } from "vitest";
import regions from "../assets/regions.json" with { type: "json" };
import { BODY_REGIONS } from "./index.js";

// Só valida SHAPE. Os valores são placeholder até a calibração contra as 24
// imagens reais (issue #6) — não assertar coordenada aqui.

const GENDERS = ["male", "female", "neutral"] as const;
const VIEWS = ["front"] as const;

test.each(GENDERS)("%s tem todas as vistas e regiões", (gender) => {
  const byGender = (regions as Record<string, unknown>)[gender] as Record<
    string,
    Record<string, { cx: number; cy: number; radius: number }>
  >;
  expect(byGender).toBeDefined();

  for (const view of VIEWS) {
    const coords = byGender[view];
    expect(coords, `${gender}.${view}`).toBeDefined();
    for (const region of BODY_REGIONS) {
      const c = coords?.[region];
      expect(c, `${gender}.${view}.${region}`).toBeDefined();
      for (const k of ["cx", "cy", "radius"] as const) {
        expect(typeof c![k]).toBe("number");
        expect(c![k]).toBeGreaterThan(0);
        expect(c![k]).toBeLessThan(1);
      }
    }
  }
});
