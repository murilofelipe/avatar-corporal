---
name: review-reflexao
description: Revisor de reflexao de solucao do avatar-corporal. Despache EM PARALELO (background) durante implementacoes nao-triviais ou geracao de testes - questiona a abordagem, alternativas nao consideradas, edge cases e simplificacoes antes de concluir. Read-only.
---

<!-- ARQUIVO GERADO por scripts/sync-agent-skills.sh — NÃO EDITE.
     O checklist real está em .agents/reviews/reflexao-solucao.md. Edite lá. -->

# Revisão: reflexao-solucao

**Leia `.agents/reviews/reflexao-solucao.md` e execute o checklist que está lá.**

1. Aplique-o ao diff atual (`git diff develop...HEAD`).
2. Reporte por severidade (🔴 / 🟠 / 🔵), com **arquivo:linha** e o **impacto concreto**.
   Não altere código: apenas reporte.

> Esta skill existe para os agentes **sem subagente configurável** (o Agy). No Claude Code,
> prefira o subagente `reflexao-solucao` — ele roda em contexto isolado.
