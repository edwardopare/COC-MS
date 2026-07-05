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
import { expenseCategories, expenses } from "./finance";
import { users } from "./core";

// ─────────────────────────────────────────────────────────
// Enums
// ─────────────────────────────────────────────────────────

export const budgetPeriodEnum = pgEnum("budget_period", ["monthly", "annual"]);
export const budgetStatusEnum = pgEnum("budget_status", [
  "draft",
  "active",
  "locked",
  "closed",
]);

// ─────────────────────────────────────────────────────────
// Budgets
// ─────────────────────────────────────────────────────────

export const budgets = pgTable("budgets", {
  id: uuid("id").primaryKey().defaultRandom(),
  branchId: uuid("branch_id")
    .notNull()
    .references(() => branches.id),
  name: varchar("name", { length: 200 }).notNull(),
  period: budgetPeriodEnum("period").notNull(),
  periodLabel: varchar("period_label", { length: 7 }).notNull(), // YYYY or YYYY-MM
  totalAmount: decimal("total_amount", { precision: 15, scale: 2 }).notNull(),
  status: budgetStatusEnum("status").notNull().default("draft"),
  lockedAt: timestamp("locked_at"),
  lockedByUserId: uuid("locked_by_user_id").references(() => users.id),
  createdByUserId: uuid("created_by_user_id")
    .notNull()
    .references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ─────────────────────────────────────────────────────────
// Budget Items (line items per expense category)
// ─────────────────────────────────────────────────────────

export const budgetItems = pgTable("budget_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  budgetId: uuid("budget_id")
    .notNull()
    .references(() => budgets.id),
  categoryId: uuid("category_id")
    .notNull()
    .references(() => expenseCategories.id),
  allocatedAmount: decimal("allocated_amount", { precision: 15, scale: 2 }).notNull(),
  actualAmount: decimal("actual_amount", { precision: 15, scale: 2 })
    .notNull()
    .default("0"), // auto-updated on expense approval
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ─────────────────────────────────────────────────────────
// Relations
// ─────────────────────────────────────────────────────────

export const budgetsRelations = relations(budgets, ({ one, many }) => ({
  branch: one(branches, { fields: [budgets.branchId], references: [branches.id] }),
  items: many(budgetItems),
  createdBy: one(users, { fields: [budgets.createdByUserId], references: [users.id] }),
}));

export const budgetItemsRelations = relations(budgetItems, ({ one }) => ({
  budget: one(budgets, { fields: [budgetItems.budgetId], references: [budgets.id] }),
  category: one(expenseCategories, {
    fields: [budgetItems.categoryId],
    references: [expenseCategories.id],
  }),
}));
