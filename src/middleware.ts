import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const PUBLIC_EXACT = new Set([
  "/",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
]);

function isPublicPath(pathname: string) {
  if (PUBLIC_EXACT.has(pathname)) return true;
  if (pathname.startsWith("/api/auth")) return true;
  return false;
}

function isSemiProtected(pathname: string) {
  return pathname === "/onboarding" || pathname.startsWith("/api/onboarding");
}

function isPrivatePath(pathname: string) {
  if (isPublicPath(pathname) || isSemiProtected(pathname)) return false;
  return true;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  let token: Awaited<ReturnType<typeof getToken>> = null;
  try {
    token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });
  } catch {
    token = null;
  }
  const hasSession = Boolean(token);
  const onboardingComplete = Boolean(
    token && (token as { onboardingComplete?: boolean }).onboardingComplete
  );

  if (!hasSession && (isSemiProtected(pathname) || isPrivatePath(pathname))) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { error: { message: "Unauthorized", code: "UNAUTHORIZED" } },
        { status: 401 }
      );
    }
    const login = new URL("/login", request.url);
    login.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(login);
  }

  if (hasSession && !onboardingComplete && isPrivatePath(pathname)) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { error: { message: "Onboarding incomplete", code: "ONBOARDING_REQUIRED" } },
        { status: 403 }
      );
    }
    return NextResponse.redirect(new URL("/onboarding", request.url));
  }

  if (
    hasSession &&
    onboardingComplete &&
    (pathname === "/login" || pathname === "/register" || pathname === "/onboarding")
  ) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
