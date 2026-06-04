# Documentation MCP Server Rules

## MANDATORY: Use nexus-docs-mcp for Library APIs

A local Docs MCP Server (`nexus-docs-mcp`) is running with pre-indexed documentation for every third-party dependency in this project. **Use it instead of relying on training data or web search** for any library-specific code.

### When to Use

If a task involves a specific framework, library, or API — either explicitly or implicitly — query the docs MCP first. This applies to:

- Writing or modifying code that uses any project dependency
- Answering questions about library APIs, configuration, or patterns
- Debugging issues that may stem from API changes or deprecations
- Suggesting library usage patterns or best practices

### How to Use

1. **Discover** the indexed library list with `mcp__nexus-docs-mcp__list_libraries`. Library names match the npm package name exactly (e.g., `tailwindcss`, `@radix-ui/react-dialog`, `react-hook-form`).
2. **Query** with `mcp__nexus-docs-mcp__search_docs` using the exact library name and a focused query. Use `limit: 1` or `limit: 2` for verification; default `limit: 5` for substantive research.
3. **Use the returned content** to inform your code — not your training data.
4. If a library returns "not found in store", check `list_libraries` for the exact name. If genuinely missing, fall back to WebSearch / WebFetch and **explicitly tell the user** so they can decide whether to add it to the index.

### Why This Exists

LLM training data contains deprecated and outdated API patterns. Libraries evolve faster than models are trained. The nexus-docs-mcp provides version-pinned documentation indexed from official sources — typically 5–10× cheaper in tokens than equivalent WebSearch + WebFetch lookups, and far more accurate for current versions.

**Do NOT guess APIs from memory. Always verify against indexed documentation.**
