import { expect, test } from "vitest";
import { PLACEHOLDER } from "./index.js";

// Scaffold: só prova que o toolchain (Vitest + ESM) está de pé.
// A lógica real e seus testes entram nas issues #2 e #3.
test("pacote carrega", () => {
  expect(PLACEHOLDER).toBe(true);
});
