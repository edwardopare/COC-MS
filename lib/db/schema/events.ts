import {
  pgTable,
  text,
  varchar,
  boolean,
  timestamp,
  integer,
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
  eventId: uuid("event_id")
    .notNull()
    .references(() => events.id),
  branchId: uuid("branch_id")
    .notNull()
    .references(() => branches.id),
  memberId: uuid("member_id").references(() => members.id), // null = walk-in/headcount
  headcount: integer("headcount"), // used when not tracking individual members
  isPresent: boolean("is_present").default(true),
  recordedByUserId: uuid("recorded_by_user_id").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ─────────────────────────────────────────────────────────
// Relations
// ─────────────────────────────────────────────────────────

export const eventsRelations = relations(events, ({ one, many }) => ({
  branch: one(branches, { fields: [events.branchId], references: [branches.id] }),
  attendance: many(attendance),
}));

export const attendanceRelations = relations(attendance, ({ one }) => ({
  event: one(events, { fields: [attendance.eventId], references: [events.id] }),
  member: one(members, { fields: [attendance.memberId], references: [members.id] }),
}));
