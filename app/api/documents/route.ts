import { NextRequest } from "next/server";
import { eq, desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { documents, users } from "@/lib/db/schema";
import { requireRole, apiError, apiSuccess } from "@/lib/api-utils";
import { logAction, getClientIp } from "@/lib/audit";

export async function GET(request: NextRequest) {
  const { error } = requireRole(request.headers, [
    "admin_officer",
    "finance_officer",
    "system_administrator",
  ]);
  if (error) return error;

  const url = new URL(request.url);
  const category = url.searchParams.get("category");

  let query = db
    .select({
      id: documents.id,
      name: documents.name,
      category: documents.category,
      fileData: documents.fileData,
      fileType: documents.fileType,
      fileSizeBytes: documents.fileSizeBytes,
      createdAt: documents.createdAt,
      uploaderFirstName: users.firstName,
      uploaderLastName: users.lastName,
    })
    .from(documents)
    .leftJoin(users, eq(documents.uploadedByUserId, users.id))
    .where(eq(documents.isDeleted, false))
    .orderBy(desc(documents.createdAt))
    .$dynamic();

  // We could filter by category here if needed in the future

  const rows = await query;
  return apiSuccess(rows);
}

export async function POST(request: NextRequest) {
  const { session, error } = requireRole(request.headers, [
    "admin_officer",
    "finance_officer",
    "system_administrator",
  ]);
  if (error) return error;

  try {
    const body = await request.json();
    const { name, category, fileData, fileType, fileSizeBytes } = body;

    if (!name || !category || !fileData) {
      return apiError("Missing required fields (name, category, fileData)", 400);
    }

    const [newDoc] = await db
      .insert(documents)
      .values({
        name,
        category,
        fileData,
        fileType: fileType || name.split('.').pop() || "unknown",
        fileSizeBytes: fileSizeBytes || "0",
        uploadedByUserId: session.userId,
      })
      .returning();

    await logAction({
      userId: session.userId,
      userEmail: session.userEmail,
      action: "CREATE",
      tableAffected: "documents",
      recordId: newDoc.id,
      ipAddress: getClientIp(request.headers),
      newValues: { name: newDoc.name, category: newDoc.category },
    });

    return apiSuccess(newDoc, 201);
  } catch (err: any) {
    console.error("Failed to upload document:", err);
    return apiError("Failed to upload document", 500);
  }
}
