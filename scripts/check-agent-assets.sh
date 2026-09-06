#!/usr/bin/env bash
#
# Os ativos de agente (skills e checklists de revisão) valem para TODOS os agentes.
#
# COMO FUNCIONA
# -------------
#   `.agents/skills/<n>/SKILL.md`  ← CONTEÚDO CANÔNICO (edite aqui)
#   `.agents/reviews/<n>.md`       ← CONTEÚDO CANÔNICO (edite aqui)
#
#   `.claude/skills/`  e  `.claude/agents/`  ← PONTEIROS GERADOS (não edite)
#
# `.agents/` é a pasta neutra e o Agy a lê NATIVAMENTE (prioridade 1 na descoberta dele).
# O Claude Code só lê `.claude/` (hardcoded), então lá ficam ponteiros de 3 linhas —
# gerados por `scripts/sync-agent-skills.sh`, nunca escritos à mão.
#
# O QUE ESTE SCRIPT IMPEDE (tudo isto quebra EM SILÊNCIO)
# ------------------------------------------------------
#  1. Ponteiro fora de sincronia com o canônico. A `description` é o SINAL DE ROTEAMENTO —
#     é por ela que o modelo decide usar a skill. Se ela divergir, UM AGENTE USA A SKILL E O
#     OUTRO NÃO, e ninguém percebe. (Este é o check principal.)
#  2. Alguém escreveu CONTEÚDO dentro de um ponteiro → virou uma segunda fonte da verdade,
#     que vai divergir do canônico na primeira edição.
#  3. `name:` do frontmatter diferente do nome do diretório → a skill fica invisível.
#  4. `.agy/` ressuscitado — NÃO é raiz de customização de nada (as do Antigravity são
#     `.agents/`, `.agent/`, `_agents/`, `_agent/`). Existiu aqui e nunca foi lido.

set -euo pipefail

FALHAS=0
erro() { echo "❌ $*"; FALHAS=$((FALHAS + 1)); }

# ── 1. O canônico existe e está bem formado ─────────────────────────────────
[ -d .agents/skills ]  || erro ".agents/skills/ não existe — não há skill compartilhada nenhuma."
[ -d .agents/reviews ] || erro ".agents/reviews/ não existe — não há checklist de revisão."

# `_algo` é esqueleto/molde vindo do template — não é conteúdo real, não vira
# ponteiro (ver sync-agent-skills.sh) e não é validado aqui.
for dir in .agents/skills/*/; do
    [ -d "$dir" ] || continue
    nome=$(basename "$dir")
    case "$nome" in _*) continue ;; esac
    skill="$dir/SKILL.md"

    if [ ! -f "$skill" ]; then
        erro "$dir não tem SKILL.md — a skill não existe para agente nenhum."
        continue
    fi

    nome_fm=$(grep -m1 '^name:' "$skill" | sed 's/^name:[[:space:]]*//' | tr -d '\r')
    [ -n "$nome_fm" ] || erro "$skill não tem 'name:' — invisível para todos os agentes."
    [ "$nome_fm" = "$nome" ] || erro "$skill: name='$nome_fm' mas o diretório é '$nome'. Um typo aqui some com a skill."
    grep -q '^description:' "$skill" || erro "$skill não tem 'description:' — é por ela que o agente decide usar a skill."
done

for chk in .agents/reviews/*.md; do
    [ -f "$chk" ] || continue
    case "$(basename "$chk")" in _*) continue ;; esac
    grep -q '^name:' "$chk"        || erro "$chk não tem 'name:'."
    grep -q '^description:' "$chk" || erro "$chk não tem 'description:'."
done

# ── 2. O CHECK PRINCIPAL: os ponteiros estão em dia? ────────────────────────
# Regenera num diretório temporário e compara. Se der diferença, alguém editou um ponteiro
# à mão ou mudou o canônico sem rodar `make sync-agents`.
if [ -x scripts/sync-agent-skills.sh ]; then
    TMP=$(mktemp -d)
    trap 'rm -rf "$TMP"' EXIT

    cp -r .claude/skills .claude/agents "$TMP/" 2>/dev/null || true
    bash scripts/sync-agent-skills.sh >/dev/null

    if ! diff -r "$TMP/skills" .claude/skills >/dev/null 2>&1 \
       || ! diff -r "$TMP/agents" .claude/agents >/dev/null 2>&1; then
        erro "Os ponteiros de .claude/ estão FORA DE SINCRONIA com o canônico de .agents/.

    A 'description' de uma skill é o sinal de roteamento: se ela divergir, um agente usa a
    skill e o outro não — em silêncio.

    NÃO edite nada dentro de .claude/skills/ ou .claude/agents/ (é gerado).
    Edite o canônico em .agents/ e rode:  make sync-agents"

        # Restaura o que estava commitado, para não deixar o working tree sujo.
        rm -rf .claude/skills .claude/agents
        cp -r "$TMP/skills" .claude/skills
        cp -r "$TMP/agents" .claude/agents
    fi
fi

# ── 3. Ponteiro não pode ter conteúdo (senão vira 2ª fonte da verdade) ──────
LIMITE=20
for f in .claude/skills/*/SKILL.md .claude/agents/*.md; do
    [ -f "$f" ] || continue
    linhas=$(wc -l < "$f")
    if [ "$linhas" -gt "$LIMITE" ]; then
        erro "$f tem $linhas linhas (limite $LIMITE). Ponteiro não carrega conteúdo — o que tem
    regra dentro é o canônico, em .agents/. Dois lugares com regra sempre divergem."
    fi
    grep -q 'ARQUIVO GERADO' "$f" || erro "$f não tem o aviso de arquivo gerado — foi escrito à mão?"
done

# ── 4. `.agy/` não pode voltar ──────────────────────────────────────────────
if [ -e .agy ]; then
    erro ".agy/ existe — e NUNCA é lido por nada. As raízes do Antigravity são .agents/ (ou
    .agent/, _agents/, _agent/). Esse diretório já enganou este projeto uma vez: a 'regra' que
    morava nele jamais foi carregada."
fi

if [ "$FALHAS" -eq 0 ]; then
    n_skills=$(find .agents/skills -maxdepth 1 -mindepth 1 -type d -not -name '_*' | wc -l)
    n_rev=$(find .agents/reviews -maxdepth 1 -name '*.md' -not -name '_*' | wc -l)
    echo "✅ Ativos de agente íntegros: $n_skills skills + $n_rev revisores em .agents/ (canônico),"
    echo "   com os ponteiros de .claude/ em dia. Mesmo conteúdo para todo agente."
    exit 0
fi

echo
echo "$FALHAS problema(s). Nada disso dá erro em runtime — o agente só passa a trabalhar pior."
exit 1
