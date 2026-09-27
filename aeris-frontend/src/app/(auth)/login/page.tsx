'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { 
  Lock, 
  Mail, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  UserCheck, 
  Compass,
  ArrowLeft,
  AlertCircle
} from 'lucide-react';

import { useAuth } from '@/lib/auth-context';

const ADMIN_CREDENTIALS = {
  email: 'sdma.officer@maharashtra.gov.in',
  password: 'Aeris@SDMA2026',
};

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  // Mode: 'admin' | 'guest'
  const [authMode, setAuthMode] = useState<'admin' | 'guest'>('admin');

  // Form Inputs (Empty by default — User fills themselves)
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(false);

  // Status State
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Admin Form Submit
  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim()) {
      setErrorMessage('Please enter your administrator email address.');
      return;
    }

    if (!password.trim()) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setIsLoading(true);

    // Validate credentials
    setTimeout(() => {
      const isEmailValid = email.trim().toLowerCase() === ADMIN_CREDENTIALS.email.toLowerCase();
      const isPassValid = password.trim() === ADMIN_CREDENTIALS.password;

      if (isEmailValid && isPassValid) {
        login('admin', email);
      } else {
        setIsLoading(false);
        setErrorMessage('Invalid credentials. Please use the demo admin credentials shown below.');
      }
    }, 450);
  };

  // Direct Guest Login
  const handleGuestLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      login('guest');
    }, 350);
  };

  return (
    <div className="min-h-screen bg-white text-[#0B2F56] font-sans selection:bg-[#087693] selection:text-white flex flex-col justify-between">
      
      {/* HEADER */}
      <header className="w-full border-b border-slate-100 px-6 sm:px-10 py-4 bg-white">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="AERIS Logo"
              width={120}
              height={28}
              className="h-7 w-auto object-contain"
              priority
            />
          </Link>

          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#087693] transition-colors py-1.5 px-3 rounded-lg hover:bg-slate-50"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </Link>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="flex-1 flex items-center justify-center px-4 py-12 sm:px-6">
        <div className="w-full max-w-md space-y-6">
          
          {/* Logo, Title & Badge */}
          <div className="text-center space-y-3">
            {/* Centered Brand Logo */}
            <div className="flex justify-center pb-1">
              <Link href="/" className="inline-block transition-transform hover:scale-105">
                <Image
                  src="/logo.png"
                  alt="AERIS Logo"
                  width={160}
                  height={38}
                  className="h-10 w-auto object-contain"
                  priority
                />
              </Link>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E6F3F7] border border-[#087693]/20 text-[11px] font-mono font-bold text-[#087693] uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5 text-[#087693]" />
              <span>Operations Portal</span>
            </div>
            
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Select your access mode to enter the severe weather &amp; disaster operations system.
            </p>
          </div>

          {/* Card */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-7 shadow-xs space-y-5">
            
            {/* Mode Switcher: Admin vs Guest */}
            <div className="grid grid-cols-2 p-1 bg-slate-100/80 rounded-xl border border-slate-200/60 text-xs font-bold">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('admin');
                  setErrorMessage('');
                }}
                className={`py-2 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  authMode === 'admin'
                    ? 'bg-white text-[#0B2F56] shadow-xs'
                    : 'text-slate-500 hover:text-[#0B2F56]'
                }`}
              >
                <UserCheck className={`w-3.5 h-3.5 ${authMode === 'admin' ? 'text-[#087693]' : 'text-slate-400'}`} />
                <span>Admin Login</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAuthMode('guest');
                  setErrorMessage('');
                }}
                className={`py-2 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  authMode === 'guest'
                    ? 'bg-white text-[#0B2F56] shadow-xs'
                    : 'text-slate-500 hover:text-[#0B2F56]'
                }`}
              >
                <Compass className={`w-3.5 h-3.5 ${authMode === 'guest' ? 'text-[#087693]' : 'text-slate-400'}`} />
                <span>Guest User</span>
              </button>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200/80 rounded-xl flex items-start gap-2 text-xs text-red-700 animate-in fade-in-50">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* 1. ADMIN LOGIN FORM */}
            {authMode === 'admin' ? (
              <form onSubmit={handleAdminLogin} className="space-y-4">
                {/* Email */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#0B2F56] block">
                    Admin Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="sdma.officer@maharashtra.gov.in"
                      className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono text-[#0B2F56] placeholder:text-slate-400 focus:outline-none focus:border-[#087693] focus:ring-1 focus:ring-[#087693] transition-all"
                      autoComplete="username"
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-[#0B2F56]">
                      Password
                    </label>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter admin password"
                      className="w-full pl-9 pr-9 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono text-[#0B2F56] placeholder:text-slate-400 focus:outline-none focus:border-[#087693] focus:ring-1 focus:ring-[#087693] transition-all"
                      autoComplete="current-password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me */}
                <div className="flex items-center justify-between text-xs text-slate-500 pt-0.5">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-slate-300 text-[#087693] focus:ring-[#087693]"
                    />
                    <span>Remember this session</span>
                  </label>
                </div>

                {/* Sign In Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#0B2F56] hover:bg-[#071F3A] text-white font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-2xs hover:shadow-xs cursor-pointer disabled:opacity-75 text-xs tracking-tight"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Sign In as Admin</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              /* 2. GUEST USER LOGIN */
              <div className="space-y-4 py-2">
                <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 text-center space-y-1.5">
                  <h3 className="text-xs font-bold text-[#0B2F56]">
                    Guest Observer Access
                  </h3>
                  <p className="text-[11px] text-slate-500 leading-relaxed max-w-xs mx-auto">
                    Directly access live weather radar maps, rainfall nowcasting, and flood alerts without credentials.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleGuestLogin}
                  disabled={isLoading}
                  className="w-full bg-[#087693] hover:bg-[#065E77] text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-2xs hover:shadow-xs cursor-pointer text-xs tracking-tight"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Direct Guest Login</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            )}

            {/* DEMO ADMIN CREDENTIALS (Clean & Simple) */}
            <div className="pt-3 border-t border-slate-100">
              <div className="bg-slate-50 border border-slate-200/70 rounded-xl p-3 text-xs space-y-1.5 font-mono">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-sans">
                  Demo Admin Credentials
                </div>

                <div className="flex items-center gap-2 text-[11px] text-slate-700">
                  <span className="text-slate-400 font-sans">Email:</span>
                  <span className="font-medium text-[#0B2F56] truncate">
                    {ADMIN_CREDENTIALS.email}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-[11px] text-slate-700">
                  <span className="text-slate-400 font-sans">Password:</span>
                  <span className="font-medium text-[#0B2F56]">
                    {ADMIN_CREDENTIALS.password}
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* Footer Security Badge */}
          <div className="text-center text-[11px] text-slate-400">
            AERIS Operations Gateway &bull; MoES &amp; SDMA Network
          </div>

        </div>
      </main>

      {/* FOOTER */}
      <footer className="w-full border-t border-slate-100 py-3 text-center text-xs text-slate-400">
        &copy; 2026 AERIS. High-Resolution Atmospheric &amp; Flood Intelligence.
      </footer>

    </div>
  );
}
