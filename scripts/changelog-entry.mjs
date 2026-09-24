#!/usr/bin/env node
// Usage: node scripts/changelog-entry.mjs "<line>"
// Inserts a `## <package.json version>` section holding one bullet above the newest entry.
import fs from "node:fs";

const { version } = JSON.parse(fs.readFileSync("package.json", "utf8"));
const log = fs.readFileSync("CHANGELOG.md", "utf8");
const at = log.indexOf("\n## ") + 1;
fs.writeFileSync("CHANGELOG.md", `${log.slice(0, at)}## ${version}\n\n- ${process.argv[2]}\n\n${log.slice(at)}`);
