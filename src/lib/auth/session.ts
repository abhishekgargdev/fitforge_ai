import { createHash, randomBytes } from "node:crypto";
import { encode, decode } from "next-auth/jwt";
import { cookies } from "next/headers";
import { connectDB } from "@/lib/db/mongodb";
import { User } from "@/models/User";

const SESSION_MAX_AGE = 30 * 24 * 60 * 60;

export type AuthToken = {
  userId: string;
  email: string;
  name: string;
  onboardingComplete: boolean;
};

function useSecureCookie() {
  return (process.env.NEXTAUTH_URL || "").startsWith("https://");
}

function cookieName() {
  return useSecureCookie()
    ? "__Secure-next-auth.session-token"
    : "next-auth.session-token";
}

function cookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    secure: useSecureCookie(),
    maxAge,
  };
}

function requireSecret() {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) throw new Error("NEXTAUTH_SECRET is not set");
  return secret;
}

export async function createSessionCookie(payload: AuthToken) {
  const token = await encode({
    token: {
      sub: payload.userId,
      userId: payload.userId,
      email: payload.email,
      name: payload.name,
      onboardingComplete: payload.onboardingComplete,
    },
    secret: requireSecret(),
    maxAge: SESSION_MAX_AGE,
  });

  const store = await cookies();
  store.set(cookieName(), token, cookieOptions(SESSION_MAX_AGE));
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.set(cookieName(), "", cookieOptions(0));
  store.set("next-auth.session-token", "", cookieOptions(0));
  store.set("__Secure-next-auth.session-token", "", { ...cookieOptions(0), secure: true });
}

export async function requireSessionUser() {
  const token = await readSessionToken();
  if (!token) return null;
  await connectDB();
  const user = await User.findById(token.userId);
  if (!user) return null;
  return { token, user };
}

export async function readSessionToken(): Promise<AuthToken | null> {
  const store = await cookies();
  const raw =
    store.get(cookieName())?.value ??
    store.get("next-auth.session-token")?.value ??
    store.get("__Secure-next-auth.session-token")?.value;

  if (!raw) return null;

  try {
    const decoded = await decode({ token: raw, secret: requireSecret() });
    if (!decoded?.userId || !decoded.email) return null;
    return {
      userId: String(decoded.userId),
      email: String(decoded.email),
      name: String(decoded.name ?? ""),
      onboardingComplete: Boolean(decoded.onboardingComplete),
    };
  } catch {
    return null;
  }
}

export function createResetToken() {
  const token = randomBytes(32).toString("hex");
  const tokenHash = hashResetToken(token);
  return { token, tokenHash };
}

export function hashResetToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}
