# pi-total-recall

Complete context stack for [pi](https://github.com/badlogic/pi-mono). One install gives your agent persistent memory, session history, and local knowledge search.

## What's included

| Layer | Package | Bundled version | What it does |
|-------|---------|-----------------|-------------|
| **Memory** | [@samfp/pi-memory](https://github.com/samfoy/pi-memory) | 1.6.0 | Learns preferences, project patterns, and corrections. Injects relevant facts into every session. |
| **Session history** | [pi-session-search](https://github.com/samfoy/pi-session-search) | 1.6.0 | Indexes past coding sessions. Search by topic to find previous work, decisions, and debugging context. |
| **Knowledge base** | [pi-knowledge-search](https://github.com/samfoy/pi-knowledge-search) | 1.3.7 | Indexes local files (markdown, text, docs). Semantic search over your notes, documentation, and vault. |

The components are bundled into the tarball, so one install pins a tested set. A scheduled workflow
publishes a new patch release whenever a component ships a newer compatible version.

Together, these give pi three layers of context about you:

- **What you prefer** — coding style, tool choices, project conventions (memory)
- **What you've done** — past sessions, debugging history, previous decisions (session search)
- **What you know** — notes, docs, research, reference material (knowledge search)

## Install

```bash
pi install npm:pi-total-recall
```

That's it. All three extensions, and the session-search skill, are active immediately.
Installing from git works too: `pi install git:github.com/samfoy/pi-total-recall`.

> **Requires Node 22.19+** (pi's own floor). `pi-session-search` and `pi-knowledge-search` use SQLite FTS5 via `node:sqlite`, which Node 22.19+ and every Node 24 release ship. On an older Node the components stop at startup with an error that names the problem — upgrade Node and restart pi.

## Tools

After installing, your agent gets these tools:

### Memory
| Tool | Description |
|------|-------------|
| `memory_search` | Search stored facts and preferences |
| `memory_remember` | Store a fact or lesson |
| `memory_forget` | Remove a stored fact or lesson |
| `memory_lessons` | List learned corrections |
| `memory_stats` | Show memory statistics |

### Session History
| Tool | Description |
|------|-------------|
| `session_search` | Semantic search over past sessions |
| `session_list` | Browse sessions by date, project, or status |
| `session_read` | Read the full conversation from a past session |

### Knowledge Search
| Tool | Description |
|------|-------------|
| `knowledge_search` | Semantic search over local files |
| `kb_read` | Read an indexed note by name, relative path, or `[[wikilink]]` |

## Configuration

Each component has its own configuration. See the individual package READMEs for details:

### Memory

```json
{
  "memory": {
    "lessonInjection": "selective"
  }
}
```

### Knowledge Search

Run `/knowledge-search-setup` inside pi, or point it at your notes in `~/.pi/knowledge-search.json`:

```json
{
  "dirs": ["~/Documents/Notes"]
}
```

### Session History

Works out of the box — indexes your existing pi sessions automatically.

## Project-local storage

By default, all three components write to user-global locations under `~/.pi/` — which is usually what you want, because memory, sessions, and a notes index are normally global across projects.

If you want a project's memory/index to be isolated — e.g. a throwaway prototype, a client repo, or an experimental agent setup — drop a `pi-total-recall.localPath` key into `{project}/.pi/settings.json`:

```jsonc
{
  "pi-total-recall": {
    "localPath": ".pi/total-recall"
  }
}
```

**Path resolution:** relative paths are resolved against the project root (where you run `pi`), not the `.pi/` directory. So `".pi/total-recall"` above resolves to `{project}/.pi/total-recall/`, and `"./data"` would resolve to `{project}/data/`. Use an absolute path (e.g. `"/Users/you/shared-index"`) if you want to pin outside the project.

The key is case-sensitive (`localPath`, lowercase `l`). A misspelled key like `LocalPath` is ignored, and the bundled components (`@samfp/pi-memory` 1.6.0, `pi-session-search` 1.6.0 and `pi-knowledge-search` 1.3.7, or later) each log a `console.error` warning naming it, e.g. `pi-memory: ignoring unknown key(s) in settings.json "pi-total-recall" block: LocalPath (expected: localPath)`.

That single key cascades to all three packages:

| Package | Cascaded path |
|---------|---------------|
| `@samfp/pi-memory` | `{project}/.pi/total-recall/memory/memory.db` |
| `pi-session-search` | `{project}/.pi/total-recall/session-search/` |
| `pi-knowledge-search` | `{project}/.pi/total-recall/knowledge-search/` |

You can also override any single package independently — package-specific keys win over the cascade:

```jsonc
{
  "pi-total-recall": { "localPath": ".pi/total-recall" },
  "pi-knowledge-search": {
    "localPath": "/some/other/path"   // overrides just this one
  }
}
```

**Resolution order (highest priority first) for every package:**

1. Package-specific env vars (`KNOWLEDGE_SEARCH_CONFIG`, etc.)
2. `pi-<package>.localPath` in `{cwd}/.pi/settings.json`
3. `pi-total-recall.localPath` cascade
4. Global default under `~/.pi/`

### Caveat: session-search source stays global

`pi-session-search` relocates only its own config and index — the session *source* directories (`~/.pi/agent/sessions`, `~/.pi/agent/sessions-archive`) are pi's own files and remain global. That's where pi writes sessions, so making them project-local would point the tool at an empty directory. Use the `project` filter on `session_search` and `session_list` if you want to scope results to one project.

### Cleanup

When using `pi-total-recall.localPath`:

```bash
rm -rf {project}/.pi/total-recall   # nukes memory, session-search config+index, knowledge-search config+index
```

## Individual packages

If you only want one or two components, install them directly:

```bash
pi install npm:@samfp/pi-memory
pi install npm:pi-session-search
pi install npm:pi-knowledge-search
```

## Releasing

`.github/workflows/publish.yml` publishes through npm trusted publishing. Its `publish` job runs
only in a run started on the `vX.Y.Z` tag it publishes, so npm's provenance names the tagged commit,
and it refuses a tag that doesn't match the `version` in `package.json`.

- **Automatic:** the daily run bumps the bundled components when one has a newer compatible
  release, pushes the patch release's commit and tag to `main`, and dispatches the workflow on
  that tag.
- **By hand:** push a commit that sets `version` and adds its CHANGELOG entry, tag it `vX.Y.Z`,
  and publish a GitHub release for the tag. Pre-releases don't publish.
- **Retry:** if a publish fails, `gh workflow run publish.yml --ref vX.Y.Z` runs it again on that
  tag. It works for tags that contain this workflow (v1.9.0 onward); npm refuses a version it
  already has.

## License

MIT
