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
