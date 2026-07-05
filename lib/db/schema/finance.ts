import {
  pgTable,
  text,
  varchar,
  boolean,
  timestamp,
  decimal,
  uuid,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { branches } from "./core";
import { members } from "./members";
import { users } from "./core";

// ─────────────────────────────────────────────────────────
// Enums
// ─────────────────────────────────────────────────────────

export const paymentMethodEnum = pgEnum("payment_method", [
  "cash",
  "bank_transfer",
  "cheque",
  "mobile_money",
  "online",
]);

export const expenseStatusEnum = pgEnum("expense_status", [
  "pending",
  "approved",
  "rejected",
  "paid",
  "cancelled",
]);

export const pledgeStatusEnum = pgEnum("pledge_status", [
  "active",
  "fulfilled",
  "overdue",
  "cancelled",
]);

// ─────────────────────────────────────────────────────────
// Income Categories
// ─────────────────────────────────────────────────────────

export const incomeCategories = pgTable("income_categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ─────────────────────────────────────────────────────────
// Expense Categories
// ─────────────────────────────────────────────────────────

export const expenseCategories = pgTable("expense_categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ─────────────────────────────────────────────────────────
// Bank Accounts
// ─────────────────────────────────────────────────────────

export const bankAccounts = pgTable("bank_accounts", {
  id: uuid("id").primaryKey().defaultRandom(),
  bankName: varchar("bank_name", { length: 200 }).notNull(),
  accountName: varchar("account_name", { length: 200 }).notNull(),
  accountNumber: varchar("account_number", { length: 50 }).notNull(),
  branchId: uuid("branch_id").references(() => branches.id),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ─────────────────────────────────────────────────────────
// Fund Accounts
// ─────────────────────────────────────────────────────────

export const fundAccounts = pgTable("fund_accounts", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description"),
  balance: decimal("balance", { precision: 15, scale: 2 }).notNull().default("0"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ─────────────────────────────────────────────────────────
// Tithes
// ─────────────────────────────────────────────────────────

export const tithes = pgTable("tithes", {
  id: uuid("id").primaryKey().defaultRandom(),
  memberId: uuid("member_id")
    .notNull()
    .references(() => members.id),
  branchId: uuid("branch_id")
    .notNull()
    .references(() => branches.id),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  paymentMethod: paymentMethodEnum("payment_method").notNull(),
  referenceNumber: varchar("reference_number", { length: 100 }),
  periodMonth: varchar("period_month", { length: 7 }).notNull(), // YYYY-MM
  receiptNumber: varchar("receipt_number", { length: 50 }),
  recordedByUserId: uuid("recorded_by_user_id")
    .notNull()
    .references(() => users.id),
  notes: text("notes"),
  isDeleted: boolean("is_deleted").notNull().default(false),
  deletedAt: timestamp("deleted_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ─────────────────────────────────────────────────────────
// Offerings
// ─────────────────────────────────────────────────────────

export const offerings = pgTable("offerings", {
  id: uuid("id").primaryKey().defaultRandom(),
  branchId: uuid("branch_id")
    .notNull()
    .references(() => branches.id),
  eventId: uuid("event_id"),
  categoryId: uuid("category_id").references(() => incomeCategories.id),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  paymentMethod: paymentMethodEnum("payment_method").notNull(),
  referenceNumber: varchar("reference_number", { length: 100 }),
  receiptNumber: varchar("receipt_number", { length: 50 }),
  recordedByUserId: uuid("recorded_by_user_id")
    .notNull()
    .references(() => users.id),
  notes: text("notes"),
  isDeleted: boolean("is_deleted").notNull().default(false),
  deletedAt: timestamp("deleted_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ─────────────────────────────────────────────────────────
// Donations
// ─────────────────────────────────────────────────────────

export const donations = pgTable("donations", {
  id: uuid("id").primaryKey().defaultRandom(),
  memberId: uuid("member_id").references(() => members.id),
  donorName: varchar("donor_name", { length: 200 }), // for non-members
  branchId: uuid("branch_id")
    .notNull()
    .references(() => branches.id),
  categoryId: uuid("category_id").references(() => incomeCategories.id),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  paymentMethod: paymentMethodEnum("payment_method").notNull(),
  referenceNumber: varchar("reference_number", { length: 100 }),
  purpose: text("purpose"),
  receiptNumber: varchar("receipt_number", { length: 50 }),
  recordedByUserId: uuid("recorded_by_user_id")
    .notNull()
    .references(() => users.id),
  isDeleted: boolean("is_deleted").notNull().default(false),
  deletedAt: timestamp("deleted_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ─────────────────────────────────────────────────────────
// Pledge Campaigns
// ─────────────────────────────────────────────────────────

export const pledgeCampaigns = pgTable("pledge_campaigns", {
  id: uuid("id").primaryKey().defaultRandom(),
  branchId: uuid("branch_id")
    .notNull()
    .references(() => branches.id),
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description"),
  targetAmount: decimal("target_amount", { precision: 15, scale: 2 }),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  isActive: boolean("is_active").notNull().default(true),
  createdByUserId: uuid("created_by_user_id")
    .notNull()
    .references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ─────────────────────────────────────────────────────────
// Pledges
// ─────────────────────────────────────────────────────────

export const pledges = pgTable("pledges", {
  id: uuid("id").primaryKey().defaultRandom(),
  campaignId: uuid("campaign_id")
    .notNull()
    .references(() => pledgeCampaigns.id),
  memberId: uuid("member_id")
    .notNull()
    .references(() => members.id),
  pledgedAmount: decimal("pledged_amount", { precision: 15, scale: 2 }).notNull(),
  paidAmount: decimal("paid_amount", { precision: 15, scale: 2 }).notNull().default("0"),
  dueDate: timestamp("due_date"),
  status: pledgeStatusEnum("status").notNull().default("active"),
  notes: text("notes"),
  recordedByUserId: uuid("recorded_by_user_id")
    .notNull()
    .references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ─────────────────────────────────────────────────────────
// Pledge Payments
// ─────────────────────────────────────────────────────────

export const pledgePayments = pgTable("pledge_payments", {
  id: uuid("id").primaryKey().defaultRandom(),
  pledgeId: uuid("pledge_id")
    .notNull()
    .references(() => pledges.id),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  paymentMethod: paymentMethodEnum("payment_method").notNull(),
  referenceNumber: varchar("reference_number", { length: 100 }),
  receiptNumber: varchar("receipt_number", { length: 50 }),
  recordedByUserId: uuid("recorded_by_user_id")
    .notNull()
    .references(() => users.id),
  isDeleted: boolean("is_deleted").notNull().default(false),
  deletedAt: timestamp("deleted_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ─────────────────────────────────────────────────────────
// Expenses
// ─────────────────────────────────────────────────────────

export const expenses = pgTable("expenses", {
  id: uuid("id").primaryKey().defaultRandom(),
  categoryId: uuid("category_id")
    .notNull()
    .references(() => expenseCategories.id),
  branchId: uuid("branch_id")
    .notNull()
    .references(() => branches.id),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  description: text("description").notNull(),
  documentUrl: text("document_url"),
  status: expenseStatusEnum("status").notNull().default("pending"),
  initiatedByUserId: uuid("initiated_by_user_id")
    .notNull()
    .references(() => users.id),
  approvedByUserId: uuid("approved_by_user_id").references(() => users.id),
  approvedAt: timestamp("approved_at"),
  approvalComments: text("approval_comments"),
  paymentMethod: paymentMethodEnum("payment_method"),
  paidAt: timestamp("paid_at"),
  periodMonth: varchar("period_month", { length: 7 }), // YYYY-MM for period locking
  isDeleted: boolean("is_deleted").notNull().default(false),
  deletedAt: timestamp("deleted_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ─────────────────────────────────────────────────────────
// Approvals (workflow audit trail per expense step)
// ─────────────────────────────────────────────────────────

export const approvals = pgTable("approvals", {
  id: uuid("id").primaryKey().defaultRandom(),
  expenseId: uuid("expense_id")
    .notNull()
    .references(() => expenses.id),
  reviewedByUserId: uuid("reviewed_by_user_id")
    .notNull()
    .references(() => users.id),
  action: varchar("action", { length: 20 }).notNull(), // approved | rejected
  comments: text("comments"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ─────────────────────────────────────────────────────────
// Relations
// ─────────────────────────────────────────────────────────

export const expensesRelations = relations(expenses, ({ one, many }) => ({
  category: one(expenseCategories, {
    fields: [expenses.categoryId],
    references: [expenseCategories.id],
  }),
  initiatedBy: one(users, {
    fields: [expenses.initiatedByUserId],
    references: [users.id],
  }),
  approvals: many(approvals),
}));

export const pledgesRelations = relations(pledges, ({ one, many }) => ({
  member: one(members, { fields: [pledges.memberId], references: [members.id] }),
  campaign: one(pledgeCampaigns, {
    fields: [pledges.campaignId],
    references: [pledgeCampaigns.id],
  }),
  payments: many(pledgePayments),
}));
