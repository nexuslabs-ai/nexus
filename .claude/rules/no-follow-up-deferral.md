# No Follow-Up Deferral

Every issue flagged by a PR review is fixed in the same PR.

## The Rule

Default: each finding goes in the current PR.

Exception: the finding maps to an **existing tracked issue or milestone** in GitHub that already owns the work. Cite the number (`#295`, `M11.6`, etc.) and confirm its scope covers the finding.

## What This Rules Out

- "Follow-up PR will handle this" without an issue number
- "Not blocking, monitor post-launch" / "flag for later rollout" — these are reviewer framing, not a license to skip. If the reviewer can describe a fix, it is in scope.
- Silent skipping of minor issues during a `pr-fix` pass
- New `// TODO:` comments that don't point at a tracked issue (see `code-comments.md`)

## For Reviewers (`pr-review` / `pr-review-follow-up`)

If a finding is worth the comment, it is worth a fix in this PR. Do not phrase findings as "defer" unless you can cite the follow-up's issue number.

## For Fixers (`pr-fix`)

- **Default:** every flagged issue is in scope.
- If a reviewer comment contains deferral framing ("not blocking", "follow-up", "post-launch monitor") but no issue number, ignore the framing — propose a fix.
- Only skip a fix if (a) the user explicitly approves skipping, or (b) the finding maps to an existing numbered issue.
- When presenting root cause analysis, do not include a "deferred" category. Every item is either a fix in this PR or cites an existing issue number.

## Terminology

"Follow-up review" (the `--follow-up` flag on `/pr-review`, and the `pr-review-follow-up` skill) means **re-reviewing the same PR after pushed changes** — not deferring issues to a new PR. That workflow is unaffected by this rule.
