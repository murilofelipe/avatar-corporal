#!/usr/bin/env python3
"""Fatiador de contact sheet → imagens base por vista.

O GPT devolve as silhuetas em folhas únicas (3 linhas gênero × 8 colunas faixa
de %G), uma folha por vista, em `contact-sheet/`. Este script, por folha:

  1. limpa a anotação: pílula/rótulo é colorido → alfa 0; abertura leve tira a
     franja solta do alfa;
  2. acha as 8 figuras da linha pelo perfil de alfa por coluna (a folha NÃO tem
     grade uniforme);
  3. normaliza o enquadramento (maior blob → mesma altura, centrado) — pré-
     requisito do regions.json (ver AGENTS.md);
  4. salva `${gender}-${bucket}-${view}.webp` 768x1024 RGBA em assets/.

    python3 scripts/slice-contact-sheet.py contact-sheet/front.png front
    python3 scripts/slice-contact-sheet.py --all      # todas as vistas de VIEWS

NÃO faz parte do build. Rodado pontualmente; as saídas é que ficam versionadas.
"""

from __future__ import annotations

import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
ASSETS = ROOT / "assets"
SHEETS = ROOT / "contact-sheet"

GENDERS = ["male", "female", "neutral"]
BUCKETS = ["lt10", "10-15", "15-20", "20-25", "25-30", "30-35", "35-40", "gte40"]
VIEWS = ["front", "back", "side-left", "side-right"]
NCOLS = len(BUCKETS)

OUT_W, OUT_H = 768, 1024
BODY_FRAC = 0.92  # fração da altura do canvas que o corpo ocupa
TOP_MARGIN_FRAC = 0.04
LABEL_STRIP_FRAC = 0.04  # topo de cada linha; a pílula já sai pelo filtro de cor
COLOR_SAT = 22  # saturação RGB acima disto = anotação (pílula/texto), não corpo
ALPHA_MIN = 80  # alfa abaixo disto = franja
MIN_RUN_PX = 12  # coluna/linha isolada mais fina que isto = ruído


def sheet_alpha(path: str) -> np.ndarray:
    """RGBA com o alfa já limpo: anotação colorida zerada + abertura leve."""
    arr = np.array(Image.open(path).convert("RGBA"))
    rgb = arr[:, :, :3].astype(np.int16)
    colored = (rgb.max(2) - rgb.min(2)) > COLOR_SAT
    a = arr[:, :, 3].copy()
    a[colored] = 0
    m = Image.fromarray(a)
    m = m.filter(ImageFilter.MinFilter(3)).filter(ImageFilter.MaxFilter(3))
    arr[:, :, 3] = np.array(m)
    return arr


def runs(mask_1d: np.ndarray) -> list[tuple[int, int]]:
    """Intervalos [a,b) onde mask_1d é True, ignorando os menores que MIN_RUN_PX."""
    idx = np.flatnonzero(np.diff(np.concatenate(([0], mask_1d.view(np.int8), [0]))))
    return [(a, b) for a, b in idx.reshape(-1, 2) if b - a >= MIN_RUN_PX]


def figure_columns(band_alpha: np.ndarray) -> list[tuple[int, int]]:
    """As 8 faixas horizontais das figuras. Divide runs grudados proporcional."""
    present = (band_alpha >= ALPHA_MIN).sum(0) > band_alpha.shape[0] * 0.02
    segs = runs(present)
    if not segs:
        return []
    widths = [b - a for a, b in segs]
    unit = min(widths)
    out: list[tuple[int, int]] = []
    for (a, _b), wdt in zip(segs, widths):
        n = max(1, round(wdt / unit))
        step = wdt / n
        out.extend((round(a + i * step), round(a + (i + 1) * step)) for i in range(n))
    if len(out) != NCOLS:  # fallback: rateio uniforme do span total
        lo, hi = segs[0][0], segs[-1][1]
        step = (hi - lo) / NCOLS
        out = [(round(lo + i * step), round(lo + (i + 1) * step)) for i in range(NCOLS)]
    return out


def normalize(cell: np.ndarray) -> Image.Image:
    """Recorta o corpo (maior blob) e centra num canvas 768x1024 de altura fixa."""
    canvas = Image.new("RGBA", (OUT_W, OUT_H), (0, 0, 0, 0))
    a = cell[:, :, 3] >= ALPHA_MIN
    row_segs = runs(a.any(1))
    if not row_segs:
        return canvas
    top, bot = max(row_segs, key=lambda s: s[1] - s[0])
    col_segs = runs(a[top:bot].any(0))
    if not col_segs:
        return canvas
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


def slice_sheet(path: Path, view: str) -> None:
    sheet = sheet_alpha(str(path))
    row_h = sheet.shape[0] / len(GENDERS)
    for r, gender in enumerate(GENDERS):
        top = round(r * row_h + row_h * LABEL_STRIP_FRAC)
        bot = round((r + 1) * row_h)
        band = sheet[top:bot]
        cols = figure_columns(band[:, :, 3])
        if len(cols) != NCOLS:
            print(f"  ! {view}/{gender}: achei {len(cols)} figuras, esperava {NCOLS}")
        for (left, right), bucket in zip(cols, BUCKETS):
            name = f"{gender}-{bucket}-{view}.webp"
            normalize(band[:, left:right]).save(
                ASSETS / name, "WEBP", quality=92, method=4
            )
            print(f"  + {name}")


def main() -> int:
    args = sys.argv[1:]
    if args == ["--all"]:
        jobs = [(SHEETS / f"{v}.png", v) for v in VIEWS]
    elif len(args) == 2:
        jobs = [(Path(args[0]), args[1])]
    else:
        print(__doc__)
        return 1

    for path, view in jobs:
        if view not in VIEWS:
            print(f"vista inválida: {view} (use uma de {VIEWS})")
            return 1
        if not path.exists():
            print(f"folha não encontrada: {path}")
            return 1
        print(f"→ {path.name} ({view})")
        slice_sheet(path, view)
    total = len(jobs) * len(GENDERS) * NCOLS
    print(f"\n{total} imagens em {ASSETS.relative_to(ROOT)}/")
    return 0


if __name__ == "__main__":
    sys.exit(main())
