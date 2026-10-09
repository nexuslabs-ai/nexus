---
'@nexus_ds/react': minor
---

Icons keep a fixed size at every density. Components that sized glyphs with numeric spacing utilities now use the `size-icon-glyph-*` utilities (12, 14 and 16px) or a fixed pixel size, so icons no longer grow or shrink with density. Checkbox and Radio boxes are sized from their 14px glyph plus border, so they stay 16px at every density and the check mark never overflows. The Switch thumb is sized from its track, so it fills the inner track height at every density, moves with a transform only, and stays aligned in right-to-left layouts; the default track is now thumb height plus two borders and is never shorter than `sm`. Menu and Select item indicators use a fixed 16px wrapper around their fixed glyphs.
