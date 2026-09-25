/**
 * The pure halves of the release scripts: check-pack's reading of `npm pack --json`.
 * publish.yml runs it unattended.
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { packEntry } from "../scripts/lib.mjs";

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
