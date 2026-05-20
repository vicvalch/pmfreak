import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const FORBIDDEN = ["@/lib/aoc/enterprise/runtime", "@/aoc/enterprise/runtime"];

function collectFiles(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    const s = statSync(p);
    if (s.isDirectory()) collectFiles(p, out);
    else if (/\.(ts|tsx)$/.test(entry)) out.push(p);
  }
  return out;
}

test("app layer does not import enterprise runtime internals directly", () => {
  const files = collectFiles("src/app");
  for (const file of files) {
    const src = readFileSync(file, "utf8");
    for (const forbidden of FORBIDDEN) {
      assert.equal(src.includes(forbidden), false, `${file} must not import ${forbidden}; use @/aoc/runtime-consumer`);
    }
  }
});
