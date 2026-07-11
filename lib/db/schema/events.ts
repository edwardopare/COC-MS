import {
  pgTable,
  text,
  varchar,
  boolean,
  timestamp,
  integer,
  decimal,
  uuid,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { branches } from "./core";
import { members } from "./members";

// ─────────────────────────────────────────────────────────
// Enums
// ─────────────────────────────────────────────────────────

export const eventTypeEnum = pgEnum("event_type", [
  "sunday_service",
  "midweek_service",
  "department_meeting",
  "special_program",
  "outreach",
  "other",
]);

// ─────────────────────────────────────────────────────────
// Events
// ─────────────────────────────────────────────────────────

export const events = pgTable("events", {
  id: uuid("id").primaryKey().defaultRandom(),
  branchId: uuid("branch_id")
    .notNull()
    .references(() => branches.id),
  name: varchar("name", { length: 200 }).notNull(),
  eventType: eventTypeEnum("event_type").notNull(),
  description: text("description"),
  eventDate: timestamp("event_date").notNull(),
  endDate: timestamp("end_date"),
  location: text("location"),
  organizerMemberId: uuid("organizer_member_id").references(() => members.id),
  expectedAttendance: integer("expected_attendance"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ─────────────────────────────────────────────────────────
// Attendance
// ─────────────────────────────────────────────────────────

export const attendance = pgTable("attendance", {
  id: uuid("id").primaryKey().defaultRandom(),
  branchId: uuid("branch_id")
    .notNull()
    .references(() => branches.id),
  serviceType: varchar("service_type", { length: 50 }).notNull(),
  attendanceDate: timestamp("attendance_date").notNull(),
  maleCount: integer("male_count").notNull().default(0),
  femaleCount: integer("female_count").notNull().default(0),
  childrenCount: integer("children_count").notNull().default(0),
  visitorsCount: integer("visitors_count").notNull().default(0),
  totalCount: integer("total_count").notNull().default(0),
  offertoryAmount: decimal("offertory_amount", { precision: 15, scale: 2 }).notNull().default("0"),
  notes: text("notes"),
  recordedByUserId: uuid("recorded_by_user_id").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ─────────────────────────────────────────────────────────
// Relations
// ─────────────────────────────────────────────────────────

export const eventsRelations = relations(events, ({ one }) => ({
  branch: one(branches, { fields: [events.branchId], references: [branches.id] }),
}));

export const attendanceRelations = relations(attendance, ({ one }) => ({
  // No strict relations here in MVP as we removed memberId/eventId linkage
}));
