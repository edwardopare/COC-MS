import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";

config({ path: ".env" });

const sql = neon(process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL!);

async function clearDatabase() {
  console.log("⚠️ Clearing all data from the database...");

  const tables = [
    "notifications",
    "audit_logs",
    "documents",
    "system_settings",
    "budget_items",
    "budgets",
    "tithes",
    "offerings",
    "donations",
    "pledges",
    "pledge_payments",
    "expenses",
    "approvals",
    "attendance",
    "events",
    "member_cell_groups",
    "member_departments",
    "member_families",
    "members",
    "cell_groups",
    "departments",
    "ministries",
    "users",
    "roles",
    "branches",
    "church_profile"
  ];

  // Turn off constraints, truncate all tables, and turn constraints back on
  try {
    for (const table of tables) {
      console.log(`  Truncating table: ${table}...`);
      await sql.query(`TRUNCATE TABLE "${table}" RESTART IDENTITY CASCADE;`);
    }
    console.log("✅ Database cleared successfully!");
  } catch (error) {
    console.error("❌ Failed to clear database:", error);
    process.exit(1);
  }
}

clearDatabase();
