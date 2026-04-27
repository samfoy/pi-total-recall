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

## Individual packages

If you only want one or two components, install them directly:

```bash
pi install @samfp/pi-memory
pi install pi-session-search
pi install pi-knowledge-search
```

## License

MIT
