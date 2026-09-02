'use client';

// Fields used: email, password, name (register), confirmPassword (register). No mockData.

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Lock,
  Mail,
  User,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  ChevronLeft,
} from 'lucide-react';
import { BrandLogo } from '../common/BrandLogo';

interface AuthPageProps {
  initialMode?: 'login' | 'register';
  onLoginSuccess?: (userData?: { name: string; email: string }) => void;
  onStartOnboarding?: () => void;
  onBackToLanding?: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({
  initialMode = 'login',
  onLoginSuccess,
  onStartOnboarding,
  onBackToLanding,
}) => {
  const router = useRouter();
  const goLanding = onBackToLanding ?? (() => router.push('/'));
  const goOnboarding = onStartOnboarding ?? (() => router.push('/onboarding'));
  const goDashboard = (userData?: { name: string; email: string }) => {
    onLoginSuccess?.(userData);
    router.push('/dashboard');
  };
  const [authMode, setAuthMode] = useState<'login' | 'register'>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [forgotEmailSent, setForgotEmailSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Password strength calculation
  const getPasswordStrength = () => {
    if (!password) return { level: 0, text: 'None', color: 'bg-[#252B30]' };
    if (password.length < 6) return { level: 1, text: 'Too Short', color: 'bg-[#F05D5E]' };
    const hasNum = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*]/.test(password);
    if (password.length >= 8 && hasNum && hasSpecial) {
      return { level: 3, text: 'Strong', color: 'bg-[#45D483]' };
    }
    return { level: 2, text: 'Medium', color: 'bg-[#F5B942]' };
  };

  const strength = getPasswordStrength();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    if (!password || password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    if (authMode === 'register') {
      if (!name.trim()) {
        setErrorMsg('Please enter your full name.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg('Passwords do not match.');
        return;
      }
    }

    setIsLoading(true);
    try {
      const endpoint = authMode === 'register' ? '/api/auth/register' : '/api/auth/login';
      const body =
        authMode === 'register'
          ? { name: name.trim(), email: email.trim(), password }
          : { email: email.trim(), password };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) {
        setErrorMsg(json.error?.message || 'Authentication failed.');
        return;
      }

      const complete = Boolean(json.data?.user?.onboardingComplete);
      if (authMode === 'register' || !complete) {
        goOnboarding();
      } else {
        goDashboard({
          name: json.data.user.name,
          email: json.data.user.email,
        });
      }
      router.refresh();
    } catch {
      setErrorMsg('Unable to reach the server.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      id="auth-page-container"
      className="min-h-screen bg-[#0B0D0F] text-[#F5F7F2] flex flex-col justify-between selection:bg-[#B8F34A] selection:text-[#0B0D0F]"
    >
      {/* Top Header Bar */}
      <header className="p-4 sm:p-6 flex items-center justify-between max-w-7xl w-full mx-auto">
        <button
          onClick={goLanding}
          className="flex items-center gap-1.5 text-xs font-bold text-[#9AA3A0] hover:text-white transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Landing</span>
        </button>

        <BrandLogo size="md" />

        <div className="w-20" /> {/* Balance spacer */}
      </header>

      {/* Main Auth Form Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-4">
        <div className="w-full max-w-md bg-[#12161A] border border-[#252B30] rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          {/* Top Decorative Glow */}
          <div className="absolute -top-16 -right-16 w-36 h-36 bg-[#B8F34A]/10 blur-3xl rounded-full pointer-events-none" />

          {/* Tab Switcher */}
          <div className="grid grid-cols-2 p-1 bg-[#0B0D0F] border border-[#252B30] rounded-2xl mb-6">
            <button
              id="tab-auth-login"
              type="button"
              onClick={() => {
                setAuthMode('login');
                setErrorMsg('');
              }}
              className={`py-2.5 rounded-xl text-xs font-bold transition-all ${
                authMode === 'login'
                  ? 'bg-[#B8F34A] text-[#0B0D0F] shadow-sm'
                  : 'text-[#9AA3A0] hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              id="tab-auth-register"
              type="button"
              onClick={() => {
                setAuthMode('register');
                setErrorMsg('');
              }}
              className={`py-2.5 rounded-xl text-xs font-bold transition-all ${
                authMode === 'register'
                  ? 'bg-[#B8F34A] text-[#0B0D0F] shadow-sm'
                  : 'text-[#9AA3A0] hover:text-white'
              }`}
            >
              Create Account
            </button>
          </div>

          <div className="mb-6">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {authMode === 'login' ? 'Welcome Back, Athlete' : 'Create Your Athlete Account'}
            </h1>
            <p className="text-xs text-[#9AA3A0] mt-1">
              {authMode === 'login'
                ? 'Access your DEXA telemetry, active workout logs, and AI splits'
                : 'Begin your evidence-based progressive overload journey'}
            </p>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-[#F05D5E]/10 border border-[#F05D5E]/30 flex items-center gap-2 text-xs text-[#F05D5E]">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name for registration */}
            {authMode === 'register' && (
              <div>
                <label className="text-[11px] uppercase tracking-wider font-bold text-[#9AA3A0] block mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#9AA3A0] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    id="input-auth-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Jordan Miller"
                    className="w-full bg-[#0B0D0F] border border-[#252B30] rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-[#9AA3A0]/60 outline-none focus:border-[#B8F34A]"
                    required
                  />
                </div>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label className="text-[11px] uppercase tracking-wider font-bold text-[#9AA3A0] block mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#9AA3A0] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  id="input-auth-email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="athlete@domain.com"
                  className="w-full bg-[#0B0D0F] border border-[#252B30] rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-[#9AA3A0]/60 outline-none focus:border-[#B8F34A]"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] uppercase tracking-wider font-bold text-[#9AA3A0]">
                  Password
                </label>
                {authMode === 'login' && (
                  <button
                    type="button"
                    onClick={() => router.push('/forgot-password')}
                    className="text-[10px] text-[#B8F34A] hover:underline font-semibold"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#9AA3A0] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="input-auth-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#0B0D0F] border border-[#252B30] rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder:text-[#9AA3A0]/60 outline-none focus:border-[#B8F34A]"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9AA3A0] hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password strength on registration */}
              {authMode === 'register' && password && (
                <div className="mt-2">
                  <div className="flex items-center justify-between text-[10px] text-[#9AA3A0] mb-1">
                    <span>Password Strength:</span>
                    <span className="font-bold text-white">{strength.text}</span>
                  </div>
                  <div className="w-full bg-[#0B0D0F] h-1.5 rounded-full overflow-hidden flex gap-1">
                    <div className={`h-full flex-1 rounded-full ${strength.level >= 1 ? strength.color : 'bg-[#252B30]'}`} />
                    <div className={`h-full flex-1 rounded-full ${strength.level >= 2 ? strength.color : 'bg-[#252B30]'}`} />
                    <div className={`h-full flex-1 rounded-full ${strength.level >= 3 ? strength.color : 'bg-[#252B30]'}`} />
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password for registration */}
            {authMode === 'register' && (
              <div>
                <label className="text-[11px] uppercase tracking-wider font-bold text-[#9AA3A0] block mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#9AA3A0] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    id="input-auth-confirm-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#0B0D0F] border border-[#252B30] rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-[#9AA3A0]/60 outline-none focus:border-[#B8F34A]"
                    required
                  />
                </div>
              </div>
            )}

            {/* Remember Me */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-[#9AA3A0]">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-[#252B30] text-[#B8F34A] focus:ring-0"
                />
                <span>Remember this device</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              id="btn-auth-submit"
              type="submit"
              disabled={isLoading}
              className="w-full mt-3 py-3.5 rounded-2xl bg-[#B8F34A] text-[#0B0D0F] hover:bg-[#C8FF68] font-black text-xs uppercase tracking-wider shadow-[0_2px_14px_rgba(184,243,74,0.3)] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <span>Authenticating...</span>
              ) : authMode === 'login' ? (
                <>
                  <span>Sign In To Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  <span>Create Account & Setup Bio-Metrics</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Social login divider */}
          <div className="relative my-6 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#252B30]" />
            </div>
            <span className="relative bg-[#12161A] px-3 text-[10px] uppercase font-bold text-[#9AA3A0]">
              Or continue with
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setErrorMsg('Google sign-in will be available in a later update. Use email and password for now.')}
              className="p-2.5 rounded-xl bg-[#0B0D0F] border border-[#252B30] hover:border-[#9AA3A0] text-xs font-semibold text-[#F5F7F2] flex items-center justify-center gap-2 transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
                />
                <path
                  fill="#4285F4"
                  d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15.1s.7 5.4 1.9 7.8l3.7-2.9z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16c1.8 3.7 5.6 7 10.1 7z"
                />
              </svg>
              <span>Google</span>
            </button>

            <button
              type="button"
              onClick={() => setErrorMsg('Apple sign-in will be available in a later update. Use email and password for now.')}
              className="p-2.5 rounded-xl bg-[#0B0D0F] border border-[#252B30] hover:border-[#9AA3A0] text-xs font-semibold text-[#F5F7F2] flex items-center justify-center gap-2 transition-colors"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.85c.65-.79 1.1-1.9 1-2.99-1 .04-2.17.67-2.85 1.46-.6.69-1.12 1.82-1 2.9 1.11.09 2.22-.57 2.85-1.37z" />
              </svg>
              <span>Apple</span>
            </button>
          </div>
        </div>
      </main>

      {/* Forgot Password Modal */}
      {forgotPasswordOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-[#12161A] border border-[#252B30] rounded-3xl p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white">Reset Password</h3>
            <p className="text-xs text-[#9AA3A0] mt-1">
              Enter your email address and we'll send you an encrypted recovery token.
            </p>

            {forgotEmailSent ? (
              <div className="my-6 p-4 rounded-2xl bg-[#45D483]/10 border border-[#45D483]/30 text-xs text-[#45D483] flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span>Recovery instructions dispatched! Check your inbox.</span>
              </div>
            ) : (
              <div className="my-5">
                <label className="text-[11px] font-bold uppercase text-[#9AA3A0] block mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  defaultValue={email}
                  placeholder="athlete@domain.com"
                  className="w-full bg-[#0B0D0F] border border-[#252B30] rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-[#B8F34A]"
                />
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#252B30]">
              <button
                type="button"
                onClick={() => {
                  setForgotPasswordOpen(false);
                  setForgotEmailSent(false);
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#9AA3A0] hover:text-white"
              >
                Close
              </button>
              {!forgotEmailSent && (
                <button
                  type="button"
                  onClick={() => setForgotEmailSent(true)}
                  className="px-4 py-2 rounded-xl bg-[#B8F34A] text-[#0B0D0F] font-bold text-xs"
                >
                  Send Recovery Email
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="p-4 text-center text-[11px] text-[#9AA3A0]">
        FitForge AI uses end-to-end telemetry encryption for all biometric data.
      </footer>
    </div>
  );
};
