import { z } from "zod";

// ─────────────────────────────────────────────────────────
// Auth
// ─────────────────────────────────────────────────────────

export const loginSchema = z
  .object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
  })
  .strict();

export const forgotPasswordSchema = z
  .object({
    email: z.string().email("Invalid email address"),
  })
  .strict();

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/[0-9]/, "Must contain at least one number"),
    confirmPassword: z.string(),
  })
  .strict()
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// ─────────────────────────────────────────────────────────
// Users
// ─────────────────────────────────────────────────────────

export const createUserSchema = z
  .object({
    firstName: z.string().min(1).max(100),
    lastName: z.string().min(1).max(100),
    email: z.string().email(),
    roleId: z.string().uuid("Invalid role ID"),
  })
  .strict();

export const updateUserSchema = z
  .object({
    firstName: z.string().min(1).max(100).optional(),
    lastName: z.string().min(1).max(100).optional(),
    roleId: z.string().uuid().optional(),
  })
  .strict();

// ─────────────────────────────────────────────────────────
// Members
// ─────────────────────────────────────────────────────────

export const createMemberSchema = z
  .object({
    branchId: z.string().uuid(),
    firstName: z.string().min(1).max(100),
    middleName: z.string().max(100).optional(),
    lastName: z.string().min(1).max(100),
    gender: z.enum(["male", "female"]).optional(),
    dateOfBirth: z.string().date().optional(),
    maritalStatus: z.enum(["single", "married", "widowed", "divorced"]).optional(),
    phone: z.string().min(7).max(30),
    email: z.string().email().optional(),
    address: z.string().max(500).optional(),
    occupation: z.string().max(150).optional(),
    isBaptized: z.boolean().default(false),
    baptismDate: z.string().date().optional(),
    joinDate: z.string().date().optional(),
    emergencyContactName: z.string().max(200).optional(),
    emergencyContactPhone: z.string().max(30).optional(),
    notes: z.string().max(1000).optional(),
  })
  .strict();

export const updateMemberSchema = createMemberSchema.partial().strict();

// ─────────────────────────────────────────────────────────
// Finance — Expense
// ─────────────────────────────────────────────────────────

export const createExpenseSchema = z
  .object({
    categoryId: z.string().uuid(),
    branchId: z.string().uuid(),
    amount: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid amount"),
    description: z.string().min(5).max(500),
    documentUrl: z.string().url().optional(),
    periodMonth: z
      .string()
      .regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Must be in YYYY-MM format"),
  })
  .strict();

export const approveExpenseSchema = z
  .object({
    action: z.enum(["approved", "rejected"]),
    comments: z.string().max(500).optional(),
  })
  .strict();

// ─────────────────────────────────────────────────────────
// Finance — Income
// ─────────────────────────────────────────────────────────

export const recordTitheSchema = z
  .object({
    memberId: z.string().uuid(),
    branchId: z.string().uuid(),
    amount: z.string().regex(/^\d+(\.\d{1,2})?$/),
    paymentMethod: z.enum(["cash", "bank_transfer", "cheque", "mobile_money", "online"]),
    referenceNumber: z.string().max(100).optional(),
    periodMonth: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/),
    notes: z.string().max(500).optional(),
  })
  .strict();

export const recordOfferingSchema = z
  .object({
    branchId: z.string().uuid(),
    eventId: z.string().uuid().optional(),
    categoryId: z.string().uuid().optional(),
    amount: z.string().regex(/^\d+(\.\d{1,2})?$/),
    paymentMethod: z.enum(["cash", "bank_transfer", "cheque", "mobile_money", "online"]),
    referenceNumber: z.string().max(100).optional(),
    notes: z.string().max(500).optional(),
  })
  .strict();

// ─────────────────────────────────────────────────────────
// Events
// ─────────────────────────────────────────────────────────

export const createEventSchema = z
  .object({
    branchId: z.string().uuid(),
    name: z.string().min(1).max(200),
    eventType: z.enum([
      "sunday_service",
      "midweek_service",
      "department_meeting",
      "special_program",
      "outreach",
      "other",
    ]),
    description: z.string().max(1000).optional(),
    eventDate: z.string().datetime(),
    endDate: z.string().datetime().optional(),
    location: z.string().max(300).optional(),
    organizerMemberId: z.string().uuid().optional(),
    expectedAttendance: z.number().int().positive().optional(),
  })
  .strict();

// ─────────────────────────────────────────────────────────
// Budget
// ─────────────────────────────────────────────────────────

export const createBudgetSchema = z
  .object({
    branchId: z.string().uuid(),
    name: z.string().min(1).max(200),
    period: z.enum(["monthly", "annual"]),
    periodLabel: z.string().regex(/^\d{4}(-\d{2})?$/, "Must be YYYY or YYYY-MM"),
    totalAmount: z.string().regex(/^\d+(\.\d{1,2})?$/),
    items: z
      .array(
        z
          .object({
            categoryId: z.string().uuid(),
            allocatedAmount: z.string().regex(/^\d+(\.\d{1,2})?$/),
            notes: z.string().max(300).optional(),
          })
          .strict()
      )
      .min(1),
  })
  .strict();
