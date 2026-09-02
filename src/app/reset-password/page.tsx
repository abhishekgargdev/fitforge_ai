"use client";

import { useState } from "react";
import Link from "next/link";
import { BrandLogo } from "@/components/common/BrandLogo";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [done, setDone] = useState(false);

  return (
    <div className="min-h-screen bg-[#0B0D0F] text-[#F5F7F2] flex flex-col items-center justify-center p-4">
      <BrandLogo />
      <div className="mt-8 w-full max-w-md bg-[#12161A] border border-[#252B30] rounded-3xl p-6">
        <h1 className="text-lg font-bold text-white">Choose a new password</h1>
        {done ? (
          <p className="text-xs text-[#45D483] mt-4">Password updated. You can sign in now.</p>
        ) : (
          <form
            className="mt-4 space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              if (password.length >= 6 && password === confirm) setDone(true);
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
              className="w-full py-3 rounded-xl bg-[#B8F34A] text-[#0B0D0F] font-bold text-xs"
            >
              Update password
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
