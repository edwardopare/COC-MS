import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { config } from "dotenv";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import * as schema from "../lib/db/schema";

config({ path: ".env" });

const sql = neon(process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

async function reset() {
  const email = "admin@mychurch.org";
  const newPassword = "Admin@1234!";
  console.log(`Resetting password for ${email} to: ${newPassword}`);

  try {
    const passwordHash = await bcrypt.hash(newPassword, 12);
    const result = await db
      .update(schema.users)
      .set({ passwordHash, mustChangePassword: true, status: "active" })
      .where(eq(schema.users.email, email))
      .returning();

    if (result.length > 0) {
      console.log("✅ Admin password reset successfully!");
    } else {
      console.log("❌ Admin user not found.");
    }
  } catch (e: any) {
    console.error("❌ Reset failed:", e.message);
  }
}

reset();
