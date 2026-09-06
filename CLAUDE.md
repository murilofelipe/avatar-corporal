# CLAUDE.md — avatar-corporal

## As regras do projeto vivem no AGENTS.md

@AGENTS.md

> ☝️ **Se o import acima não tiver sido expandido no seu contexto, PARE e leia
> `AGENTS.md` (raiz) integralmente antes de qualquer outra coisa.** Ele é a
> fonte única de regras deste repositório — para você, para o Junie, para o Agy
> e para qualquer agente futuro. Este arquivo só traz o que é específico do
> Claude Code.

---

## Específico do Claude Code

**Subagentes** (`.claude/agents/`) — todos read-only **em Opus**, exceto os que
escrevem (listados em `ESCREVEM=` no `scripts/sync-agent-skills.sh`), que rodam
em **Sonnet** junto com a codificação. Ver "Roteamento de modelos" no
`AGENTS.md`.

<!-- Liste os revisores REAIS deste projeto. A coluna "Quando usar" é o que faz
     o subagente ser lembrado — seja concreto (que tipo de diff, que pasta). -->

| Agente | Quando usar |
|---|---|
| `reflexao-solucao` | Implementação não-trivial: despachar **em background, em paralelo**, para questionar abordagem/edge cases — incorporar o parecer antes de concluir |

**Skills** (`/<skill>`, `/<skill>`) + as pontes `review-*` (existem para o Agy —
**aqui prefira o subagente**, que roda em contexto isolado).

## ⚠️ `.claude/skills/` e `.claude/agents/` são GERADOS — não edite

O conteúdo canônico vive em **`.agents/`** (pasta neutra, compartilhada com o
Agy, que a lê nativamente):

| Editar | Nunca editar |
|---|---|
| `.agents/skills/<nome>/SKILL.md` | `.claude/skills/**` |
| `.agents/reviews/<nome>.md` | `.claude/agents/**` |

Depois de editar o canônico: **`make sync-agents`**. `make check` (rodado
automaticamente no `pre-push` via `make hooks`) reprova ponteiro fora de
sincronia. Ver "Skills e revisores" no `AGENTS.md`.

<!-- Se o projeto tiver hooks em .claude/hooks/, documente aqui o que cada um
     bloqueia E o que ele NÃO cobre (ex.: hook de PreToolUse não pega `sed -i`
     via Bash). O que o hook não cobre é mais útil que o que ele cobre. -->

**Verificação:** rodar teste não é verificar. Para mudança com superfície de
runtime, **dirija o app** e navegue.
