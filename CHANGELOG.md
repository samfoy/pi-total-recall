# Changelog

## 1.9.0

GitHub `main` said 1.8.0 while npm had 1.8.1: the auto-update workflow published 1.8.1 and never
pushed it. 1.9.0 is built from `main` and supersedes both.

### Changed

- Bundles `@samfp/pi-memory` 1.6.0, `pi-session-search` 1.6.0 and `pi-knowledge-search` 1.3.7
  (1.8.1 bundled 1.3.5, 1.4.3 and 1.3.5).
- The `pi` manifest loads each component's built entry, `node_modules/<component>/dist/index.js`,
  as each component's own manifest does, instead of `src/index.ts`. Session search and knowledge search
  index on a worker (`dist/index-worker.js`, `dist/sync-worker.mjs`), which resolves inside the bundle.
- `engines.node` is `>=22.19.0`, pi's own floor and the components' (1.8.1 declared `>=24`).
  Node 22.19+ ships `node:sqlite` with FTS5.

### Fixed

- The bundle no longer carries `@aws-sdk` 3.750 with `fast-xml-parser` 4.4.1 (critical) and
  `uuid` 9.0.1 ([#9](https://github.com/samfoy/pi-total-recall/issues/9)). It now resolves
  `@aws-sdk/core` 3.978.1 and contains neither package. Measured on 2026-09-25 with npm 11.13,
  `npm audit --omit=dev` reports 23 vulnerable packages (1 critical, 22 moderate) on an install of
  `pi-total-recall@1.8.1`, and 3 moderate on an install of the 1.9.0 tarball. The issue counted 21
  moderate on 2026-08-16; the 22nd is `stream-json`, whose advisory was published on 2026-09-03.
  The 3 left are all that one advisory: `stream-json` 2.1.0 (GHSA-528h-pc64-c93x) in
  `pi-knowledge-search`, which uses only the parser and assembler, not the affected filters.
- Git installs no longer pull the components' pi peers. The old lockfile listed 167 auto-installed
  peer packages, including a whole `@mariozechner/pi-coding-agent` 0.73.1 tree, and the
  `npm install --omit=dev` behind `pi install git:github.com/samfoy/pi-total-recall` installed them.
  A repo `.npmrc` now sets `legacy-peer-deps`, as pi's own npm installs do. pi supplies these
  packages at runtime.
- Publishing works again. `.github/workflows/publish.yml` publishes through npm trusted publishing
  on a GitHub release. Its daily run bumps the bundled components and pushes a patch release's commit
  and tag; a separate job, the only one holding `id-token: write`, then publishes that tag. CI and
  publishing both pin npm `^11.5.1`. It replaces `auto-update-deps.yml`, whose npm token had stopped
  working.
- The tarball no longer ships `scripts/`. It holds `README.md`, `CHANGELOG.md`, `LICENSE`,
  `package.json` and the bundle.

### Added

- A test that every `pi` manifest path exists after `npm install` and covers every resource each
  component declares, and `npm run check:pack`, which checks the packed tarball for the same paths
  and for bundled pi peers or build tools. CI and both publish paths run them.
