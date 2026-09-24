#!/usr/bin/env node
// Prints `specs=<pkg@^version ...>` (GITHUB_OUTPUT format) for each bundled component whose
// latest npm release is newer than the locked one. New majors are reported, never auto-bumped,
// because a major can move the entry paths the pi manifest points at.
import { execFileSync } from "node:child_process";
import fs from "node:fs";

const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
const lock = JSON.parse(fs.readFileSync("package-lock.json", "utf8"));
const parse = (v) => v.split(/[.+-]/).slice(0, 3).map(Number);
const isNewer = (a, b) => {
  const [x, y] = [parse(a), parse(b)];
  const i = x.findIndex((n, k) => n !== y[k]);
  return i !== -1 && x[i] > y[i];
};

const specs = [];
for (const dep of pkg.bundleDependencies) {
  const locked = lock.packages[`node_modules/${dep}`].version;
  const latest = execFileSync("npm", ["view", dep, "version"], { encoding: "utf8" }).trim();
  if (!isNewer(latest, locked)) {
    console.error(`${dep}: ${locked} is current`);
  } else if (parse(latest)[0] !== parse(locked)[0]) {
    console.error(`::warning::${dep} ${latest} is a new major (locked ${locked}); bump it by hand`);
  } else {
    console.error(`${dep}: ${locked} -> ${latest}`);
    specs.push(`${dep}@^${latest}`);
  }
}
console.log(`specs=${specs.join(" ")}`);
