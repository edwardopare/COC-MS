import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { documents } from "@/lib/db/schema";
import { requireRole, apiError, apiSuccess } from "@/lib/api-utils";
import { logAction, getClientIp } from "@/lib/audit";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session, error } = requireRole(request.headers, [
    "admin_officer",
    "finance_officer",
    "system_administrator",
  ]);
  if (error) return error;

  try {
    const resolvedParams = await params;
    const docId = resolvedParams.id;

    const [deletedDoc] = await db
      .update(documents)
      .set({ isDeleted: true, deletedAt: new Date() })
      .where(eq(documents.id, docId))
      .returning();

    if (!deletedDoc) {
      return apiError("Document not found", 404);
    }

    await logAction({
      userId: session.userId,
      userEmail: session.userEmail,
      action: "DELETE",
      tableAffected: "documents",
      recordId: deletedDoc.id,
      ipAddress: getClientIp(request.headers),
      oldValues: { name: deletedDoc.name },
    });

    return apiSuccess({ success: true });
  } catch (err: any) {
    console.error("Failed to delete document:", err);
    return apiError("Failed to delete document", 500);
  }
}
