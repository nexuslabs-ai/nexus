.DEFAULT_GOAL := help

.PHONY: help setup fresh clean dev console docs dev-all build tokens \
        test test-unit lint format typecheck audit verify \
        up down serve publish

help: ## Show this help (default)
	@echo ""
	@echo "Nexus Design System — make targets"
	@echo "Usage: make <target>"
	@echo ""
	@awk 'BEGIN{FS=":.*## "}/^[a-zA-Z0-9_-]+:.*## /{printf "  \033[36m%-12s\033[0m %s\n",$$1,$$2}' $(MAKEFILE_LIST)
	@echo ""

# ── Setup / lifecycle ─────────────────────────────────────────────────────────

setup: ## First-time setup: install deps + Playwright browser (story tests)
	pnpm install
	pnpm exec playwright install chromium
	@echo ""
	@echo "Setup complete. Try: make dev  (Storybook) | make up (docs-mcp)"

fresh: ## Nuke & rebuild: clean + install + build
	pnpm clean
	pnpm install
	pnpm build

clean: ## Stop docs-mcp, remove build outputs + node_modules
	-pnpm docs:stop
	pnpm clean

# ── Dev servers (turbo-orchestrated) ──────────────────────────────────────────

dev: ## Storybook — the primary component-dev surface (builds @nexus/core first)
	pnpm turbo storybook --filter=@nexus/react

console: ## Console app + live @nexus/react (turbo: app + react watcher)
	pnpm turbo dev --filter=@nexus/console...

docs: ## Docs site + live @nexus/react (turbo: docs + react watcher)
	pnpm turbo dev --filter=@nexus/docs...

dev-all: ## Everything: console + docs + storybook + package watchers (turbo)
	pnpm turbo dev storybook

# ── Build ─────────────────────────────────────────────────────────────────────

build: ## Build all packages (turbo)
	pnpm build

tokens: ## Regenerate token outputs (tailwind + modular CSS)
	pnpm tokens:tailwind
	pnpm tokens:modular

# ── Test & quality ─────────────────────────────────────────────────────────────

test: ## Full test suite (unit + storybook)
	pnpm test

test-unit: ## Unit tests only (jsdom — fast)
	pnpm test:unit

lint: ## ESLint — no warnings allowed
	pnpm lint

format: ## Prettier — write
	pnpm format

typecheck: ## TypeScript check across packages
	pnpm typecheck

audit: ## Token / a11y / browser audits
	pnpm validate:spacing-modes
	pnpm audit:browser-support
	pnpm audit:contrast
	pnpm audit:storybook-coverage

verify: ## Full pre-push gate: lint + format + typecheck + test + audits
	pnpm lint
	pnpm format:check
	pnpm typecheck
	pnpm test
	@$(MAKE) --no-print-directory audit

# ── Docs MCP (same workflow as examlly) ─────────────────────────────────────────

up: ## Pull + run the published docs-mcp image (teammates)
	pnpm docs:pull
	pnpm docs:start

down: ## Stop the docs-mcp container
	-pnpm docs:stop

serve: ## Run a local docs-mcp server for indexing (maintainer)
	pnpm docs:serve

publish: ## Login + export + build + push the docs-mcp image to GHCR (maintainer)
	pnpm docs:login
	pnpm docs:publish

