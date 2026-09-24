#!/usr/bin/env node
// Asserts the packed tarball ships every pi manifest path and no host-supplied or build-only
// packages. The scheduled dependency refresh publishes unattended, so this gates every publish.
import { execFileSync } from "node:child_process";
import fs from "node:fs";

const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
const [pack] = JSON.parse(
  execFileSync("npm", ["pack", "--dry-run", "--json", "--ignore-scripts"], { encoding: "utf8" }),
);
const files = pack.files.map((f) => f.path);

// pi supplies these at runtime; tsx/esbuild are build tools that once leaked in as prod deps.
const BANNED = /(^|\/)node_modules\/(@earendil-works|@mariozechner|@sinclair|typebox|tsx|esbuild|@esbuild)(\/|$)/;
const problems = [
  ...Object.values(pkg.pi ?? {})
    .flat()
    .filter((p) => !files.some((f) => f === p || f.startsWith(`${p}/`)))
    .map((p) => `pi manifest path not in tarball: ${p}`),
  ...files.filter((f) => BANNED.test(f)).map((f) => `must not be bundled: ${f}`),
  ...files.filter((f) => /^(test|scripts|\.github)\//.test(f)).map((f) => `repo-only file packed: ${f}`),
];

console.log(`${pack.filename}: ${pack.entryCount} files, ${pack.unpackedSize} bytes unpacked, ${pack.bundled.length} bundled deps`);
if (problems.length) {
  console.error(problems.slice(0, 50).join("\n"));
  process.exit(1);
}
console.log("pack check passed");
