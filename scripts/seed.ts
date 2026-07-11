import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { config } from "dotenv";
import bcrypt from "bcryptjs";
import * as schema from "../lib/db/schema";

config({ path: ".env" });

const sql = neon(process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

async function seed() {
  console.log("🌱 Seeding database...");

  // ── Roles ──────────────────────────────────────────────
  console.log("  Creating roles...");
  const [sysAdminRole, adminOfficerRole, financeOfficerRole] = await db
    .insert(schema.roles)
    .values([
      { name: "system_administrator", description: "Full system access and configuration" },
      { name: "admin_officer", description: "Member and attendance management" },
      { name: "finance_officer", description: "Financial records and budget management" },
    ])
    .onConflictDoNothing()
    .returning();

  // ── Church Profile ─────────────────────────────────────
  console.log("  Creating church profile...");
  const [church] = await db
    .insert(schema.churchProfile)
    .values({
      name: "My Church",
      address: "123 Church Street",
      phone: "+1234567890",
      email: "info@mychurch.org",
    })
    .onConflictDoNothing()
    .returning();

  // ── Default Branch ─────────────────────────────────────
  console.log("  Creating main branch...");
  const [mainBranch] = await db
    .insert(schema.branches)
    .values({
      churchProfileId: church.id,
      name: "Main Branch",
      address: "123 Church Street",
      capacity: 500,
    })
    .onConflictDoNothing()
    .returning();

  // ── Default System Admin ───────────────────────────────
  console.log("  Creating default system administrator...");
  const tempPassword = "Admin@1234!";
  const passwordHash = await bcrypt.hash(tempPassword, 12);

  await db
    .insert(schema.users)
    .values({
      roleId: sysAdminRole?.id ?? (await getRole(db, "system_administrator")),
      firstName: "System",
      lastName: "Administrator",
      email: "admin@mychurch.org",
      passwordHash,
      mustChangePassword: true,
      status: "active",
    })
    .onConflictDoNothing();

  // ── Default Income Categories ──────────────────────────
  console.log("  Creating income categories...");
  await db
    .insert(schema.incomeCategories)
    .values([
      { name: "General Offering", description: "Weekly general offerings" },
      { name: "Special Offering", description: "Special occasion offerings" },
      { name: "Project Fund", description: "Church project contributions" },
      { name: "Welfare Fund", description: "Member welfare contributions" },
    ])
    .onConflictDoNothing();

  // ── Default Expense Categories ─────────────────────────
  console.log("  Creating expense categories...");
  await db
    .insert(schema.expenseCategories)
    .values([
      { name: "Utilities", description: "Electricity, water, internet" },
      { name: "Maintenance", description: "Building and equipment repairs" },
      { name: "Salaries", description: "Staff remuneration" },
      { name: "Outreach", description: "Evangelism and community programs" },
      { name: "Office Supplies", description: "Stationery and consumables" },
      { name: "Events", description: "Program and event expenses" },
    ])
    .onConflictDoNothing();

  // ── System Settings ────────────────────────────────────
  console.log("  Creating system settings...");
  await db
    .insert(schema.systemSettings)
    .values([
      { key: "budget_alert_threshold", value: "0.8", description: "Budget alert at this % usage (0.0–1.0)" },
      { key: "financial_year_start", value: "01", description: "Month financial year starts (01-12)" },
      { key: "member_id_prefix", value: "CHU", description: "Prefix for generated member IDs" },
      { key: "last_member_sequence", value: "0", description: "Last used member ID sequence number" },
      { key: "locked_periods", value: "[]", description: "JSON array of locked YYYY-MM periods" },
    ])
    .onConflictDoNothing();

  console.log("✅ Seed complete!");
  console.log("");
  console.log("  Default admin credentials:");
  console.log("  Email:    admin@mychurch.org");
  console.log("  Password: Admin@1234!");
  console.log("  ⚠️  Change this password immediately after first login.");
}

async function getRole(db: ReturnType<typeof drizzle>, name: string): Promise<string> {
  const { eq } = await import("drizzle-orm");
  const [role] = await db
    .select({ id: schema.roles.id })
    .from(schema.roles)
    .where(eq(schema.roles.name, name as "system_administrator"))
    .limit(1);
  return role.id;
}

seed().catch((e) => {
  console.error("❌ Seed failed:", e);
  process.exit(1);
});
