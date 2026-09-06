# Design — avatar-corporal

## Problema

Mostrar ao aluno como está o corpo dele e onde acumula mais gordura, a partir
dos dados da avaliação física. Sem cor de pele / etnia — manequim cinza neutro,
uma silhueta por gênero.

## Decisão: banco de imagens + lookup (não warp, não geometria)

O `fitness-web` já tentou deformação por warp 2D (row-band) e por geometria SVG.
Nenhum produziu resultado corporal convincente. Aqui a abordagem é **banco de
imagens pré-renderizadas** selecionadas por faixa:

    bucket(bodyFatPercent) × gender × view → arquivo .webp

Zero cálculo matemático em runtime. A "curadoria" é produzir as imagens certas
(ver `ASSETS_REQUEST.md`), não código.

### Buckets de % de gordura

`[<10, 10–15, 15–20, 20–25, 25–30, 30–35, 35–40, ≥40]` — 8 faixas, **mesmos
limites para os 3 gêneros** (o corpo do bucket é que difere). Fora do intervalo,
clampa nas pontas.

8 faixas × 3 gêneros (`male`/`female`/`neutral`) × 4 vistas (`front`, `back`,
`side-left`, `side-right`) = 96 imagens. `neutral` e `front` são os fallbacks
quando `gender`/`view` vierem ausentes ou inválidos.
`neutral` é o fallback obrigatório quando `gender` vier ausente/inválido.

## Heatmap da região dominante

`dominantRegions` (ranking, `[0]` = mais gordura) vem pronto do consumidor.
A saída é vetorial — `{ region, cx, cy, radius, intensity }[]`, coords
normalizadas 0–1 sobre a imagem, lidas de `assets/regions.json` (por
`gender × view`). O consumidor desenha o radial-gradient (cor/estilo dele).

Sem novos assets por região; funciona em qualquer faixa de %G.

## Fora de escopo (MVP)

- Segundo eixo de bucketing (cintura-quadril / IMC) — só se o teste real com as
  imagens mostrar que falta distribuição.
- Cálculo de %G e do ranking de regiões — fica no `fitness-web`.
- CDN de assets — vão dentro do pacote.

## Calibração do regions.json (issue #6)

`assets/regions.json` está com **coordenadas placeholder**. A calibração real
depende das 96 imagens finais (enquadramento fixo é pré-requisito). Quando
chegarem: ajustar `cx/cy/radius` de cada região por gênero à mão, conferindo o
alinhamento do heatmap sobre a imagem. O teste `src/regions.spec.ts` só valida
o shape — não trava a calibração.

## Por que `src/assetUrls.ts` é gerado

`resolveBodyImage` devolve a URL da imagem por lookup num mapa de `new URL(...)`
**literais** (`scripts/gen-asset-urls.mjs`, roda no `prebuild`). Bundlers
(Vite/Rollup) só emitem o asset e reescrevem o caminho quando a string do
`new URL` é literal — `new URL(`./assets/${x}`)` com interpolação passa no dev
e nos testes e **quebra no build de produção do consumidor**.
