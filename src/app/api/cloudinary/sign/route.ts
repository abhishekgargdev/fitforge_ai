import { createHash } from "crypto";
import { fail, ok } from "@/lib/api/response";
import { requireSessionUser } from "@/lib/auth/session";

export async function POST(request: Request) {
  try {
    const session = await requireSessionUser();
    if (!session) return fail("Unauthorized", 401, "UNAUTHORIZED");

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    const timestamp = Math.floor(Date.now() / 1000);
    const body = await request.json().catch(() => ({}));
    const folder = body.folder || "fitforge_community_exercises";

    if (!cloudName || !apiKey || !apiSecret) {
      // If Cloudinary keys are missing in env, return fallback upload config for client simulation
      return ok({
        configured: false,
        timestamp,
        folder,
        message: "Cloudinary credentials not set in environment. Use local media URL fallback.",
      });
    }

    // Build signature string (parameters in alphabetical order)
    const stringToSign = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
    const signature = createHash("sha1").update(stringToSign).digest("hex");

    return ok({
      configured: true,
      signature,
      timestamp,
      apiKey,
      cloudName,
      folder,
      uploadUrl: `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
    });
  } catch (error) {
    console.error("[cloudinary:sign]", error);
    return fail("Failed to generate Cloudinary signature", 500, "SERVER_ERROR");
  }
}
