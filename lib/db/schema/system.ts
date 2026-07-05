import {
  pgTable,
  text,
  varchar,
  boolean,
  timestamp,
  uuid,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./core";

// ─────────────────────────────────────────────────────────
// Enums
// ─────────────────────────────────────────────────────────

export const notificationTypeEnum = pgEnum("notification_type", [
  "expense_submitted",
  "expense_approved",
  "expense_rejected",
  "pledge_reminder",
  "budget_alert",
  "system",
]);

export const documentCategoryEnum = pgEnum("document_category", [
  "member_form",
  "financial_receipt",
  "meeting_minutes",
  "church_policy",
  "expense_receipt",
  "other",
]);

// ─────────────────────────────────────────────────────────
// Documents
// ─────────────────────────────────────────────────────────

export const documents = pgTable("documents", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  category: documentCategoryEnum("category").notNull(),
  fileUrl: text("file_url").notNull(), // Vercel Blob URL
  fileType: varchar("file_type", { length: 20 }).notNull(), // pdf, jpg, png
  fileSizeBytes: varchar("file_size_bytes", { length: 20 }),
  relatedEntityType: varchar("related_entity_type", { length: 50 }), // member, expense, etc.
  relatedEntityId: uuid("related_entity_id"),
  uploadedByUserId: uuid("uploaded_by_user_id")
    .notNull()
    .references(() => users.id),
  isDeleted: boolean("is_deleted").notNull().default(false),
  deletedAt: timestamp("deleted_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ─────────────────────────────────────────────────────────
// Notifications
// ─────────────────────────────────────────────────────────

export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  type: notificationTypeEnum("type").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  relatedEntityType: varchar("related_entity_type", { length: 50 }),
  relatedEntityId: uuid("related_entity_id"),
  isRead: boolean("is_read").notNull().default(false),
  readAt: timestamp("read_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ─────────────────────────────────────────────────────────
// Audit Logs (immutable — append-only, never updated or deleted)
// ─────────────────────────────────────────────────────────

export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id), // null for system actions
  userEmail: varchar("user_email", { length: 255 }), // snapshot at time of action
  action: varchar("action", { length: 100 }).notNull(),
  tableAffected: varchar("table_affected", { length: 100 }),
  recordId: uuid("record_id"),
  oldValues: text("old_values"), // JSON snapshot before change
  newValues: text("new_values"), // JSON snapshot after change
  ipAddress: varchar("ip_address", { length: 50 }),
  userAgent: text("user_agent"),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

// ─────────────────────────────────────────────────────────
// System Settings
// ─────────────────────────────────────────────────────────

export const systemSettings = pgTable("system_settings", {
  id: uuid("id").primaryKey().defaultRandom(),
  key: varchar("key", { length: 100 }).notNull().unique(),
  value: text("value").notNull(),
  description: text("description"),
  updatedByUserId: uuid("updated_by_user_id").references(() => users.id),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ─────────────────────────────────────────────────────────
// Relations
// ─────────────────────────────────────────────────────────

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, { fields: [notifications.userId], references: [users.id] }),
}));

export const documentsRelations = relations(documents, ({ one }) => ({
  uploadedBy: one(users, { fields: [documents.uploadedByUserId], references: [users.id] }),
}));
