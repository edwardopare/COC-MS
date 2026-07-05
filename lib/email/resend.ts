import { Resend } from "resend";

if (!process.env.RESEND_API_KEY) {
  throw new Error("RESEND_API_KEY environment variable is not set");
}

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = `${process.env.RESEND_FROM_NAME ?? "Church CMS"} <${process.env.RESEND_FROM_EMAIL ?? "noreply@example.com"}>`;
const APP_NAME = process.env.NEXT_PUBLIC_CHURCH_NAME ?? "Church Management System";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

// ─────────────────────────────────────────────────────────
// Welcome / New User
// ─────────────────────────────────────────────────────────

export async function sendWelcomeEmail(to: string, name: string, temporaryPassword: string) {
  return resend.emails.send({
    from: FROM,
    to,
    subject: `Your ${APP_NAME} account is ready`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome to ${APP_NAME}</h2>
        <p>Hi ${name},</p>
        <p>Your account has been created. Please log in using the credentials below:</p>
        <div style="background:#f4f4f4;padding:16px;border-radius:8px;margin:16px 0;">
          <strong>Email:</strong> ${to}<br/>
          <strong>Temporary Password:</strong> ${temporaryPassword}
        </div>
        <p><a href="${APP_URL}/login" style="background:#4f46e5;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;">Log In Now</a></p>
        <p style="color:#666;font-size:13px;">You will be required to change your password on first login.</p>
      </div>
    `,
  });
}

// ─────────────────────────────────────────────────────────
// Password Reset
// ─────────────────────────────────────────────────────────

export async function sendPasswordResetEmail(to: string, name: string, resetLink: string) {
  return resend.emails.send({
    from: FROM,
    to,
    subject: `Reset your ${APP_NAME} password`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Password Reset Request</h2>
        <p>Hi ${name},</p>
        <p>We received a request to reset your password. Click the button below to set a new password:</p>
        <p><a href="${resetLink}" style="background:#4f46e5;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;">Reset Password</a></p>
        <p style="color:#666;font-size:13px;">This link expires in 1 hour. If you did not request this, you can safely ignore this email.</p>
      </div>
    `,
  });
}

// ─────────────────────────────────────────────────────────
// Expense Notification (to Finance Officers)
// ─────────────────────────────────────────────────────────

export async function sendExpenseSubmittedEmail(
  to: string,
  financerName: string,
  expenseId: string,
  description: string,
  amount: string,
  submittedBy: string
) {
  return resend.emails.send({
    from: FROM,
    to,
    subject: `New expense request pending your review`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Expense Request Submitted</h2>
        <p>Hi ${financerName},</p>
        <p>A new expense request requires your review:</p>
        <div style="background:#f4f4f4;padding:16px;border-radius:8px;margin:16px 0;">
          <strong>Submitted by:</strong> ${submittedBy}<br/>
          <strong>Description:</strong> ${description}<br/>
          <strong>Amount:</strong> ${amount}
        </div>
        <p><a href="${APP_URL}/finance/expenses/approve?id=${expenseId}" style="background:#4f46e5;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;">Review Request</a></p>
      </div>
    `,
  });
}

// ─────────────────────────────────────────────────────────
// Expense Decision (to Admin Officer)
// ─────────────────────────────────────────────────────────

export async function sendExpenseDecisionEmail(
  to: string,
  name: string,
  expenseId: string,
  decision: "approved" | "rejected",
  comments?: string
) {
  const color = decision === "approved" ? "#16a34a" : "#dc2626";
  const label = decision === "approved" ? "Approved ✓" : "Rejected ✗";

  return resend.emails.send({
    from: FROM,
    to,
    subject: `Your expense request has been ${decision}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Expense Request Update</h2>
        <p>Hi ${name},</p>
        <p>Your expense request has been reviewed:</p>
        <div style="background:#f4f4f4;padding:16px;border-radius:8px;margin:16px 0;">
          <strong>Status:</strong> <span style="color:${color};">${label}</span><br/>
          ${comments ? `<strong>Comments:</strong> ${comments}` : ""}
        </div>
        <p><a href="${APP_URL}/admin/expenses?id=${expenseId}" style="background:#4f46e5;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;">View Details</a></p>
      </div>
    `,
  });
}

// ─────────────────────────────────────────────────────────
// Pledge Reminder
// ─────────────────────────────────────────────────────────

export async function sendPledgeReminderEmail(
  to: string,
  name: string,
  campaignName: string,
  outstandingAmount: string,
  dueDate: string
) {
  return resend.emails.send({
    from: FROM,
    to,
    subject: `Pledge payment reminder — ${campaignName}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Pledge Payment Reminder</h2>
        <p>Hi ${name},</p>
        <p>This is a reminder about an outstanding pledge:</p>
        <div style="background:#f4f4f4;padding:16px;border-radius:8px;margin:16px 0;">
          <strong>Campaign:</strong> ${campaignName}<br/>
          <strong>Outstanding Balance:</strong> ${outstandingAmount}<br/>
          <strong>Due Date:</strong> ${dueDate}
        </div>
        <p><a href="${APP_URL}/finance/pledges" style="background:#4f46e5;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;">View Pledges</a></p>
      </div>
    `,
  });
}

// ─────────────────────────────────────────────────────────
// Budget Alert
// ─────────────────────────────────────────────────────────

export async function sendBudgetAlertEmail(
  to: string,
  name: string,
  budgetName: string,
  categoryName: string,
  percentUsed: number
) {
  return resend.emails.send({
    from: FROM,
    to,
    subject: `⚠️ Budget alert — ${categoryName} at ${percentUsed}%`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Budget Threshold Alert</h2>
        <p>Hi ${name},</p>
        <p>A budget line has reached its threshold:</p>
        <div style="background:#fef3c7;padding:16px;border-radius:8px;margin:16px 0;border-left:4px solid #f59e0b;">
          <strong>Budget:</strong> ${budgetName}<br/>
          <strong>Category:</strong> ${categoryName}<br/>
          <strong>Used:</strong> ${percentUsed}% of allocated amount
        </div>
        <p><a href="${APP_URL}/finance/budgets" style="background:#4f46e5;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;">View Budgets</a></p>
      </div>
    `,
  });
}
