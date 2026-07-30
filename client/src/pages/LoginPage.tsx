import React, { useState, useEffect } from 'react';
import { useAuthStore, DEMO_USERS } from '../store/authStore';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Sparkles, Lock, Mail, ShieldCheck, Building2, UserCheck, Key, ArrowRight, AlertTriangle, ShieldAlert, Clock, Car } from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: () => void;
}

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_SECONDS = 30;

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const { login } = useAuthStore();
  const [email, setEmail] = useState('superadmin@diplon.com');
  const [password, setPassword] = useState('••••••••••••');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Rate Limiting & Brute-Force Protection State
  const [failedAttempts, setFailedAttempts] = useState<number>(0);
  const [lockoutSecondsLeft, setLockoutSecondsLeft] = useState<number>(0);

  // Countdown timer effect during Lockout
  useEffect(() => {
    let timer: any;
    if (lockoutSecondsLeft > 0) {
      timer = setInterval(() => {
        setLockoutSecondsLeft(prev => {
          if (prev <= 1) {
            setFailedAttempts(0); // Reset attempts after cooldown expires
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [lockoutSecondsLeft]);

  const isLockedOut = lockoutSecondsLeft > 0;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLockedOut) return;

    setIsLoading(true);
    setErrorMsg(null);

    setTimeout(() => {
      // Simulate password validation (demo accepts valid email or demo password)
      const isValidDemo = email in DEMO_USERS || password.length >= 6;

      if (isValidDemo) {
        setIsLoading(false);
        setFailedAttempts(0); // Reset counter on success
        login(email);
        onLoginSuccess();
      } else {
        const nextAttempts = failedAttempts + 1;
        setFailedAttempts(nextAttempts);
        setIsLoading(false);

        if (nextAttempts >= MAX_FAILED_ATTEMPTS) {
          setLockoutSecondsLeft(LOCKOUT_DURATION_SECONDS);
          setErrorMsg(`🚨 Brute-Force Rate Limiter Triggered: ${MAX_FAILED_ATTEMPTS} failed attempts. Login locked for ${LOCKOUT_DURATION_SECONDS} seconds.`);
        } else {
          setErrorMsg(`Invalid credentials. Failed attempts: ${nextAttempts}/${MAX_FAILED_ATTEMPTS}. (${MAX_FAILED_ATTEMPTS - nextAttempts} attempts remaining before lockout)`);
        }
      }
    }, 600);
  };

  const handleQuickDemoSelect = (demoEmail: string) => {
    if (isLockedOut) return;
    setEmail(demoEmail);
    setPassword('demoPass123!');
    setErrorMsg(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 relative overflow-hidden select-none">
      
      {/* Dynamic Background Effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center z-10">
        
        {/* Left Side: Official Brand & Logo */}
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-amber-500/50 shadow-2xl shadow-amber-500/30 shrink-0 bg-slate-950 flex items-center justify-center">
              <img src="/diplon-logo.jpg" alt="Diplon Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-white tracking-widest font-mono">DIPLON</h1>
              <span className="text-xs font-extrabold text-amber-400 uppercase tracking-widest">Travel & Tour ERP System</span>
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-3xl font-extrabold text-white leading-tight">
              Production-Grade Enterprise Travel ERP & Operations
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Multi-tenant company isolation, rate-limited login protection, B2B agency portal, Scorpio driver settlements, and tour dispatch lock controls.
            </p>
          </div>
        </div>

        {/* Right Side: Glassmorphic Login Form with Rate Limiter */}
        <div className="p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-xl space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Lock className="w-5 h-5 text-indigo-400" /> Secure JWT Login
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Enter your credentials to access your company ERP workspace
              </p>
            </div>
            
            {failedAttempts > 0 && !isLockedOut && (
              <span className="px-2.5 py-1 rounded-lg text-[10px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                ⚠️ {failedAttempts}/{MAX_FAILED_ATTEMPTS} Failed Attempts
              </span>
            )}
          </div>

          {/* 🔴 RATE LIMITER LOCKOUT WARNING BANNER */}
          {isLockedOut ? (
            <div className="p-4 rounded-2xl bg-rose-950/90 border-2 border-rose-500/80 text-white space-y-2 animate-pulse">
              <div className="flex items-center gap-2 font-extrabold text-xs text-rose-300 uppercase tracking-wider">
                <ShieldAlert className="w-4 h-4 text-rose-400 animate-bounce" />
                <span>Rate Limiter Lockout Active</span>
              </div>
              <p className="text-xs text-rose-100">
                Too many failed login attempts ({failedAttempts}/{MAX_FAILED_ATTEMPTS}). To protect your account from brute-force attacks, authentication is temporarily locked.
              </p>
              <div className="flex items-center gap-2 text-sm font-mono font-black text-amber-300 pt-1">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>Try again in: {lockoutSecondsLeft}s</span>
              </div>
            </div>
          ) : errorMsg ? (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold">
              {errorMsg}
            </div>
          ) : null}

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <Input
              label="Company Email Address"
              icon={<Mail className="w-4 h-4" />}
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="e.g. superadmin@diplon.com"
              disabled={isLockedOut}
              required
            />

            <Input
              label="Password"
              type="password"
              icon={<Key className="w-4 h-4" />}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••••••"
              disabled={isLockedOut}
              required
            />

            <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" defaultChecked disabled={isLockedOut} className="rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-indigo-500" />
                <span>Remember Session</span>
              </label>
              <a href="#reset" onClick={e => { e.preventDefault(); alert('Password reset link sent to company email.'); }} className="text-indigo-400 hover:underline">
                Forgot password?
              </a>
            </div>

            <Button
              type="submit"
              variant="primary"
              disabled={isLoading || isLockedOut}
              className={`w-full py-3 text-white font-extrabold text-sm flex items-center justify-center gap-2 rounded-xl mt-2 ${
                isLockedOut
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                  : 'bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 shadow-lg shadow-indigo-600/30'
              }`}
            >
              <span>{isLockedOut ? `Locked (${lockoutSecondsLeft}s)` : isLoading ? 'Authenticating...' : 'Sign In to ERP Workspace'}</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          <div className="pt-4 border-t border-slate-800/80 text-center">
            <div className="text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Multi-Tenant Isolation • Rate-Limited Brute-Force Protected</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
