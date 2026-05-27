import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join } from "node:path";

const eslintBin = join(process.cwd(), "node_modules", ".bin", "eslint");

if (!existsSync(eslintBin)) {
  console.warn("[lint] Local eslint is not installed in node_modules. Skipping lint step.");
  process.exit(0);
}

const result = spawnSync(eslintBin, { stdio: "inherit", shell: true });
process.exit(result.status ?? 1);
