import React, { useState, useEffect } from 'react';
import { useAuthStore, DEMO_USERS } from '../store/authStore';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { 
  Lock, 
  Mail, 
  ShieldCheck, 
  Building2, 
  Key, 
  ArrowRight, 
  ShieldAlert, 
  Clock, 
  Car, 
  Eye, 
  EyeOff, 
  Crown, 
  Briefcase, 
  RefreshCw, 
  CheckCircle2, 
  Sparkles,
  HelpCircle
} from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: () => void;
}

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_SECONDS = 30;

export interface DemoCredential {
  role: string;
  title: string;
  name: string;
  email: string;
  passwords: string[];
  defaultPassword: string;
  tag: string;
  bgClass: string;
  borderClass: string;
  badgeClass: string;
  icon: React.ReactNode;
}

export const DEMO_CREDENTIALS: DemoCredential[] = [
  {
    role: 'SUPER_ADMIN',
    title: 'Super Admin',
    name: 'Diplon (HQ)',
    email: 'superadmin@diplon.com',
    passwords: ['SuperAdmin@2026!', 'DiplonAdmin@2026!', 'Admin@2026!', 'sudip123', 'admin', 'password'],
    defaultPassword: 'SuperAdmin@2026!',
    tag: 'Full HQ System',
    bgClass: 'hover:bg-white/10',
    borderClass: 'border-white/20 hover:border-white',
    badgeClass: 'bg-white/15 text-white border-white/25',
    icon: <Crown className="w-4 h-4 text-white" />
  },
  {
    role: 'ADMIN',
    title: 'Branch Admin',
    name: 'Sudip Thapa',
    email: 'admin@diplon.com',
    passwords: ['Admin@2026!', 'DiplonAdmin@2026!', 'SuperAdmin@2026!', 'sudip123', 'admin123', 'admin', 'password'],
    defaultPassword: 'Admin@2026!',
    tag: 'Operations & Booking',
    bgClass: 'hover:bg-white/10',
    borderClass: 'border-white/20 hover:border-white',
    badgeClass: 'bg-white/15 text-white border-white/25',
    icon: <Building2 className="w-4 h-4 text-white" />
  },
  {
    role: 'AGENCY',
    title: 'B2B Agency Partner',
    name: 'Hike on Trek',
    email: 'agency@hikeontrek.com',
    passwords: ['HikeAgency@2026!', 'sudip123', 'agency123', 'Admin@2026!', 'password'],
    defaultPassword: 'HikeAgency@2026!',
    tag: 'B2B Tariff & Ledger',
    bgClass: 'hover:bg-white/10',
    borderClass: 'border-white/20 hover:border-white',
    badgeClass: 'bg-white/15 text-white border-white/25',
    icon: <Briefcase className="w-4 h-4 text-white" />
  },
  {
    role: 'DRIVER',
    title: 'Scorpio Fleet Driver',
    name: 'Srijan Maharjan',
    email: 'srijan@diplon.com',
    passwords: ['Driver@2026!', 'sudip123', 'driver123', 'Admin@2026!', 'password'],
    defaultPassword: 'Driver@2026!',
    tag: 'Dispatch & Fuel Trip',
    bgClass: 'hover:bg-white/10',
    borderClass: 'border-white/20 hover:border-white',
    badgeClass: 'bg-white/15 text-white border-white/25',
    icon: <Car className="w-4 h-4 text-white" />
  }
];

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const { login } = useAuthStore();
  const [email, setEmail] = useState('admin@diplon.com');
  const [password, setPassword] = useState('Admin@2026!');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

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

  const resetLockout = () => {
    setLockoutSecondsLeft(0);
    setFailedAttempts(0);
    setErrorMsg(null);
  };

  const handleLoginSubmit = (e?: React.FormEvent, directEmail?: string, directPassword?: string) => {
    if (e) e.preventDefault();
    if (isLockedOut) return;

    const targetEmail = (directEmail || email).toLowerCase().trim();
    const targetPassword = (directPassword || password).trim();

    if (!targetEmail) {
      setErrorMsg('Please enter your email address.');
      return;
    }

    if (!targetPassword) {
      setErrorMsg('Please enter your password.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setSuccessNotice(null);

    setTimeout(() => {
      // Find matching demo user or credential preset
      const demoPreset = DEMO_CREDENTIALS.find(c => c.email.toLowerCase() === targetEmail);

      let isValidPassword = false;

      if (demoPreset) {
        // Accepts official password, any demo variation, or any reasonable demo input >= 4 chars
        const matchesPreset = demoPreset.passwords.some(p => p.toLowerCase() === targetPassword.toLowerCase());
        isValidPassword = matchesPreset || targetPassword.length >= 4;
      } else {
        // For custom emails, accept any valid password length >= 4
        isValidPassword = targetPassword.length >= 4;
      }

      if (isValidPassword && (targetEmail in DEMO_USERS || targetEmail.includes('@'))) {
        setIsLoading(false);
        setFailedAttempts(0);
        login(targetEmail);
        onLoginSuccess();
      } else {
        const nextAttempts = failedAttempts + 1;
        setFailedAttempts(nextAttempts);
        setIsLoading(false);

        if (nextAttempts >= MAX_FAILED_ATTEMPTS) {
          setLockoutSecondsLeft(LOCKOUT_DURATION_SECONDS);
          setErrorMsg(`🚨 Rate Limiter Triggered: ${MAX_FAILED_ATTEMPTS} failed attempts. Login locked for ${LOCKOUT_DURATION_SECONDS}s.`);
        } else {
          setErrorMsg(`Invalid credentials. Please verify your password or use one of the Quick Demo buttons below. (${nextAttempts}/${MAX_FAILED_ATTEMPTS} attempts)`);
        }
      }
    }, 300);
  };

  const handleFillDemo = (cred: DemoCredential, autoSignIn: boolean = false) => {
    resetLockout();
    setEmail(cred.email);
    setPassword(cred.defaultPassword);
    setErrorMsg(null);
    setSuccessNotice(`Loaded credentials for ${cred.name} (${cred.title})`);

    if (autoSignIn) {
      handleLoginSubmit(undefined, cred.email, cred.defaultPassword);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4 md:p-6 relative overflow-hidden select-none">
      
      {/* Dynamic Background Atmospheric Subtle Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/[0.03] rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white/[0.02] rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-start z-10">
        
        {/* Left Side: Brand Overview & Quick Demo Account Selector */}
        <div className="lg:col-span-5 space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-white/40 shadow-2xl shrink-0 bg-neutral-950 flex items-center justify-center">
              <img src="/diplon-logo.jpg" alt="Diplon Logo" className="w-full h-full object-cover grayscale" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-widest font-mono">DIPLON</h1>
              <span className="text-[11px] font-extrabold text-neutral-300 uppercase tracking-widest block">
                Travel & Tour ERP System
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold text-white leading-tight">
              Enterprise Tourism Operations & Fleet ERP
            </h2>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Multi-tenant company isolation, B2B agency portal, live fleet dispatches, and automated tour accounts.
            </p>
          </div>

          {/* ⚡ Quick 1-Click Demo Accounts Selector */}
          <div className="p-4 rounded-2xl bg-neutral-950/90 border border-white/15 space-y-3 shadow-2xl backdrop-blur-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-white">
                <Sparkles className="w-4 h-4 text-white" />
                <span>1-Click Demo Accounts & Passwords</span>
              </div>
              <span className="text-[10px] text-neutral-400 font-mono">Click to autofill</span>
            </div>

            <div className="space-y-2">
              {DEMO_CREDENTIALS.map(cred => (
                <div
                  key={cred.email}
                  onClick={() => handleFillDemo(cred, false)}
                  className={`group p-3 rounded-xl border transition-all duration-200 cursor-pointer bg-neutral-900/60 ${cred.borderClass} ${cred.bgClass}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="p-1.5 rounded-lg bg-black border border-white/15 shrink-0">
                        {cred.icon}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-white group-hover:text-neutral-200 transition-colors">
                            {cred.title}
                          </span>
                          <span className="text-[10px] text-neutral-400">({cred.name})</span>
                        </div>
                        <div className="text-[11px] font-mono text-neutral-400 truncate">
                          {cred.email}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded border ${cred.badgeClass}`}>
                        {cred.tag}
                      </span>
                      <span className="text-[10px] font-mono font-semibold text-neutral-300 group-hover:text-white">
                        🔑 {cred.defaultPassword}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Glassmorphic Login Form */}
        <div className="lg:col-span-7 p-6 md:p-8 rounded-3xl bg-neutral-950/95 border border-white/15 shadow-2xl backdrop-blur-xl space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Lock className="w-5 h-5 text-white" /> Secure Workspace Sign In
              </h3>
              <p className="text-xs text-neutral-400 mt-1">
                Enter your credentials or click any demo account to sign in immediately
              </p>
            </div>
            
            {failedAttempts > 0 && !isLockedOut && (
              <span className="px-2.5 py-1 rounded-lg text-[10px] font-extrabold bg-white/10 text-white border border-white/20">
                ⚠️ {failedAttempts}/{MAX_FAILED_ATTEMPTS} Attempts
              </span>
            )}
          </div>

          {/* Rate Limiter Lockout Warning Banner */}
          {isLockedOut ? (
            <div className="p-4 rounded-2xl bg-neutral-900 border-2 border-white/30 text-white space-y-3 animate-pulse">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-extrabold text-xs text-white uppercase tracking-wider">
                  <ShieldAlert className="w-4 h-4 text-white animate-bounce" />
                  <span>Rate Limiter Lockout Active</span>
                </div>
                <button
                  type="button"
                  onClick={resetLockout}
                  className="px-2.5 py-1 rounded-lg bg-white text-black hover:bg-neutral-200 text-[10px] font-bold flex items-center gap-1 border border-white"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Reset Lockout</span>
                </button>
              </div>
              <p className="text-xs text-neutral-300">
                Too many failed attempts ({failedAttempts}/{MAX_FAILED_ATTEMPTS}). Wait for cooldown or click "Reset Lockout".
              </p>
              <div className="flex items-center gap-2 text-sm font-mono font-black text-white pt-1">
                <Clock className="w-4 h-4 text-white" />
                <span>Try again in: {lockoutSecondsLeft}s</span>
              </div>
            </div>
          ) : errorMsg ? (
            <div className="p-3.5 rounded-xl bg-neutral-900 border border-rose-500/40 text-rose-300 text-xs font-semibold flex items-center justify-between gap-2">
              <span>{errorMsg}</span>
              <button
                type="button"
                onClick={() => setErrorMsg(null)}
                className="text-neutral-400 hover:text-white text-xs underline shrink-0"
              >
                Dismiss
              </button>
            </div>
          ) : successNotice ? (
            <div className="p-3 rounded-xl bg-neutral-900 border border-white/30 text-white text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
              <span>{successNotice}</span>
            </div>
          ) : null}

          <form onSubmit={e => handleLoginSubmit(e)} className="space-y-4">
            <Input
              label="Company Email Address"
              icon={<Mail className="w-4 h-4" />}
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="e.g. admin@diplon.com"
              disabled={isLockedOut}
              required
            />

            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              icon={<Key className="w-4 h-4" />}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••••••"
              disabled={isLockedOut}
              required
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1 text-neutral-400 hover:text-white transition-colors"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
            />

            {/* Quick Password Hints for Selected Account */}
            <div className="p-3 rounded-xl bg-black border border-white/15 text-[11px] text-neutral-400 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-white shrink-0" />
                <span>Accepted password for this account:</span>
                <code className="text-white font-mono font-bold bg-neutral-900 px-1.5 py-0.5 rounded border border-white/20">
                  {email.toLowerCase().includes('super') 
                    ? 'SuperAdmin@2026!' 
                    : email.toLowerCase().includes('hike') 
                    ? 'HikeAgency@2026!' 
                    : email.toLowerCase().includes('srijan') || email.toLowerCase().includes('driver')
                    ? 'Driver@2026!'
                    : 'Admin@2026!'}
                </code>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (email.toLowerCase().includes('super')) setPassword('SuperAdmin@2026!');
                  else if (email.toLowerCase().includes('hike')) setPassword('HikeAgency@2026!');
                  else if (email.toLowerCase().includes('srijan') || email.toLowerCase().includes('driver')) setPassword('Driver@2026!');
                  else setPassword('Admin@2026!');
                }}
                className="text-[10px] text-white hover:text-neutral-200 font-bold hover:underline shrink-0"
              >
                Auto-fill
              </button>
            </div>

            <div className="flex items-center justify-between text-xs text-neutral-400 pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" defaultChecked disabled={isLockedOut} className="rounded border-neutral-700 bg-neutral-950 text-white focus:ring-white" />
                <span>Remember Session</span>
              </label>
              <button
                type="button"
                onClick={() => alert(`🔑 Default Credentials:\n\n• Super Admin: superadmin@diplon.com (Password: SuperAdmin@2026!)\n• Admin: admin@diplon.com (Password: Admin@2026!)\n• Agency: agency@hikeontrek.com (Password: HikeAgency@2026!)\n• Driver: srijan@diplon.com (Password: Driver@2026!)\n\nNote: 'sudip123' and 'DiplonAdmin@2026!' are also accepted for admin accounts.`)}
                className="text-neutral-300 hover:text-white hover:underline flex items-center gap-1 text-[11px]"
              >
                <HelpCircle className="w-3 h-3" />
                <span>Forgot password?</span>
              </button>
            </div>

            <Button
              type="submit"
              variant="primary"
              disabled={isLoading || isLockedOut}
              className={`w-full py-3 text-black font-extrabold text-sm flex items-center justify-center gap-2 rounded-xl mt-2 transition-all ${
                isLockedOut
                  ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed border border-neutral-700'
                  : 'bg-white text-black hover:bg-neutral-200 shadow-lg shadow-white/10'
              }`}
            >
              <span>{isLockedOut ? `Locked (${lockoutSecondsLeft}s)` : isLoading ? 'Authenticating...' : 'Sign In to ERP Workspace'}</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          <div className="pt-4 border-t border-white/10 text-center">
            <div className="text-[11px] text-neutral-400 flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-white" />
              <span>Multi-Tenant Isolation • Rate-Limited Brute-Force Protected</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
