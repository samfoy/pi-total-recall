#!/usr/bin/env node
// Usage: node scripts/changelog-entry.mjs "<line>"
// Adds a `## <package.json version>` section holding one bullet to CHANGELOG.md.
import fs from "node:fs";
import { withChangelogEntry } from "./lib.mjs";

const { version } = JSON.parse(fs.readFileSync("package.json", "utf8"));
fs.writeFileSync("CHANGELOG.md", withChangelogEntry(fs.readFileSync("CHANGELOG.md", "utf8"), version, process.argv[2]));
