/**
 * Every path in the `pi` manifest must exist after `npm install`, and must
 * match what each bundled component declares in its own `pi` manifest, so a
 * dependency refresh that moves a component's entry point fails here.
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

const PKG_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const readJson = (file: string) => JSON.parse(fs.readFileSync(file, "utf-8"));
const pkg = readJson(path.join(PKG_ROOT, "package.json"));
const manifest: Record<string, string[]> = pkg.pi ?? {};
const RESOURCE_KINDS = ["extensions", "skills", "prompts", "themes"];

describe("pi manifest", () => {
  const declared = RESOURCE_KINDS.flatMap((kind) => (manifest[kind] ?? []).map((p) => [kind, p]));

  it("declares at least one extension", () => {
    assert.ok((manifest.extensions ?? []).length > 0);
  });

  for (const [kind, rel] of declared) {
    it(`${kind}: ${rel} exists`, () => {
      assert.ok(fs.statSync(path.join(PKG_ROOT, rel)), `${rel} is missing`);
    });
  }

  for (const dep of pkg.bundleDependencies as string[]) {
    it(`covers every resource ${dep} declares`, () => {
      const depRoot = path.posix.join("node_modules", dep);
      const depManifest: Record<string, string[]> = readJson(path.join(PKG_ROOT, depRoot, "package.json")).pi ?? {};
      for (const kind of RESOURCE_KINDS) {
        for (const p of depManifest[kind] ?? []) {
          const expected = path.posix.join(depRoot, p);
          assert.ok((manifest[kind] ?? []).includes(expected), `pi.${kind} must include ${expected}`);
        }
      }
    });
  }
});
