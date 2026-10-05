---
title: The wiki lint
type: system
pack: platform
season: all
files: [tools/wiki-lint.js, docs/wiki/coverage.json]
symbols: [lint, parse, REQUIRED]
concepts: []
sessions: []
tests: [tests/test-wiki-lint.js]
links: [platform/tests-and-ci, platform/version-stamp]
updated: 2026-10-05
---

## What it does
Checks every page of this wiki against the code. A page that names a missing file, function, test or link fails the PR.

## Where
| File · symbol | What |
|---|---|
| `tools/wiki-lint.js` · `parse` | Reads a page's front-matter (`key: value`, `key: [a, b]`). |
| `tools/wiki-lint.js` · `lint(root, opts)` | Runs every check and returns `{errors, warnings, pages}`; the command line prints them and exits 1 on any error. |
| `docs/wiki/coverage.json` | The source files each pack's pages must name. `strict: false` means an unnamed file is only a warning; W2 sets it to `true`. |

## Invariants
Errors: incomplete front-matter, bad `type` or `pack`, a missing `files` or `tests` path, a `symbols` name absent from the page's `files`, an unresolved link, a page with no links, a page missing from `INDEX.md`. `tests/test-wiki-lint.js` proves each one fails on a fixture wiki.

## How to change it safely
- A file moved? Update the page's `files`, then run `node tools/wiki-lint.js`. Symbols match as whole words, so rename the symbol in the page too.
- A new source file in a pack: add it to `coverage.json` and name it in a page's `files`.

## History
- W1 (`platform/wiki-lint`): first version, run in CI.
