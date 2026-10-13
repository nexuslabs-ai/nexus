---
'@nexus_ds/tailwind': minor
'@nexus_ds/core': patch
'@nexus_ds/eslint-plugin': patch
---

Make shared spacing ordered from Tight through Spacious. Steps up to 8px stay fixed; from step 3 the density offset ramps in evenly and reaches −4, −2, 0, +2, +4 and +6px at 24px, holding there for every larger step. Every non-default density changes, including Relaxed at steps 3 and 5; Default is unchanged. Review layouts that use a non-default density. The token catalogue and the `canonical-spacing-steps` lint rule's allowed values follow the new scale.
