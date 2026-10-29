import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const output = path.join(root, "dist");
const packages = [
  "perplexity-suite",
  "gabor-knowledge",
  "ptl-knowledge",
  "ai-tpm-knowledge",
];

const validation = spawnSync(process.execPath, ["scripts/validate.mjs"], {
  cwd: root,
  stdio: "inherit",
});
if (validation.status !== 0) process.exit(validation.status ?? 1);

fs.rmSync(output, { recursive: true, force: true });
fs.mkdirSync(output, { recursive: true });
for (const name of packages) {
  const result = spawnSync("zip", ["-q", "-r", path.join(output, `${name}.zip`), "."], {
    cwd: path.join(root, name),
    stdio: "inherit",
  });
  if (result.error?.code === "ENOENT") throw new Error("The zip command is required");
  if (result.status !== 0) throw new Error(`Failed to build ${name}`);
}
console.log(`Built ${packages.length} remote-only plugin archives in ${output}`);
