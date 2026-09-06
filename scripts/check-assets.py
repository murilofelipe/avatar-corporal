#!/usr/bin/env python3
"""Relatório informativo das imagens base do avatar-corporal.

NÃO é gate: sai sempre com código 0. As 24 imagens chegam do dono, não do build
(ver AGENTS.md e script_relatorio_offline.md). Saída dupla: stdout + arquivo.

Confere, para cada imagem esperada: presença, nome, formato WebP, dimensão
(768x1024) e canal alfa. Também lista arquivos inesperados em assets/.
"""

from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
ASSETS = ROOT / "assets"
REPORT = ROOT / ".reports" / "check-assets.md"

GENDERS = ["male", "female", "neutral"]
BUCKETS = ["lt10", "10-15", "15-20", "20-25", "25-30", "30-35", "35-40", "gte40"]
VIEWS = ["front"]
EXPECTED_W, EXPECTED_H = 768, 1024

EXPECTED = [
    f"{g}-{b}-{v}.webp" for g in GENDERS for b in BUCKETS for v in VIEWS
]

# Arquivos de assets/ que não são imagem base e não devem ser cobrados/estranhados.
IGNORE = {"README.md", "regions.json"}


def inspect(path: Path) -> tuple[bool, list[str]]:
    """(ok, problemas). Usa PIL se disponível; senão só confere a assinatura."""
    problems: list[str] = []
    try:
        from PIL import Image  # type: ignore

        with Image.open(path) as im:
            if im.format != "WEBP":
                problems.append(f"formato {im.format}, esperado WEBP")
            if (im.width, im.height) != (EXPECTED_W, EXPECTED_H):
                problems.append(
                    f"{im.width}x{im.height}, esperado {EXPECTED_W}x{EXPECTED_H}"
                )
            if im.mode not in ("RGBA", "LA") and "A" not in im.getbands():
                problems.append("sem canal alfa (fundo não é transparente)")
    except ImportError:
        head = path.read_bytes()[:12]
        if not (head[:4] == b"RIFF" and head[8:12] == b"WEBP"):
            problems.append("não é um arquivo WebP válido")
        problems.append("PIL ausente — dimensão/alfa não verificados")
    except Exception as exc:  # arquivo corrompido
        problems.append(f"erro ao abrir: {exc}")
    return (not problems, problems)


def build_report() -> str:
    present, missing, broken = [], [], []
    for name in EXPECTED:
        p = ASSETS / name
        if not p.exists():
            missing.append(name)
            continue
        ok, probs = inspect(p)
        (present if ok else broken).append((name, probs))

    unexpected = sorted(
        f.name
        for f in ASSETS.glob("*")
        if f.is_file() and f.name not in IGNORE and f.name not in EXPECTED
    )

    lines = ["# Relatório de imagens base — avatar-corporal", ""]
    lines.append(
        f"**Placar:** {len(present)}/{len(EXPECTED)} OK · "
        f"{len(broken)} com problema · {len(missing)} faltando · "
        f"{len(unexpected)} inesperado(s)"
    )
    lines.append("")
    lines.append(
        "> Limite: confere nome, formato WebP, dimensão e canal alfa. NÃO julga "
        "se o corpo corresponde à faixa, se o enquadramento é consistente entre "
        "faixas, nem se a silhueta está sem características de pele/etnia — isso "
        "é revisão visual humana (ver `ASSETS_REQUEST.md`)."
    )
    lines.append("")

    lines.append("## Faltando")
    lines.extend(f"- {n}" for n in missing) if missing else lines.append(
        "Nada pendente."
    )
    lines.append("")

    lines.append("## Com problema")
    if broken:
        for n, probs in broken:
            lines.append(f"- `assets/{n}` — {'; '.join(probs)}")
    else:
        lines.append("Nada pendente.")
    lines.append("")

    lines.append("## Inesperados em assets/")
    lines.extend(f"- `assets/{n}`" for n in unexpected) if unexpected else lines.append(
        "Nada pendente."
    )
    lines.append("")

    lines.append("## OK")
    lines.extend(f"- {n}" for n, _ in present) if present else lines.append(
        "Nenhuma imagem válida ainda."
    )
    lines.append("")
    return "\n".join(lines)


def selftest() -> int:
    assert len(EXPECTED) == 24, EXPECTED
    assert len(set(EXPECTED)) == 24
    assert "male-25-30-front.webp" in EXPECTED
    assert "neutral-gte40-front.webp" in EXPECTED
    r = build_report()  # não deve levantar exceção com assets/ só de placeholders
    assert "Placar:" in r
    print("selftest ok")
    return 0


def main() -> int:
    if "--selftest" in sys.argv:
        return selftest()
    report = build_report()
    REPORT.parent.mkdir(exist_ok=True)
    REPORT.write_text(report, encoding="utf-8")
    print(report)
    print(f"\n(relatório também salvo em {REPORT.relative_to(ROOT)})")
    return 0  # informativo, nunca trava


if __name__ == "__main__":
    sys.exit(main())
