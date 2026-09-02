"use client";

import { useState } from "react";
import Link from "next/link";
import { BrandLogo } from "@/components/common/BrandLogo";
import { CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [email, setEmail] = useState("");

  return (
    <div className="min-h-screen bg-[#0B0D0F] text-[#F5F7F2] flex flex-col items-center justify-center p-4">
      <BrandLogo />
      <div className="mt-8 w-full max-w-md bg-[#12161A] border border-[#252B30] rounded-3xl p-6">
        <h1 className="text-lg font-bold text-white">Reset Password</h1>
        <p className="text-xs text-[#9AA3A0] mt-1">
          Enter your email and we will send recovery instructions.
        </p>
        {sent ? (
          <div className="my-6 p-4 rounded-2xl bg-[#45D483]/10 border border-[#45D483]/30 text-xs text-[#45D483] flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            Recovery instructions dispatched. Check your inbox.
          </div>
        ) : (
          <form
            className="my-5 space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              setSent(true);
            }}
          >
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="athlete@domain.com"
              className="w-full bg-[#0B0D0F] border border-[#252B30] rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-[#B8F34A]"
            />
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-[#B8F34A] text-[#0B0D0F] font-bold text-xs"
            >
              Send Recovery Email
            </button>
          </form>
        )}
        <Link href="/login" className="text-xs text-[#B8F34A] hover:underline">
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
