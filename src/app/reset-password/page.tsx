"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { BrandLogo } from "@/components/common/BrandLogo";
import { AlertCircle } from "lucide-react";
import { Suspense } from "react";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = useMemo(() => searchParams.get("token") || "", [searchParams]);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  return (
    <div className="min-h-screen bg-[#0B0D0F] text-[#F5F7F2] flex flex-col items-center justify-center p-4">
      <BrandLogo />
      <div className="mt-8 w-full max-w-md bg-[#12161A] border border-[#252B30] rounded-3xl p-6">
        <h1 className="text-lg font-bold text-white">Choose a new password</h1>
        {error && (
          <div className="mt-4 p-3 rounded-xl bg-[#F05D5E]/10 border border-[#F05D5E]/30 text-xs text-[#F05D5E] flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}
        {done ? (
          <p className="text-xs text-[#45D483] mt-4">Password updated. You can sign in now.</p>
        ) : (
          <form
            className="mt-4 space-y-3"
            onSubmit={async (e) => {
              e.preventDefault();
              setError("");
              if (!token) {
                setError("This reset link is missing a token.");
                return;
              }
              if (password.length < 6) {
                setError("Password must be at least 6 characters.");
                return;
              }
              if (password !== confirm) {
                setError("Passwords do not match.");
                return;
              }
              setLoading(true);
              try {
                const res = await fetch("/api/auth/reset-password", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ token, password }),
                });
                const json = await res.json();
                if (!res.ok) {
                  setError(json.error?.message || "Unable to update password.");
                  return;
                }
                setDone(true);
              } catch {
                setError("Unable to update password.");
              } finally {
                setLoading(false);
              }
            }}
          >
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="New password"
              className="w-full bg-[#0B0D0F] border border-[#252B30] rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-[#B8F34A]"
            />
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Confirm password"
              className="w-full bg-[#0B0D0F] border border-[#252B30] rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-[#B8F34A]"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-[#B8F34A] text-[#0B0D0F] font-bold text-xs disabled:opacity-50"
            >
              {loading ? "Updating..." : "Update password"}
            </button>
          </form>
        )}
        <Link href="/login" className="mt-4 inline-block text-xs text-[#B8F34A] hover:underline">
          Back to sign in
        </Link>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
