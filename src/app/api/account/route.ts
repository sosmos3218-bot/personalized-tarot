import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { deleteAllUserData } from "@/lib/server/userData";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * DELETE /api/account
 * 1) Remove all of the user's Vercel Blob data
 * 2) Delete the Clerk user
 */
export async function DELETE() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let blobResult: { deleted: number; remaining: number };
  try {
    blobResult = await deleteAllUserData(userId);
  } catch (e) {
    console.error("[account] blob delete failed", e instanceof Error ? e.message : e);
    return NextResponse.json(
      { error: "데이터 삭제 중 문제가 생겼어요. 잠시 후 다시 시도해 주세요." },
      { status: 500 }
    );
  }
  if (blobResult.remaining > 0) {
    console.error("[account] blobs remaining after delete", blobResult);
    return NextResponse.json(
      { error: "일부 데이터가 삭제되지 않았어요. 잠시 후 다시 시도해 주세요." },
      { status: 500 }
    );
  }

  try {
    const client = await clerkClient();
    await client.users.deleteUser(userId);
  } catch (e) {
    console.error("[account] clerk delete failed", e instanceof Error ? e.message : e);
    return NextResponse.json(
      {
        error:
          "데이터는 삭제됐지만 계정 삭제에 실패했어요. 다시 시도하거나 문의해 주세요.",
        dataDeleted: true,
      },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true, deletedBlobs: blobResult.deleted });
}
