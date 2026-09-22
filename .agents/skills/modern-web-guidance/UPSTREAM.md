# Modern Web Guidance snapshot

- Source: https://github.com/GoogleChrome/modern-web-guidance
- npm package: `modern-web-guidance@0.0.190`
- Skill revision: `2026_09_04-7de96777`
- Retrieved: 2026-09-22
- Bundled guides: 147 Markdown files
- License: upstream Apache-2.0; see `LICENSE` and `THIRD_PARTY_NOTICES`.

This repository vendors the skill, revision marker, and Markdown guides for an
offline fallback. It does not vendor the CLI, model, search vectors, or executable
bundles. Normal online queries still use the upstream CLI. The version marker is
for freshness detection, not a pin on the version fetched by `@latest`.

## Refresh procedure

1. Read the latest npm metadata and unpack the chosen package in a temporary
   directory. Do not run the installer over Nexus's custom agent setup.
2. Compare guide IDs, moved paths, and content; replace the bundled guide tree
   with that release's Markdown files, removing stale paths.
3. Update `SKILL.md` and `skill-version.txt`, preserving the Nexus integration
   section. Keep Nexus's current environment policy authoritative.
4. Update this provenance record and upstream license/notices. Format the
   Markdown using the repository formatter.
5. Exercise a CLI search and retrieval; independently confirm a local guide can
   be read without the CLI. Check internal guide links and agent drift.
6. Include the source version, guide inventory changes, and verification in the PR.

Refresh this snapshot deliberately; npm `@latest` does not update these files.
Markdown may be reformatted to match the repository, but guide content is not
customized. Repository-specific overrides belong in the skill integration section
and Nexus rules, not in upstream guide prose.
