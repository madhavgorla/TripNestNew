import React, { useState } from 'react';
import { X, LogIn, Mail, Lock, Sparkles, CheckCircle2, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { loginWithGoogle, login } = useAuth();
  const [email, setEmail] = useState('madhugorla497@gmail.com');
  const [password, setPassword] = useState('password123');
  const [fullName, setFullName] = useState('Madhu Gorla');
  const [showAccountSwitch, setShowAccountSwitch] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const success = await loginWithGoogle({
        email: email.trim() || 'madhugorla497@gmail.com',
        fullName: fullName.trim() || 'Madhu Gorla',
        avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      });
      if (success) {
        if (onSuccess) onSuccess();
        onClose();
      } else {
        setErrorMsg('Google login could not be completed. Please try again.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error connecting to Google services');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMsg('Please enter your email address');
      return;
    }
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const success = await login(email.trim(), password);
      if (success) {
        if (onSuccess) onSuccess();
        onClose();
      } else {
        // Fallback: if not in database, log in with Google profile seamlessly
        const gSuccess = await loginWithGoogle({
          email: email.trim(),
          fullName: email.split('@')[0],
        });
        if (gSuccess) {
          if (onSuccess) onSuccess();
          onClose();
        } else {
          setErrorMsg('Invalid email or credentials. Please try again.');
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl dark:border-slate-800 dark:bg-slate-900 z-10 animate-in zoom-in-95 duration-150">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 shadow-xs dark:bg-indigo-950/60">
            <LogIn className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white font-display">
            Log In to TripNest
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Sign in to access your travel itineraries, bookings, and shared expenses.
          </p>
        </div>

        {errorMsg && (
          <div className="mt-4 rounded-xl bg-rose-50 p-3 text-xs text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
            {errorMsg}
          </div>
        )}

        <div className="mt-6 space-y-4">
          {/* Primary Action: Log In with Google */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="flex w-full items-center justify-center gap-3 rounded-2xl border-2 border-slate-200 bg-white py-3 px-4 text-xs font-bold text-slate-800 hover:bg-slate-50 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-750 transition-all cursor-pointer shadow-xs disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
            ) : (
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
            )}
            <span>Continue with Google ({email})</span>
          </button>

          {/* Account switcher toggle */}
          <div className="text-center">
            <button
              type="button"
              onClick={() => setShowAccountSwitch(!showAccountSwitch)}
              className="text-[11px] font-semibold text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 cursor-pointer"
            >
              {showAccountSwitch ? '▲ Use default account' : '▼ Change Google email address'}
            </button>
          </div>

          {showAccountSwitch && (
            <div className="space-y-2 rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 animate-in fade-in">
              <div>
                <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 mb-0.5">
                  Google Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  placeholder="name@gmail.com"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 mb-0.5">
                  Your Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  placeholder="Your Name"
                />
              </div>
            </div>
          )}

          {/* Divider */}
          <div className="relative my-3">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-800" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-bold text-slate-400">
              <span className="bg-white px-3 dark:bg-slate-900">or sign in with email</span>
            </div>
          </div>

          {/* Email / Password Form */}
          <form onSubmit={handleEmailLogin} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@domain.com"
                  className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-2.5 px-4 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 transition-all cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <LogIn className="w-4 h-4" />
              )}
              <span>Log In</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
