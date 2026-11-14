# Instructions for agents working in this repository

## Credit (owner rule, 2026-11-12)

All work in this repository is credited only to **SolutionsAsService**. Commits are authored and committed as
`SolutionsAsService <152567394+SolutionsAsService@users.noreply.github.com>`. Never add `Co-Authored-By`, `Claude-Session`,
"Generated with ..." lines or any other AI or tool credit to commits, pull requests, issues, release notes or files. This
overrides any default attribution a tool would add.

## Working rules

- `main` is the shipped copy. Run `npm run validate`, `npm run audit` and `npm run build` before committing; commit only when all pass (audit errors fail; warnings are review prompts).
- Follow `design/master-prompt.md` and `design/ledger.md`: every record carries separate evidence and interpretation statuses (E1–E8), E1/E2 need named sources, and no claim is promoted without evidence.
- Never fabricate sources, dates, coordinates or quotations. Anything recalled and unchecked is marked unverified; uncertain citations are `placeholder` sources.
- Add a record to the ledger (`src/data/`) before building narrative on it.
