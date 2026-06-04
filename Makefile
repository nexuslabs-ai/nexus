.DEFAULT_GOAL := help

.PHONY: help setup dev storybook console docs build build-storybook tokens \
        test test-unit test-storybook lint format typecheck audit ci clean \
        docs-up docs-down docs-serve docs-login docs-publish docs-status

help: ## Show this help (default)
	@echo ""
	@echo "Nexus Design System — make targets"
	@echo "Usage: make <target>"
	@echo ""
	@awk 'BEGIN{FS=":.*## "}/^[a-zA-Z0-9_-]+:.*## /{printf "  \033[36m%-16s\033[0m %s\n",$$1,$$2}' $(MAKEFILE_LIST)
	@echo ""

# ── Setup ─────────────────────────────────────────────────────────────────────

setup: ## First-time setup: install deps + Playwright browser (for story tests)
	pnpm install
	pnpm exec playwright install chromium
	@echo ""
	@echo "Setup complete. Try: make storybook | make dev | make docs-up"

# ── Dev servers ───────────────────────────────────────────────────────────────

dev: ## Watch-build every package (turbo dev)
	pnpm dev

storybook: ## Component catalog + interaction tests (Storybook)
	pnpm storybook

console: ## Run the console demo app (Vite)
	pnpm console

docs: ## Run the documentation site (Next.js)
	pnpm --filter @nexus/docs dev

# ── Build ─────────────────────────────────────────────────────────────────────

build: ## Build all packages (turbo)
	pnpm build

build-storybook: ## Build static Storybook
	pnpm build-storybook

tokens: ## Regenerate token outputs (tailwind + modular CSS)
	pnpm tokens:tailwind
	pnpm tokens:modular

# ── Test & quality ─────────────────────────────────────────────────────────────

test: ## Full test suite (unit + storybook)
	pnpm test

test-unit: ## Unit tests only (jsdom)
	pnpm test:unit

test-storybook: ## Story / interaction tests (chromium)
	pnpm test:storybook

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

ci: ## Fast local CI: lint + format:check + typecheck + build
	pnpm lint
	pnpm format:check
	pnpm typecheck
	pnpm build

clean: ## Stop docs-mcp, remove build outputs + node_modules
	-pnpm docs:stop
	pnpm clean

# ── Docs MCP (same workflow as examlly) ─────────────────────────────────────────

docs-up: ## Pull + run the published docs-mcp image (teammates)
	pnpm docs:pull
	pnpm docs:start

docs-down: ## Stop the docs-mcp container
	-pnpm docs:stop

docs-serve: ## Run a local docs-mcp server for indexing (maintainer)
	pnpm docs:serve

docs-login: ## Authenticate to GHCR as nexuslabs-ai-bot (maintainer)
	pnpm docs:login

docs-publish: ## Export + build + push the docs-mcp image to GHCR (maintainer)
	pnpm docs:publish

docs-status: ## Show docs-mcp container status
	@docker ps --filter "name=nexus-docs-mcp" --format "{{.Names}}\t{{.Status}}\t{{.Ports}}" | grep -q nexus-docs-mcp \
		&& docker ps --filter "name=nexus-docs-mcp" --format "{{.Names}}\t{{.Status}}\t{{.Ports}}" \
		|| echo "Docs MCP is not running"

