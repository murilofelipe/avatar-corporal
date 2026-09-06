import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  dts: true,
  clean: true,
  // assets/ é copiado para dist/ pelo script de build (`cp -r assets dist/assets`).
  // `resolveBodyImage` devolve caminhos via `new URL('./assets/...', import.meta.url)`,
  // que resolvem ao lado do arquivo compilado — sem a cópia, apontam para o nada.
});
