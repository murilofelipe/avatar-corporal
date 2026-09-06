#!/usr/bin/env python3
"""Fatiador de contact sheet → 24 imagens base.

Uso pontual: o GPT devolveu as 24 silhuetas numa folha única (3 linhas
gênero × 8 colunas faixa de %G) em vez de 24 arquivos, sem canal alfa (pinta
um xadrez de "transparência" em RGB) e com pílula/rótulo colados. Este script:

  1. reconstrói o alfa do corpo: luma-key + morfologia (abertura forte mata o
     xadrez e specks, fechamento recupera a borda, floodfill tapa buraco
     interno); pixel colorido = anotação → transparente;
  2. acha as 8 figuras de cada linha pelo perfil de alfa por coluna — a folha
     NÃO tem grade uniforme, então dividir por 8 igual não serve;
  3. normaliza o enquadramento (maior blob → mesma altura, centrado) porque
     enquadramento fixo é pré-requisito do regions.json (ver AGENTS.md);
  4. salva `${gender}-${bucket}-front.webp` 768x1024 RGBA.

    python3 scripts/slice-contact-sheet.py contact-sheet/<folha>.png

NÃO faz parte do build. Rodado uma vez; as 24 saídas é que ficam versionadas.
"""

from __future__ import annotations

import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
ASSETS = ROOT / "assets"

GENDERS = ["male", "female", "neutral"]
BUCKETS = ["lt10", "10-15", "15-20", "20-25", "25-30", "30-35", "35-40", "gte40"]
NCOLS = len(BUCKETS)

OUT_W, OUT_H = 768, 1024
BODY_FRAC = 0.92  # fração da altura do canvas que o corpo ocupa
TOP_MARGIN_FRAC = 0.04
LABEL_STRIP_FRAC = 0.03  # topo de cada linha; a pílula já sai pelo filtro de cor
COLOR_SAT = 22  # saturação RGB acima disto = anotação (pílula/texto), não corpo
ALPHA_MIN = 90  # alfa abaixo disto = franja, ignora
MIN_RUN_PX = 12  # coluna/linha isolada mais fina que isto = ruído
BODY_LUMA_MAX = 210  # corpo (inclui realces claros do peito); xadrez branco é 250+


def load_rgba(path: str) -> np.ndarray:
    """RGBA com alfa REAL do corpo. O GPT às vezes PINTA um xadrez de
    transparência (branco + cinza ~190) em RGB em vez de deixar alfa; e cola
    pílula/rótulo colorido. Então:
      - pixel colorido (pílula, texto)            → transparente;
      - pixel claro (xadrez, branco)              → transparente;
      - núcleo escuro do corpo, dilatado p/ pegar → opaco.
    A dilatação recupera a borda anti-aliased sem deixar entrar o xadrez (que
    nunca tem região escura grande)."""
    arr = np.array(Image.open(path).convert("RGBA"))
    rgb = arr[:, :, :3].astype(np.int16)
    luma = rgb.mean(2)
    colored = (rgb.max(2) - rgb.min(2)) > COLOR_SAT
    core = (luma <= BODY_LUMA_MAX) & ~colored

    mask = Image.fromarray((core * 255).astype(np.uint8))
    # abertura forte: apaga os quadrados do xadrez (~15px) e specks; o corpo,
    # sendo maciço, sobrevive
    mask = mask.filter(ImageFilter.MinFilter(9)).filter(ImageFilter.MaxFilter(9))
    # fechamento: recupera a borda anti-aliased perdida na abertura
    mask = mask.filter(ImageFilter.MaxFilter(5)).filter(ImageFilter.MinFilter(3))
    # tapa buraco interno residual: pinta o fundo pelas bordas, resto vira corpo
    flood = mask.copy()
    for xy in ((0, 0), (flood.width - 1, 0), (0, flood.height - 1), (flood.width - 1, flood.height - 1)):
        ImageDraw.floodfill(flood, xy, 128)
    arr[:, :, 3] = (np.array(flood) != 128).astype(np.uint8) * 255
    return arr


def runs(mask_1d: np.ndarray) -> list[tuple[int, int]]:
    """Intervalos [a,b) onde mask_1d é True, descartando os menores que MIN_RUN_PX."""
    idx = np.flatnonzero(
        np.diff(np.concatenate(([0], mask_1d.view(np.int8), [0])))
    )
    return [(a, b) for a, b in idx.reshape(-1, 2) if b - a >= MIN_RUN_PX]


def figure_columns(band_alpha: np.ndarray) -> list[tuple[int, int]]:
    """As 8 faixas horizontais das figuras. Divide runs grudados proporcional."""
    present = (band_alpha >= ALPHA_MIN).sum(0) > band_alpha.shape[0] * 0.02
    segs = runs(present)
    if not segs:
        return []
    widths = [b - a for a, b in segs]
    unit = min(widths)  # figura magra isolada ≈ 1 unidade
    out: list[tuple[int, int]] = []
    for (a, b), wdt in zip(segs, widths):
        n = max(1, round(wdt / unit))
        step = wdt / n
        out.extend((round(a + i * step), round(a + (i + 1) * step)) for i in range(n))
    # se ainda não deu 8, cai no rateio uniforme do span total
    if len(out) != NCOLS:
        lo, hi = segs[0][0], segs[-1][1]
        step = (hi - lo) / NCOLS
        out = [(round(lo + i * step), round(lo + (i + 1) * step)) for i in range(NCOLS)]
    return out


def normalize(cell: np.ndarray) -> Image.Image:
    """Recorta o corpo (maior blob vertical, ignora banda de texto) e centra
    num canvas 768x1024 com altura fixa."""
    canvas = Image.new("RGBA", (OUT_W, OUT_H), (0, 0, 0, 0))
    a = cell[:, :, 3] >= ALPHA_MIN
    row_has = a.any(1)
    row_segs = runs(row_has)
    if not row_segs:
        return canvas
    top, bot = max(row_segs, key=lambda s: s[1] - s[0])  # maior banda = corpo
    col_has = a[top:bot].any(0)
    col_segs = runs(col_has)
    if not col_segs:
        return canvas
    # maior run contíguo = massa do corpo; slivers da figura vizinha (mão quase
    # encostando na borda) são runs pequenos e destacados → descartados
    left, right = max(col_segs, key=lambda s: s[1] - s[0])

    body = Image.fromarray(cell[top:bot, left:right], "RGBA")
    target_h = round(OUT_H * BODY_FRAC)
    body = body.resize(
        (max(1, round(body.width * target_h / body.height)), target_h), Image.LANCZOS
    )
    canvas.alpha_composite(
        body, ((OUT_W - body.width) // 2, round(OUT_H * TOP_MARGIN_FRAC))
    )
    return canvas


def main() -> int:
    if len(sys.argv) != 2:
        print(__doc__)
        return 1
    sheet = load_rgba(sys.argv[1])
    h = sheet.shape[0]
    row_h = h / len(GENDERS)

    for r, gender in enumerate(GENDERS):
        top = round(r * row_h + row_h * LABEL_STRIP_FRAC)
        bot = round((r + 1) * row_h)
        band = sheet[top:bot]
        cols = figure_columns(band[:, :, 3])
        if len(cols) != NCOLS:
            print(f"  ! linha {gender}: achei {len(cols)} figuras, esperava {NCOLS}")
        for (left, right), bucket in zip(cols, BUCKETS):
            out = normalize(band[:, left:right])
            name = f"{gender}-{bucket}-front.webp"
            out.save(ASSETS / name, "WEBP", quality=90, method=3)
            print(f"  + {name}")
    print(f"\n24 imagens em {ASSETS.relative_to(ROOT)}/")
    return 0


if __name__ == "__main__":
    sys.exit(main())
