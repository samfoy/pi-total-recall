// Pure helpers for the release scripts, split out so test/release-scripts.test.ts can cover them.

// `npm pack --json` prints an array under npm 11 and an object keyed by package name under npm 12.
export function packEntry(stdout, name) {
  const out = JSON.parse(stdout);
  const entry = Array.isArray(out) ? out.find((e) => e?.name === name) : out?.[name];
  if (!Array.isArray(entry?.files)) {
    throw new Error(`unrecognised \`npm pack --json\` output for ${name}: ${stdout.slice(0, 200)}`);
  }
  return entry;
}

// Adds a `## <version>` section holding one bullet above the newest entry, or at the end
// (after the title and any preamble) when there is no entry yet.
export function withChangelogEntry(log, version, line) {
  const entry = `## ${version}\n\n- ${line}\n`;
  const at = log.search(/^## /m);
  return at === -1 ? `${log.trimEnd()}\n\n${entry}` : `${log.slice(0, at)}${entry}\n${log.slice(at)}`;
}
