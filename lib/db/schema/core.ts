import { pgTable, text, varchar, boolean, timestamp, integer, decimal, uuid, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ─────────────────────────────────────────────────────────
// Enums
// ─────────────────────────────────────────────────────────

export const roleEnum = pgEnum("role_name", [
  "system_administrator",
  "admin_officer",
  "finance_officer",
]);

export const userStatusEnum = pgEnum("user_status", ["active", "suspended"]);

// ─────────────────────────────────────────────────────────
// Roles
// ─────────────────────────────────────────────────────────

export const roles = pgTable("roles", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: roleEnum("name").notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ─────────────────────────────────────────────────────────
// Users
// ─────────────────────────────────────────────────────────

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  roleId: uuid("role_id")
    .notNull()
    .references(() => roles.id),
  firstName: varchar("first_name", { length: 100 }).notNull(),
  lastName: varchar("last_name", { length: 100 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  status: userStatusEnum("status").notNull().default("active"),
  mustChangePassword: boolean("must_change_password").notNull().default(true),
  lastLoginAt: timestamp("last_login_at"),
  passwordResetToken: text("password_reset_token"),
  passwordResetExpiresAt: timestamp("password_reset_expires_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ─────────────────────────────────────────────────────────
// Church Profile
// ─────────────────────────────────────────────────────────

export const churchProfile = pgTable("church_profile", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 200 }).notNull(),
  address: text("address"),
  phone: varchar("phone", { length: 30 }),
  email: varchar("email", { length: 255 }),
  website: varchar("website", { length: 255 }),
  logoUrl: text("logo_url"),
  foundedYear: integer("founded_year"),
  denomination: varchar("denomination", { length: 100 }),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ─────────────────────────────────────────────────────────
// Branches
// ─────────────────────────────────────────────────────────

export const branches = pgTable("branches", {
  id: uuid("id").primaryKey().defaultRandom(),
  churchProfileId: uuid("church_profile_id")
    .notNull()
    .references(() => churchProfile.id),
  name: varchar("name", { length: 200 }).notNull(),
  address: text("address"),
  phone: varchar("phone", { length: 30 }),
  leadPastorName: varchar("lead_pastor_name", { length: 200 }),
  capacity: integer("capacity"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ─────────────────────────────────────────────────────────
// Relations
// ─────────────────────────────────────────────────────────

export const rolesRelations = relations(roles, ({ many }) => ({
  users: many(users),
}));

export const usersRelations = relations(users, ({ one }) => ({
  role: one(roles, { fields: [users.roleId], references: [roles.id] }),
}));

export const branchesRelations = relations(branches, ({ one }) => ({
  church: one(churchProfile, {
    fields: [branches.churchProfileId],
    references: [churchProfile.id],
  }),
}));
