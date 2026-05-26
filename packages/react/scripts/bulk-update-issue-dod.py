#!/usr/bin/env python3
"""
Bulk-add or refresh the 'Definition of Done' section on Phase 1 component issues
under epic #161 (one issue per shadcn-adapted component).

Originally a one-shot append, this script also handles in-place refresh: when an
existing DoD section is detected, it is replaced wholesale rather than skipped.
That makes it safe to re-run after the DoD template changes (e.g. wording
adjustments aligned with `.claude/rules/testing-react.md`).

Idempotence marker
------------------
The previous version of this script used the literal `## Definition of Done`
heading as the skip-detector. That marker is too generic — a future issue body
that legitimately uses the same heading for unrelated content would be silently
skipped. This version anchors detection on the issue-specific audit command line
(`audit:storybook-coverage --component <kebab>`), which only appears inside our
DoD template. Re-running with an unchanged template is a no-op; re-running with
a changed template rewrites the section in place.

Run
---
    python3 packages/react/scripts/bulk-update-issue-dod.py --dry-run
    python3 packages/react/scripts/bulk-update-issue-dod.py            # writes to GitHub
    python3 packages/react/scripts/bulk-update-issue-dod.py --only 162 # one issue

Phase 3/4 use
-------------
If a future phase needs the same per-issue DoD wiring, copy this file, update
ISSUES + DOD_TEMPLATE, and re-run. The `audit:...--component {kebab}` anchor
generalises to any per-component audit invocation.
"""

import argparse
import json
import re
import subprocess
import sys
from pathlib import Path

ISSUES = {
    97: "sonner",
    162: "label",
    163: "separator",
    164: "skeleton",
    165: "textarea",
    166: "checkbox",
    167: "radio-group",
    168: "progress",
    169: "table",
    170: "scroll-area",
    171: "popover",
    172: "input-otp",
    173: "alert-dialog",
    174: "sheet",
    175: "command",
    176: "form",
    177: "sidebar",
}

DOD_TEMPLATE = """## Definition of Done

After implementing this component, the audit must report clean before merge:

```bash
yarn workspace @nexus/react audit:storybook-coverage --component {kebab}
# exit 0 — no `missing` or `drift` findings
```

Per [`testing-react.md` § Definition of Done](https://github.com/nexuslabs-ai/nexus/blob/main/.claude/rules/testing-react.md#definition-of-done) — **Required** for Phase 1 component PRs. You can also invoke the `storybook-coverage-reviewer` subagent (registered under `.claude/agents/` and discoverable by name) — any prompt like _"audit {kebab} story coverage"_ shells out to the script and renders findings with paste-ready snippets."""


def fetch_body(n: int) -> str:
    res = subprocess.run(
        ["gh", "issue", "view", str(n), "--json", "body"],
        capture_output=True, text=True, check=True,
    )
    return json.loads(res.stdout)["body"]


def dod_anchor(kebab: str) -> str:
    """The issue-specific marker used to detect an existing DoD block."""
    return f"audit:storybook-coverage --component {kebab}"


def has_dod(body: str, kebab: str) -> bool:
    return dod_anchor(kebab) in body


def strip_existing_dod(body: str) -> str:
    """Remove the existing `## Definition of Done` section (heading + body up
    to the next H2 heading or the `Part of #161` footer, whichever comes first).
    """
    # Match from "## Definition of Done" through to the next `## ` heading or
    # the trailing "Part of #161..." footer. Non-greedy so it stops at the
    # first sibling section.
    pattern = re.compile(
        r"\n## Definition of Done\b.*?(?=\n## |\nPart of #161)",
        re.DOTALL,
    )
    return pattern.sub("", body, count=1)


def render(body: str, kebab: str) -> str:
    """Insert (or replace) the DoD section. Anchors before `Part of #161`."""
    dod = DOD_TEMPLATE.format(kebab=kebab)

    if has_dod(body, kebab):
        # Strip existing DoD first so the re-insert lands cleanly.
        body = strip_existing_dod(body)

    match = re.search(r"\n(Part of #161[^\n]*)", body)
    if match:
        return body[: match.start()] + f"\n{dod}\n" + body[match.start():]
    # Fallback: append at end if no footer anchor.
    return body.rstrip() + f"\n\n{dod}\n"


def write_issue(n: int, new_body: str, dry_run: bool):
    out = Path(f"/tmp/issue-{n}.md")
    out.write_text(new_body)
    if dry_run:
        print(f"#{n}: would write {len(new_body)} chars to {out}")
        return
    subprocess.run(
        ["gh", "issue", "edit", str(n), "--body-file", str(out)],
        check=True,
    )


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true", help="don't push to GitHub")
    ap.add_argument("--only", type=int, default=None, help="only this issue number")
    args = ap.parse_args()

    targets = {args.only: ISSUES[args.only]} if args.only else ISSUES

    for n, kebab in sorted(targets.items()):
        body = fetch_body(n)
        new_body = render(body, kebab)
        if new_body == body:
            print(f"#{n} ({kebab}): unchanged — skip")
            continue
        write_issue(n, new_body, args.dry_run)
        action = "would update" if args.dry_run else "updated"
        print(f"#{n} ({kebab}): {action}")


if __name__ == "__main__":
    sys.exit(main())
