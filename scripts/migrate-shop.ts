import { loadEnvConfig } from "@next/env";
import { getDatabase, migrate } from "../app/lib/shop/database";

async function main() {
  loadEnvConfig(process.cwd());
  const db = await getDatabase();
  try { await migrate(db); console.log("Sift order database is ready. Existing orders and settings were preserved."); }
  finally { await db.close(); }
}
main().catch(() => { console.error("Database setup failed. Check DATABASE_URL and database connectivity."); process.exitCode = 1; });
