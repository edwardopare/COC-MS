import "dotenv/config";
import { db } from "../lib/db";
import { sql } from "drizzle-orm";

async function main() {
  try {
    await db.execute(sql`ALTER TABLE attendance ADD COLUMN IF NOT EXISTS offertory_amount numeric(15,2) DEFAULT '0' NOT NULL;`);
    console.log("Migration complete: added offertory_amount to attendance.");
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

main();
