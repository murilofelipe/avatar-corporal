---
name: reflexao-solucao
description: Revisor de reflexao de solucao do avatar-corporal. Despache EM PARALELO (background) durante implementacoes nao-triviais ou geracao de testes - questiona a abordagem, alternativas nao consideradas, edge cases e simplificacoes antes de concluir. Read-only.
tools: Bash, Read, Grep, Glob
model: opus
---

<!-- ARQUIVO GERADO por scripts/sync-agent-skills.sh — NÃO EDITE.
     O checklist real está em .agents/reviews/reflexao-solucao.md. Edite lá. -->

**Execute o checklist de `.agents/reviews/reflexao-solucao.md`.**

1. Leia `.agents/reviews/reflexao-solucao.md` — é o checklist canônico, compartilhado entre agentes.
2. Aplique-o ao diff atual (`git diff develop...HEAD`).
3. Reporte por severidade (🔴 alta / 🟠 média / 🔵 baixa), cada achado com **arquivo:linha**
   e o **impacto concreto** (o que quebra, para quem).
