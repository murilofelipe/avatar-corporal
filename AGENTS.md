# AGENTS.md — Regras do avatar-corporal para qualquer agente de IA

> **Este é o arquivo canônico.** Claude Code, Junie, Agy e qualquer agente
> futuro seguem daqui. Se você é um agente e encontrou outro arquivo de regras
> neste repositório que contradiz este, **este vence** — e o outro é um bug:
> avise.

---

<!-- ═══════════════════════════════════════════════════════════════════════
     A PARTIR DAQUI ATÉ "Roteamento de modelos" É ESPECÍFICO DO PROJETO.
     Preencha com as regras reais. Apague as seções que não se aplicam —
     seção vazia com título ensina o agente a ignorar o arquivo.
     ═══════════════════════════════════════════════════════════════════════ -->

## O que este repositório é

Pacote TS puro (ESM, **zero dependências de runtime**) que resolve **qual imagem
de corpo** mostrar a partir de `% de gordura + gênero` e descreve um **heatmap
vetorial** da região com mais gordura. Consumido por `git+ssh` (`fitness-web`,
futuramente `sition-web`, games).

## Se você só vai ler uma coisa

1. **Este pacote NÃO calcula % de gordura nem decide a região dominante.** Isso é
   regra de negócio do consumidor (`fitness-web`). Aqui só entra `BodyRenderInput`
   já pronto e sai `BodyRenderOutput`.
2. **`resolveBodyImage` é síncrona, determinística e sem trigonometria** — é
   lookup por faixa (`bucket(%G) × gender → arquivo`). Se você está escrevendo
   `Math.sin`, parou de seguir o design (ver `docs/DESIGN.md`).
3. **A imagem é função só de `%G + gênero`.** Circunferências/dobras/peso não
   deformam a silhueta — no MVP alimentam só o ranking do heatmap. Não invente
   um segundo eixo sem story.
4. **Enquadramento das 24 imagens é fixo** (mesma altura de ombro/quadril). O
   `regions.json` depende disso; se as imagens variarem o crop, o heatmap
   desalinha.
5. **`check-assets` é informativo, nunca gate.** As 24 imagens chegam do dono,
   não do build.
6. **Nunca commitar direto em `main`/`develop`** — `make hooks`.

---

## Rotas de leitura (não leia tudo)

| Vou mexer em… | Leia antes |
|---|---|
| Qualquer coisa | `docs/DESIGN.md` |
| lookup / buckets | `src/lookup.ts` + `docs/DESIGN.md` §buckets |
| heatmap / coords | `assets/regions.json` + issue #6 |
| as imagens | `ASSETS_REQUEST.md` |

---

## Convenções

- TS strict, ESM, sem dep de runtime. `tsup` builda; `assets/` é copiado para
  `dist/` no build (senão `new URL(import.meta.url)` aponta pro nada).
- Vitest, testes ao lado do código (`*.spec.ts`).
- Conventional Commits em pt-BR.

---

## Processo

- **Conventional Commits em pt-BR**, escopo por domínio.
- **Documentação em commit separado do código.**
- **Nunca commitar direto em `main`/`develop`** — `make hooks` ativa o guard
  local de push (`.githooks/pre-push`). Entregas entram por PR com base em
  `develop`; `develop → main` também por PR.

<!-- ═══════════════════════════════════════════════════════════════════════
     DAQUI PARA BAIXO É PORTÁVEL — veio pronto do template, vale igual em
     todo projeto. Só ajuste os nomes dos agentes citados na 2ª seção.
     ═══════════════════════════════════════════════════════════════════════ -->

## Roteamento de modelos (política do dono)

**A linha de corte é uma só: quem PENSA/REVISA roda em Opus; quem ESCREVE roda
em Sonnet.**

- **Planejamento, avaliação e revisão → Opus. Codificação e testes → Sonnet** —
  automático via `"model": "opusplan"` nos settings do usuário
  (`~/.claude/settings.json`); não reconfigure por sessão.
- **Subagentes**: todo revisor read-only roda em **Opus** (um parecer raso
  custa caro — ele é a rede que pega o que a codificação não viu); quem
  escreve roda em **Sonnet**, junto com a codificação. Isso sai da lista
  `ESCREVEM=` em `scripts/sync-agent-skills.sh`, de onde `tools_de()` e
  `model_de()` derivam — revisor novo nasce em Opus por default.
- **Em paralelo à codificação**: em implementação não-trivial (regra nova de
  negócio, autorização, migração, contrato de API), **despache
  `reflexao-solucao` e/ou o revisor de segurança em background** enquanto
  codifica e **incorpore o parecer antes de concluir**. Convenção de processo —
  o agente julga o que é não-trivial.
- **Ao planejar em Opus, escreva para quem NÃO viu a exploração.** O plano vai
  ser executado por um Sonnet que não leu os arquivos que você leu: use
  caminhos exatos, aponte o que já existe e deve ser reusado, registre as
  decisões **com o porquê** (sem o motivo, o executor "reotimiza" de volta),
  liste as armadilhas do projeto que se aplicam, dê os comandos de verificação
  literais e diga o que está fora de escopo.
- Política completa: `.agents/rules/roteamento_modelos.md` na raiz `Github/`
  (herdada por todos os projetos).

## Skills e revisores — compartilhados entre agentes

Os **procedimentos** (commitar, sincronizar docs) e os **checklists de revisão**
não são conhecimento de uma ferramenta só. O conteúdo vive **uma vez**, numa
pasta neutra:

```
.agents/skills/<nome>/SKILL.md   ← o conteúdo. EDITE AQUI.
.agents/reviews/<nome>.md        ← o checklist. EDITE AQUI.
```

**Cada agente lê a sua própria pasta padrão, e ela aponta para o canônico:**

| Agente | Como chega ao conteúdo |
|---|---|
| **Agy** (Antigravity) | lê `.agents/skills/` **nativamente** — é a descoberta de prioridade 1 dele |
| **Claude Code** | lê `.claude/skills/` e `.claude/agents/` (caminho **hardcoded** no binário) → são **ponteiros gerados** para `.agents/` |
| **Um agente futuro** | mesma receita: a pasta dele recebe ponteiros; o conteúdo não se move |

### ⚠️ Nunca edite nada dentro de `.claude/skills/` ou `.claude/agents/`

**É gerado** por `scripts/sync-agent-skills.sh`. Editou o canônico? Rode:

```bash
make sync-agents
```

A `description` do frontmatter é o **sinal de roteamento** — é por ela que o
modelo decide usar a skill. Se ela divergir entre `.agents/` e `.claude/`, **um
agente usa a skill e o outro não**, em silêncio. Por isso os ponteiros são
gerados, e `make check` reprova se estiverem fora de sincronia
(`scripts/check-agent-assets.sh`). `make hooks` ativa `make check` como guard
local de `pre-push`.

> 🕳️ **`.agy/` nunca é lido por nada** — as raízes de customização do
> Antigravity são `.agents/`, `.agent/`, `_agents/`, `_agent/`. Se esse
> diretório existir no projeto, pode apagar: a "regra" que mora nele jamais foi
> carregada.
