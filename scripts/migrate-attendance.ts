import "dotenv/config";
import { db } from "../lib/db";
import { sql } from "drizzle-orm";

async function main() {
  console.log("Dropping old attendance table...");
  try {
    await db.execute(sql`DROP TABLE IF EXISTS attendance CASCADE;`);
    console.log("Creating new attendance table...");
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "attendance" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "branch_id" uuid NOT NULL,
        "service_type" varchar(50) NOT NULL,
        "attendance_date" timestamp NOT NULL,
        "male_count" integer DEFAULT 0 NOT NULL,
        "female_count" integer DEFAULT 0 NOT NULL,
        "children_count" integer DEFAULT 0 NOT NULL,
        "visitors_count" integer DEFAULT 0 NOT NULL,
        "total_count" integer DEFAULT 0 NOT NULL,
        "notes" text,
        "recorded_by_user_id" uuid NOT NULL,
        "created_at" timestamp DEFAULT now() NOT NULL
      );
    `);
    console.log("Migration complete!");
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

main();
