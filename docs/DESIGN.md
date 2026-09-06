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

MVP: 8 faixas × 3 gêneros (`male`/`female`/`neutral`) × 1 vista (`front`) = 24 imagens.
`neutral` é o fallback obrigatório quando `gender` vier ausente/inválido.

## Heatmap da região dominante

`dominantRegions` (ranking, `[0]` = mais gordura) vem pronto do consumidor.
A saída é vetorial — `{ region, cx, cy, radius, intensity }[]`, coords
normalizadas 0–1 sobre a imagem, lidas de `assets/regions.json` (por
`gender × view`). O consumidor desenha o radial-gradient (cor/estilo dele).

Sem novos assets por região; funciona em qualquer faixa de %G.

## Fora de escopo (MVP)

- Vistas lado/costas — fase 2.
- Segundo eixo de bucketing (cintura-quadril / IMC) — só se o teste real com as
  imagens mostrar que falta distribuição.
- Cálculo de %G e do ranking de regiões — fica no `fitness-web`.
- CDN de assets — vão dentro do pacote.
