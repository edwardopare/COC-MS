import {
  pgTable,
  text,
  varchar,
  boolean,
  timestamp,
  date,
  uuid,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { branches } from "./core";

// ─────────────────────────────────────────────────────────
// Enums
// ─────────────────────────────────────────────────────────

export const genderEnum = pgEnum("gender", ["male", "female"]);
export const maritalStatusEnum = pgEnum("marital_status", [
  "single",
  "married",
  "widowed",
  "divorced",
]);
export const memberStatusEnum = pgEnum("member_status", [
  "active",
  "inactive",
  "transferred",
  "deceased",
]);

// ─────────────────────────────────────────────────────────
// Departments
// ─────────────────────────────────────────────────────────

export const departments = pgTable("departments", {
  id: uuid("id").primaryKey().defaultRandom(),
  branchId: uuid("branch_id")
    .notNull()
    .references(() => branches.id),
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description"),
  leaderMemberId: uuid("leader_member_id"), // FK added after members table
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ─────────────────────────────────────────────────────────
// Ministries
// ─────────────────────────────────────────────────────────

export const ministries = pgTable("ministries", {
  id: uuid("id").primaryKey().defaultRandom(),
  branchId: uuid("branch_id")
    .notNull()
    .references(() => branches.id),
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ─────────────────────────────────────────────────────────
// Cell Groups
// ─────────────────────────────────────────────────────────

export const cellGroups = pgTable("cell_groups", {
  id: uuid("id").primaryKey().defaultRandom(),
  branchId: uuid("branch_id")
    .notNull()
    .references(() => branches.id),
  name: varchar("name", { length: 200 }).notNull(),
  meetingDay: varchar("meeting_day", { length: 20 }),
  meetingTime: varchar("meeting_time", { length: 20 }),
  meetingLocation: text("meeting_location"),
  leaderMemberId: uuid("leader_member_id"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ─────────────────────────────────────────────────────────
// Members
// ─────────────────────────────────────────────────────────

export const members = pgTable("members", {
  id: uuid("id").primaryKey().defaultRandom(),
  memberId: varchar("member_id", { length: 30 }).notNull().unique(), // CHU-2026-00001
  branchId: uuid("branch_id")
    .notNull()
    .references(() => branches.id),
  firstName: varchar("first_name", { length: 100 }).notNull(),
  middleName: varchar("middle_name", { length: 100 }),
  lastName: varchar("last_name", { length: 100 }).notNull(),
  gender: genderEnum("gender"),
  dateOfBirth: date("date_of_birth"),
  maritalStatus: maritalStatusEnum("marital_status"),
  phone: varchar("phone", { length: 30 }).notNull(),
  email: varchar("email", { length: 255 }),
  address: text("address"),
  occupation: varchar("occupation", { length: 150 }),
  isBaptized: boolean("is_baptized").notNull().default(false),
  baptismDate: date("baptism_date"),
  memberStatus: memberStatusEnum("member_status").notNull().default("active"),
  joinDate: date("join_date"),
  emergencyContactName: varchar("emergency_contact_name", { length: 200 }),
  emergencyContactPhone: varchar("emergency_contact_phone", { length: 30 }),
  photoUrl: text("photo_url"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ─────────────────────────────────────────────────────────
// Member Families
// ─────────────────────────────────────────────────────────

export const memberFamilies = pgTable("member_families", {
  id: uuid("id").primaryKey().defaultRandom(),
  memberId: uuid("member_id")
    .notNull()
    .references(() => members.id),
  relatedMemberId: uuid("related_member_id")
    .notNull()
    .references(() => members.id),
  relationship: varchar("relationship", { length: 50 }).notNull(), // e.g. spouse, child, parent
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ─────────────────────────────────────────────────────────
// Member ↔ Department (join table)
// ─────────────────────────────────────────────────────────

export const memberDepartments = pgTable("member_departments", {
  id: uuid("id").primaryKey().defaultRandom(),
  memberId: uuid("member_id")
    .notNull()
    .references(() => members.id),
  departmentId: uuid("department_id")
    .notNull()
    .references(() => departments.id),
  role: varchar("role", { length: 100 }),
  joinedAt: timestamp("joined_at").notNull().defaultNow(),
});

// ─────────────────────────────────────────────────────────
// Member ↔ Cell Group (join table)
// ─────────────────────────────────────────────────────────

export const memberCellGroups = pgTable("member_cell_groups", {
  id: uuid("id").primaryKey().defaultRandom(),
  memberId: uuid("member_id")
    .notNull()
    .references(() => members.id),
  cellGroupId: uuid("cell_group_id")
    .notNull()
    .references(() => cellGroups.id),
  joinedAt: timestamp("joined_at").notNull().defaultNow(),
});

// ─────────────────────────────────────────────────────────
// Relations
// ─────────────────────────────────────────────────────────

export const membersRelations = relations(members, ({ one, many }) => ({
  branch: one(branches, { fields: [members.branchId], references: [branches.id] }),
  families: many(memberFamilies),
  departments: many(memberDepartments),
  cellGroups: many(memberCellGroups),
}));

export const memberFamiliesRelations = relations(memberFamilies, ({ one }) => ({
  member: one(members, { fields: [memberFamilies.memberId], references: [members.id] }),
  relatedMember: one(members, {
    fields: [memberFamilies.relatedMemberId],
    references: [members.id],
  }),
}));
