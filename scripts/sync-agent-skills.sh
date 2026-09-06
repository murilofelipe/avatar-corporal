#!/usr/bin/env bash
#
# Gera os PONTEIROS de `.claude/` a partir do conteúdo canônico de `.agents/`.
#
# POR QUE ISTO EXISTE
# -------------------
# O conteúdo (skills e checklists de revisão) vive UMA vez, em `.agents/` — pasta neutra,
# que o Agy lê nativamente (prioridade 1 na descoberta dele).
#
# O Claude Code, porém, SÓ lê `.claude/skills/` e `.claude/agents/` — é hardcoded no binário
# dele. Então cada arquivo lá é um PONTEIRO de 3 linhas para o canônico.
#
# O ponteiro precisa repetir o frontmatter (`name` + `description`). E a `description` NÃO é
# decoração: é o SINAL DE ROTEAMENTO — é por ela que o modelo decide usar a skill. Se ela
# divergir entre `.agents/` e `.claude/`, UM AGENTE USA A SKILL E O OUTRO NÃO, em silêncio.
#
# Por isso os ponteiros são GERADOS, nunca escritos à mão, e o CI reprova se estiverem fora
# de sincronia (`check-agent-assets.sh`). A divergência deixa de ser improvável e passa a ser
# IMPOSSÍVEL.
#
# ⚠️ NÃO EDITE NADA DENTRO DE `.claude/skills/` OU `.claude/agents/` — o próximo `make
# sync-agents` sobrescreve. Edite o canônico em `.agents/`.

set -euo pipefail

# ═════════════════════════════════════════════════════════════════════════════
#  A LINHA DE CORTE DO PROJETO — normalmente é a ÚNICA coisa a ajustar aqui.
# ═════════════════════════════════════════════════════════════════════════════
#
# Agentes que ESCREVEM (recebem Edit/Write e rodam em Sonnet, acompanhando a
# codificação). Todo o resto é revisor read-only e roda em Opus — um parecer
# raso custa caro: o revisor é a rede que pega o que a codificação não viu.
#
# Separe por espaço. Deixe VAZIO ("") se todos os agentes do projeto forem
# revisores read-only.
#
# Política completa: `.agents/rules/roteamento_modelos.md` na raiz `Github/`.
ESCREVEM=""

# `tools_de` e `model_de` derivam da MESMA lista de propósito. Antes eram dois
# `case` separados codificando a mesma decisão — se um projeto adicionasse um
# agente que escreve e esquecesse de mexer nos dois, ele ganhava `Write` mas
# rodava em Opus (ou o contrário), em silêncio. Uma fonte só torna impossível
# divergirem. Efeito colateral desejado: revisor NOVO nasce em Opus.
escreve()  { case " $ESCREVEM " in *" $1 "*) return 0 ;; *) return 1 ;; esac; }
tools_de() { escreve "$1" && echo "Bash, Read, Grep, Glob, Edit, Write" || echo "Bash, Read, Grep, Glob"; }
model_de() { escreve "$1" && echo "sonnet"                              || echo "opus"; }

# ── Metadados que SÓ O CLAUDE entende ────────────────────────────────────────
# `disable-model-invocation` = só o humano chama por `/` (o modelo não decide sozinho).
# Ajuste a lista para as skills do projeto que só o humano deve disparar.
flags_de() {
    case "$1" in
        commit-project|docs-sync) echo "disable-model-invocation: true" ;;
        *)                        echo "" ;;
    esac
}

# Nome curto da ponte de revisão (o do subagente é técnico: `security-reviewer`).
# O fallback genérico já funciona; a lista é só para apelidos mais curtos/pt-BR.
alias_de() {
    case "$1" in
        security-reviewer) echo "review-seguranca" ;;
        docs-auditor)      echo "review-docs" ;;
        test-writer)       echo "review-testes" ;;
        reflexao-solucao)  echo "review-reflexao" ;;
        *)                 echo "review-$1" ;;
    esac
}

campo() { grep -m1 "^$2:" "$1" | sed "s/^$2:[[:space:]]*//" | tr -d '\r'; }

rm -rf .claude/skills .claude/agents
mkdir -p .claude/skills .claude/agents

# ── 1. Skills: .agents/skills/<n>/SKILL.md → .claude/skills/<n>/SKILL.md ─────
for dir in .agents/skills/*/; do
    [ -d "$dir" ] || continue
    nome=$(basename "$dir")
    # `_algo` é esqueleto/molde do template, não conteúdo real — não vira ponteiro.
    case "$nome" in _*) continue ;; esac
    canonico="$dir/SKILL.md"

    mkdir -p ".claude/skills/$nome"
    {
        echo "---"
        echo "name: $(campo "$canonico" name)"
        echo "description: $(campo "$canonico" description)"
        flags=$(flags_de "$nome"); [ -n "$flags" ] && echo "$flags"
        echo "---"
    } > ".claude/skills/$nome/SKILL.md"
    cat >> ".claude/skills/$nome/SKILL.md" <<EOF

<!-- ARQUIVO GERADO por scripts/sync-agent-skills.sh — NÃO EDITE.
     O conteúdo real está em .agents/skills/$nome/SKILL.md. Edite lá. -->

# $nome

**Leia \`.agents/skills/$nome/SKILL.md\` e siga o que está lá.** É o conteúdo canônico,
compartilhado com os outros agentes deste repositório.

Este arquivo existe só porque o Claude Code lê skills exclusivamente de \`.claude/skills/\`
(caminho hardcoded). Ele é um ponteiro — a skill de verdade está em \`.agents/\`.
EOF
    echo "  skill    → .claude/skills/$nome/SKILL.md"
done

# ── 2. Revisores ────────────────────────────────────────────────────────────
# (a) subagente do Claude (contexto isolado)  (b) skill `review-*`, que é como a revisão
# chega ao Agy — ele não tem subagente configurável.
for canonico in .agents/reviews/*.md; do
    [ -f "$canonico" ] || continue
    nome=$(basename "$canonico" .md)
    # `_algo.md` é esqueleto/molde do template, não revisor real.
    case "$nome" in _*) continue ;; esac
    desc=$(campo "$canonico" description)

    cat > ".claude/agents/$nome.md" <<EOF
---
name: $(campo "$canonico" name)
description: $desc
tools: $(tools_de "$nome")
model: $(model_de "$nome")
---

<!-- ARQUIVO GERADO por scripts/sync-agent-skills.sh — NÃO EDITE.
     O checklist real está em .agents/reviews/$nome.md. Edite lá. -->

**Execute o checklist de \`.agents/reviews/$nome.md\`.**

1. Leia \`.agents/reviews/$nome.md\` — é o checklist canônico, compartilhado entre agentes.
2. Aplique-o ao diff atual (\`git diff develop...HEAD\`).
3. Reporte por severidade (🔴 alta / 🟠 média / 🔵 baixa), cada achado com **arquivo:linha**
   e o **impacto concreto** (o que quebra, para quem).
EOF
    echo "  revisor  → .claude/agents/$nome.md"

    escreve="Não altere código: apenas reporte."
    [ "$nome" = "test-writer" ] && escreve="Você PODE escrever os testes."

    ponte=$(alias_de "$nome")
    mkdir -p ".claude/skills/$ponte"
    cat > ".claude/skills/$ponte/SKILL.md" <<EOF
---
name: $ponte
description: $desc
---

<!-- ARQUIVO GERADO por scripts/sync-agent-skills.sh — NÃO EDITE.
     O checklist real está em .agents/reviews/$nome.md. Edite lá. -->

# Revisão: $nome

**Leia \`.agents/reviews/$nome.md\` e execute o checklist que está lá.**

1. Aplique-o ao diff atual (\`git diff develop...HEAD\`).
2. Reporte por severidade (🔴 / 🟠 / 🔵), com **arquivo:linha** e o **impacto concreto**.
   $escreve

> Esta skill existe para os agentes **sem subagente configurável** (o Agy). No Claude Code,
> prefira o subagente \`$nome\` — ele roda em contexto isolado.
EOF
    echo "  ponte    → .claude/skills/$ponte/SKILL.md"
done

echo "✅ Ponteiros regenerados a partir de .agents/ (canônico)."
