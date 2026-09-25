/**
 * The pure halves of the release scripts: check-pack's reading of `npm pack --json`,
 * and changelog-entry's placement of a new section. publish.yml runs both unattended.
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { packEntry, withChangelogEntry } from "../scripts/lib.mjs";

const entry = { name: "pi-total-recall", filename: "pi-total-recall-1.9.0.tgz", files: [{ path: "package.json" }], bundled: [] };

describe("packEntry", () => {
  it("reads npm 11's array", () => {
    assert.deepEqual(packEntry(JSON.stringify([entry]), "pi-total-recall"), entry);
  });

  it("reads npm 12's object keyed by package name", () => {
    assert.deepEqual(packEntry(JSON.stringify({ "pi-total-recall": entry }), "pi-total-recall"), entry);
  });

  for (const [label, out] of [
    ["an empty array", []],
    ["an array for another package", [{ ...entry, name: "other" }]],
    ["an object for another package", { other: entry }],
    ["an entry without files", { "pi-total-recall": { name: "pi-total-recall" } }],
    ["null", null],
  ] as const) {
    it(`throws on ${label}`, () => {
      assert.throws(() => packEntry(JSON.stringify(out), "pi-total-recall"), /unrecognised `npm pack --json` output/);
    });
  }
});

describe("withChangelogEntry", () => {
  it("inserts above the newest entry", () => {
    const log = "# Changelog\n\n## 1.9.0\n\n- Old.\n";
    assert.equal(withChangelogEntry(log, "1.9.1", "New."), "# Changelog\n\n## 1.9.1\n\n- New.\n\n## 1.9.0\n\n- Old.\n");
  });

  it("inserts after the title when there is no entry yet", () => {
    assert.equal(withChangelogEntry("# Changelog\n", "1.0.0", "First."), "# Changelog\n\n## 1.0.0\n\n- First.\n");
  });

  it("keeps a preamble between the title and the first entry", () => {
    const log = "# Changelog\n\nAll notable changes.\n";
    assert.equal(withChangelogEntry(log, "1.0.0", "First."), "# Changelog\n\nAll notable changes.\n\n## 1.0.0\n\n- First.\n");
  });

  it("does not treat a ### heading as an entry", () => {
    const log = "# Changelog\n\n## 1.9.0\n\n### Fixed\n\n- Old.\n";
    assert.equal(withChangelogEntry(log, "1.9.1", "New."), "# Changelog\n\n## 1.9.1\n\n- New.\n\n## 1.9.0\n\n### Fixed\n\n- Old.\n");
  });
});
