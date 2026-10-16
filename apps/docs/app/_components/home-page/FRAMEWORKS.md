# Frameworks section iteration

The existing homepage is the visual target: neutral surfaces, thin borders, rounded corners, and the existing typeface. The shared-foundation layout puts Nexus core and its token categories above framework icons. Text cards provide a quieter alternative. Availability labels remain explicit: React today; other bindings planned.

References: Refero's shadcn/ui style c14c0a94-1037-449e-bf5b-4cb972656ac7 informed flat bordered surfaces and restrained hierarchy; its Deno reference informed developer-oriented iconography. Existing Nexus tokens and typography take precedence over reference values.

Modern Web Guidance: offline CLI search for "responsive framework logo grid" failed with ENOTCACHED. Used the bundled `.agents/skills/modern-web-guidance/guides/css/css-layout.md`: intrinsic auto-fit grid, wrapping flex rows, logical properties, and container-based heading sizing. No environment queries or feature fallbacks.

Frameworks studio uses its own persisted DialKit controller and the existing DialRoot. It exposes layout, heading and label sizes, section and card padding, content gap, icon size, radius, and reset. The preview blocks stay empty.

Verification: prototype production build passed; browser confirmed framework icons, availability labels, and the Frameworks studio controls. Grid tracks use min(100%, 10rem) to fit narrow containers.
