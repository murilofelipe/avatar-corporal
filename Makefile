.PHONY: build test typecheck check check-assets sync-agents hooks help

help: ## Lista os alvos
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN{FS=":.*?## "}{printf "  \033[36m%-14s\033[0m %s\n", $$1, $$2}'

build: ## Compila o pacote (ESM + d.ts) e copia assets/ para dist/
	npm run build

test: ## Roda os testes (Vitest)
	npm test

typecheck: ## Checagem de tipos sem emitir
	npm run typecheck

check: ## Guards de agente (mesmos do pre-push) — sem Docker, segundos
	@bash scripts/check-agent-assets.sh

check-assets: ## Relatório informativo das 24 imagens base (nunca trava)
	@python3 scripts/check-assets.py

sync-agents: ## Regera os ponteiros .claude/ a partir do canônico .agents/
	@bash scripts/sync-agent-skills.sh

hooks: ## Ativa os git hooks (bloqueia push direto em main, roda o check de agentes)
	git config core.hooksPath .githooks
	chmod +x .githooks/*
	@echo "Hooks ativos. Push direto para main sera recusado (escape: git push --no-verify)."
