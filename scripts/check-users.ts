import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { config } from "dotenv";
import * as schema from "../lib/db/schema";

config({ path: ".env" });

const sql = neon(process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

async function check() {
  console.log("Checking database users...");
  try {
    const list = await db.select().from(schema.users);
    console.log("Users in DB count:", list.length);
    list.forEach((u) => {
      console.log(`- Email: ${u.email}, RoleId: ${u.roleId}, Status: ${u.status}`);
    });
  } catch (e: any) {
    console.error("Error fetching users:", e.message);
  }
}

check();
