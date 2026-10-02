import { randomBytes, scryptSync } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const file = path.join(root, ".env.local");
const existing = existsSync(file) ? readFileSync(file, "utf8") : "";
const has = key => new RegExp(`^${key}=`, "m").test(existing);
const additions = [];
const add = (key, value) => { if (!has(key)) additions.push(`${key}=${value}`); };
const production = process.argv.includes("--production");
if (!production) {
  add("ORDER_DATABASE_MODE", "local");
  add("PUBLIC_SITE_URL", "http://localhost:3100");
}
add("SIFT_SESSION_SECRET", randomBytes(48).toString("hex"));
add("CRON_SECRET", randomBytes(32).toString("hex"));
if (!has("SIFT_ADMIN_PASSWORD_HASH")) {
  const password = randomBytes(20).toString("base64url");
  const salt = randomBytes(16).toString("hex");
  add("SIFT_ADMIN_PASSWORD_HASH", `${salt}:${scryptSync(password, salt, 64).toString("hex")}`);
  mkdirSync(path.join(root, ".data"), { recursive: true });
  writeFileSync(path.join(root, ".data", "admin-access.txt"), `Sift owner dashboard: /matchadays/admin\nPassword: ${password}\n\nKeep this file private. It is excluded from Git.\nRotate by replacing SIFT_ADMIN_PASSWORD_HASH with a new generated hash.\n`, { mode: 0o600 });
}
if (additions.length) writeFileSync(file, `${existing.trimEnd()}\n${additions.join("\n")}\n`, { mode: 0o600 });
console.log("Shop access configured. Owner password is in .data/admin-access.txt (when newly generated). Existing settings preserved.");
const site = readFileSync(file, "utf8").match(/^PUBLIC_SITE_URL=(.+)$/m)?.[1]?.trim() || "http://localhost:3100";
console.log(production ? "Set DATABASE_URL and PUBLIC_SITE_URL for production, then run npm run shop:migrate." : `Run npm run dev -- --port ${new URL(site).port || "3100"}, then open ${site}/matchadays/admin. Checkout starts closed.`);
