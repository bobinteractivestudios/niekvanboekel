import { NextResponse } from "next/server";
import { handleUploadPresigned } from "@vercel/blob/client";
import { issueSignedToken } from "@vercel/blob";
import { ALLOWED_CONTENT_TYPES, MAX_FILE_BYTES } from "@/lib/uploadShared";

/**
 * Issues short-lived, scoped upload tokens so the browser can send photos
 * and videos straight to Vercel Blob instead of through a server action —
 * server actions on Vercel cap request bodies at ~4.5MB, which multiple
 * real photos blow past easily. See components/UploadForm.tsx for the
 * client side of this.
 */
export async function POST(request: Request): Promise<NextResponse> {
  const body = await request.json();

  try {
    const jsonResponse = await handleUploadPresigned({
      body,
      request,
      getSignedToken: async () => {
        const token = await issueSignedToken({
          operations: ["put"],
          allowedContentTypes: ALLOWED_CONTENT_TYPES,
          maximumSizeInBytes: MAX_FILE_BYTES,
          validUntil: Date.now() + 15 * 60 * 1000,
        });
        return { token };
      },
    });
    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Kon uploadtoken niet aanmaken." },
      { status: 400 }
    );
  }
}
