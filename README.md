# pi-total-recall

Complete context stack for [pi](https://github.com/badlogic/pi-mono). One install gives your agent persistent memory, session history, and local knowledge search.

## What's included

| Layer | Package | What it does |
|-------|---------|-------------|
| **Memory** | [@samfp/pi-memory](https://github.com/samfoy/pi-memory) | Learns preferences, project patterns, and corrections. Injects relevant facts into every session. |
| **Session history** | [pi-session-search](https://github.com/samfoy/pi-session-search) | Indexes past coding sessions. Search by topic to find previous work, decisions, and debugging context. |
| **Knowledge base** | [pi-knowledge-search](https://github.com/samfoy/pi-knowledge-search) | Indexes local files (markdown, text, docs). Semantic search over your notes, documentation, and vault. |

Together, these give pi three layers of context about you:

- **What you prefer** — coding style, tool choices, project conventions (memory)
- **What you've done** — past sessions, debugging history, previous decisions (session search)
- **What you know** — notes, docs, research, reference material (knowledge search)

## Install

```bash
pi install npm:pi-total-recall
```

That's it. All three extensions are active immediately.

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

## Configuration

Each component has its own configuration in `~/.pi/agent/settings.json`. See the individual package READMEs for details:

### Memory

```json
{
  "memory": {
    "lessonInjection": "selective"
  }
}
```

### Knowledge Search

Point it at your notes directory:

```json
{
  "knowledge-search": {
    "paths": ["~/Documents/Notes"]
  }
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
pi install @samfp/pi-memory
pi install pi-session-search
pi install pi-knowledge-search
```

## License

MIT
