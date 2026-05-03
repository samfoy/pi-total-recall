/**
 * End-to-end integration test for pi-total-recall.localPath cascade.
 *
 * Simulates a user project with .pi/settings.json containing
 * "pi-total-recall".localPath and verifies all three bundled packages
 * (pi-memory, pi-session-search, pi-knowledge-search) resolve their
 * storage paths under the cascaded base directory.
 *
 * Run from pi-total-recall repo root:
 *   node --import tsx test/cascade-integration.test.ts
 */
import { describe, it, before, after, beforeEach } from "node:test";
import assert from "node:assert/strict";
import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Resolve modules from the bundled sub-packages so we test exactly
// what ships with this package.
const PKG_ROOT = path.resolve(__dirname, "..");
const MEMORY_MOD = path.join(PKG_ROOT, "node_modules/@samfp/pi-memory/src/index.ts");
const SESSION_MOD = path.join(PKG_ROOT, "node_modules/pi-session-search/src/config.ts");
const KNOWLEDGE_MOD = path.join(PKG_ROOT, "node_modules/pi-knowledge-search/src/config.ts");

let resolveDbPath: (cwd: string) => string;
let ksGetConfigPath: (cwd?: string) => string;
let ksGetIndexDir: (cwd?: string) => string;
let ssGetConfigPath: (cwd?: string) => string;
let ssGetIndexDir: (cwd?: string) => string;

let tmpProject: string;
let tmpBase: string;

function writeProjectSettings(obj: Record<string, unknown>): void {
  const dir = path.join(tmpProject, ".pi");
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "settings.json"), JSON.stringify(obj), "utf-8");
}

describe("pi-total-recall cascade integration", () => {
  before(async () => {
    // Confirm the bundled sub-packages are present and exporting the right symbols.
    assert.ok(fs.existsSync(MEMORY_MOD), `pi-memory source not bundled: ${MEMORY_MOD}`);
    assert.ok(fs.existsSync(SESSION_MOD), `pi-session-search source not bundled: ${SESSION_MOD}`);
    assert.ok(fs.existsSync(KNOWLEDGE_MOD), `pi-knowledge-search source not bundled: ${KNOWLEDGE_MOD}`);

    const memMod: any = await import(MEMORY_MOD);
    resolveDbPath = memMod.resolveDbPath;
    assert.equal(typeof resolveDbPath, "function", "pi-memory must export resolveDbPath");

    const ssMod: any = await import(SESSION_MOD);
    ssGetConfigPath = ssMod.getConfigPath;
    ssGetIndexDir = ssMod.getIndexDir;
    assert.equal(typeof ssGetConfigPath, "function", "pi-session-search must export getConfigPath");
    assert.equal(typeof ssGetIndexDir, "function", "pi-session-search must export getIndexDir");

    const ksMod: any = await import(KNOWLEDGE_MOD);
    ksGetConfigPath = ksMod.getConfigPath;
    ksGetIndexDir = ksMod.getIndexDir;
    assert.equal(typeof ksGetConfigPath, "function", "pi-knowledge-search must export getConfigPath");
    assert.equal(typeof ksGetIndexDir, "function", "pi-knowledge-search must export getIndexDir");

    tmpProject = fs.mkdtempSync(path.join(os.tmpdir(), "tr-proj-"));
    tmpBase = fs.mkdtempSync(path.join(os.tmpdir(), "tr-base-"));
  });

  beforeEach(() => {
    try {
      fs.rmSync(path.join(tmpProject, ".pi"), { recursive: true, force: true });
    } catch {}
    // Reset env that could interfere.
    delete process.env.KNOWLEDGE_SEARCH_CONFIG;
    delete process.env.KNOWLEDGE_SEARCH_INDEX_DIR;
  });

  after(() => {
    fs.rmSync(tmpProject, { recursive: true, force: true });
    fs.rmSync(tmpBase, { recursive: true, force: true });
  });

  it("all three packages cascade under pi-total-recall.localPath", () => {
    writeProjectSettings({ "pi-total-recall": { localPath: tmpBase } });

    assert.equal(
      resolveDbPath(tmpProject),
      path.join(tmpBase, "memory", "memory.db"),
      "pi-memory should cascade to {base}/memory/memory.db"
    );

    assert.equal(
      ssGetConfigPath(tmpProject),
      path.join(tmpBase, "session-search", "config.json"),
      "pi-session-search config should cascade to {base}/session-search/config.json"
    );
    assert.equal(
      ssGetIndexDir(tmpProject),
      path.join(tmpBase, "session-search", "index"),
      "pi-session-search index should cascade to {base}/session-search/index"
    );

    assert.equal(
      ksGetConfigPath(tmpProject),
      path.join(tmpBase, "knowledge-search", "config.json"),
      "pi-knowledge-search config should cascade to {base}/knowledge-search/config.json"
    );
    assert.equal(
      ksGetIndexDir(tmpProject),
      path.join(tmpBase, "knowledge-search", "index"),
      "pi-knowledge-search index should cascade to {base}/knowledge-search/index"
    );
  });

  it("package-specific localPath overrides the cascade on each package independently", () => {
    const memOverride = fs.mkdtempSync(path.join(os.tmpdir(), "tr-mem-"));
    const ksOverride = fs.mkdtempSync(path.join(os.tmpdir(), "tr-ks-"));
    try {
      writeProjectSettings({
        "pi-total-recall": { localPath: tmpBase },
        "pi-memory": { localPath: memOverride },
        "pi-knowledge-search": { localPath: ksOverride },
        // Deliberately no pi-session-search override — should still cascade.
      });

      assert.equal(resolveDbPath(tmpProject), path.join(memOverride, "memory.db"));
      assert.equal(ksGetConfigPath(tmpProject), path.join(ksOverride, "config.json"));
      assert.equal(
        ssGetConfigPath(tmpProject),
        path.join(tmpBase, "session-search", "config.json"),
        "pi-session-search without its own override should still cascade"
      );
    } finally {
      fs.rmSync(memOverride, { recursive: true, force: true });
      fs.rmSync(ksOverride, { recursive: true, force: true });
    }
  });

  it("without any settings, each package falls back to its global default", () => {
    // No settings.json at all.
    const home = process.env.HOME || os.homedir();

    assert.equal(
      resolveDbPath(tmpProject),
      path.join(home, ".pi", "memory", "memory.db")
    );
    assert.equal(
      ssGetConfigPath(tmpProject),
      path.join(home, ".pi", "session-search", "config.json")
    );
    assert.equal(
      ksGetConfigPath(tmpProject),
      path.join(home, ".pi", "knowledge-search.json")
    );
  });

  it("malformed settings.json doesn't throw — all packages fall back", () => {
    fs.mkdirSync(path.join(tmpProject, ".pi"), { recursive: true });
    fs.writeFileSync(path.join(tmpProject, ".pi", "settings.json"), "{ bad json ]", "utf-8");

    const home = process.env.HOME || os.homedir();

    // Should NOT throw and should return global defaults.
    assert.equal(
      resolveDbPath(tmpProject),
      path.join(home, ".pi", "memory", "memory.db")
    );
    assert.equal(
      ssGetConfigPath(tmpProject),
      path.join(home, ".pi", "session-search", "config.json")
    );
    assert.equal(
      ksGetConfigPath(tmpProject),
      path.join(home, ".pi", "knowledge-search.json")
    );
  });
});
