// Gera src/assetUrls.ts — um `new URL(...)` LITERAL por imagem.
// Necessário porque bundlers (Vite/Rollup) só resolvem `new URL` com string
// literal; `new URL(`./assets/${x}`)` com interpolação não emite o asset e a
// URL aponta pro nada em produção. Rodado no `prebuild`; o arquivo é commitado.
import { writeFileSync } from "node:fs";

const GENDERS = ["male", "female", "neutral"];
const BUCKETS = ["lt10", "10-15", "15-20", "20-25", "25-30", "30-35", "35-40", "gte40"];
const VIEWS = ["front", "back", "side-left", "side-right"];

const names = GENDERS.flatMap((g) =>
  BUCKETS.flatMap((b) => VIEWS.map((v) => `${g}-${b}-${v}.webp`)),
);

const body = names
  .map((n) => `  "${n}": new URL("./assets/${n}", import.meta.url).href,`)
  .join("\n");

writeFileSync(
  new URL("../src/assetUrls.ts", import.meta.url),
  `// ARQUIVO GERADO por scripts/gen-asset-urls.mjs — não edite à mão.\n` +
    `// Um \`new URL\` literal por imagem: bundlers só emitem o asset com string\n` +
    `// literal (ver o próprio gerador). ${names.length} entradas.\n\n` +
    `export const ASSET_URL: Record<string, string> = {\n${body}\n};\n`,
);
console.log(`src/assetUrls.ts: ${names.length} entradas`);
