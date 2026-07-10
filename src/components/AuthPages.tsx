import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Building2, Mail, Lock, User as UserIcon, Shield, ArrowRight, CheckCircle } from 'lucide-react';
import { UserRole } from '../types';

interface AuthPagesProps {
  onAuthSuccess: (token: string, user: any) => void;
}

export default function AuthPages({ onAuthSuccess }: AuthPagesProps) {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [email, setEmail] = useState('nwokolopaul979@gmail.com'); // Pre-fill for ease of use
  const [password, setPassword] = useState('password123');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('Admin');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfo('');
    setLoading(true);

    try {
      if (mode === 'login') {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Login failed');
        onAuthSuccess(data.token, data.user);
      } else if (mode === 'register') {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, name, role })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Registration failed');
        onAuthSuccess(data.token, data.user);
      } else {
        const res = await fetch('/api/auth/forgot-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to send reset email');
        setInfo('A password reset link has been dispatched to your email address.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative Grid Lines */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30" />
      
      {/* Glowing Blob */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex items-center justify-center space-x-3 mb-6">
          <div className="bg-indigo-600 p-2.5 rounded-xl shadow-md shadow-indigo-600/10 flex items-center justify-center">
            <Building2 className="h-7 w-7 text-white" />
          </div>
          <span className="text-3xl font-bold tracking-tight text-slate-900 font-sans">
            Estate<span className="text-indigo-600">OS</span>
          </span>
        </div>
        <h2 className="text-center text-sm font-semibold text-slate-500 font-mono tracking-wider uppercase">
          {mode === 'login' && 'Enterprise Portal Sign In'}
          {mode === 'register' && 'Onboard Organization'}
          {mode === 'forgot' && 'Credentials Recovery'}
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white border border-slate-200 py-8 px-4 shadow-xl rounded-2xl sm:px-10"
        >
          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-rose-50 border border-rose-100 text-rose-700 px-4 py-3 rounded-xl text-sm font-medium">
                {error}
              </div>
            )}

            {info && (
              <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 px-4 py-3 rounded-xl text-sm flex items-start space-x-2 font-medium">
                <CheckCircle className="h-5 w-5 shrink-0 text-emerald-600 mt-0.5" />
                <span>{info}</span>
              </div>
            )}

            {mode === 'register' && (
              <div>
                <label className="block text-sm font-semibold text-slate-700 font-sans mb-1.5" htmlFor="name">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <UserIcon className="h-5 w-5" />
                  </div>
                  <input
                    id="name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 text-sm"
                    placeholder="Chidi U."
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-slate-700 font-sans mb-1.5" htmlFor="email">
                Professional Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 text-sm"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            {mode !== 'forgot' && (
              <div>
                <label className="block text-sm font-semibold text-slate-700 font-sans mb-1.5" htmlFor="password">
                  Security Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="h-5 w-5" />
                  </div>
                  <input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 text-sm"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            )}

            {mode === 'register' && (
              <div>
                <label className="block text-sm font-semibold text-slate-700 font-sans mb-1.5" htmlFor="role">
                  Enterprise Role
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Shield className="h-5 w-5" />
                  </div>
                  <select
                    id="role"
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="block w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 text-sm appearance-none"
                  >
                    <option value="Admin">Admin (Executive Director)</option>
                    <option value="Executive">Executive (Asset Partner)</option>
                    <option value="Sales">Sales (Senior Relationship Mgr)</option>
                    <option value="Marketing">Marketing (Growth Specialist)</option>
                    <option value="Viewer">Viewer (External Audit / Client)</option>
                  </select>
                </div>
              </div>
            )}

            {mode === 'login' && (
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded bg-white"
                    defaultChecked
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-xs text-slate-500">
                    Remember station
                  </label>
                </div>

                <div className="text-xs">
                  <button
                    type="button"
                    onClick={() => { setMode('forgot'); setError(''); setInfo(''); }}
                    className="font-semibold text-indigo-600 hover:text-indigo-500"
                  >
                    Forgot passphrase?
                  </button>
                </div>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-xl shadow-md text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-white transition duration-150 disabled:opacity-50 cursor-pointer"
              >
                {loading ? 'Processing...' : (
                  <>
                    <span>
                      {mode === 'login' && 'Authenticate Station'}
                      {mode === 'register' && 'Onboard Team Station'}
                      {mode === 'forgot' && 'Dispatch Reset Token'}
                    </span>
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 border-t border-slate-100 pt-4 text-center">
            {mode === 'login' ? (
              <p className="text-xs text-slate-500 font-medium">
                New organization Node?{' '}
                <button
                  onClick={() => { setMode('register'); setError(''); setInfo(''); }}
                  className="font-semibold text-indigo-600 hover:text-indigo-500"
                >
                  Onboard here
                </button>
              </p>
            ) : (
              <p className="text-xs text-slate-500 font-medium">
                Ready to authenticate?{' '}
                <button
                  onClick={() => { setMode('login'); setError(''); setInfo(''); }}
                  className="font-semibold text-indigo-600 hover:text-indigo-500"
                >
                  Sign in instead
                </button>
              </p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
