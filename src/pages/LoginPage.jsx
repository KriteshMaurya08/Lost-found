import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { validateEmail, validatePassword } from '../utils/validation';
import { Lock, Mail, AlertCircle, CheckCircle, Shield, User } from 'lucide-react';

export function LoginPage({ setCurrentView, openArchModal }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    const emailErr = validateEmail(email);
    const passErr = validatePassword(password);
    if (emailErr) newErrors.email = emailErr;
    if (passErr) newErrors.password = passErr;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setLoading(true);
      setApiError(null);
      await login(email, password);
      setCurrentView('home');
    } catch (err) {
      setApiError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setErrors({});
    setApiError(null);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 space-y-6">
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">University Portal Sign In</h1>
        <p className="text-xs text-slate-500">Access your reports, submit claims, or manage campus items</p>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-xs space-y-5">
        {apiError && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-md text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{apiError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 font-semibold mb-1">College Email Address *</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="email"
                required
                placeholder="student@campus.edu or admin@campus.edu"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors({ ...errors, email: null });
                }}
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-md focus:ring-1 focus:ring-indigo-600 focus:outline-hidden"
              />
            </div>
            {errors.email && <p className="text-rose-600 mt-1 text-[11px]">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Password *</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors({ ...errors, password: null });
                }}
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-md focus:ring-1 focus:ring-indigo-600 focus:outline-hidden"
              />
            </div>
            {errors.password && <p className="text-rose-600 mt-1 text-[11px]">{errors.password}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-slate-900 text-white rounded-md text-sm font-semibold hover:bg-slate-800 transition-colors cursor-pointer shadow-xs"
          >
            {loading ? 'Authenticating with MySQL...' : 'Sign In'}
          </button>
        </form>

        {/* System Admin Credentials Notice */}
        <div className="pt-4 border-t border-slate-200">
          <div className="border border-indigo-200 rounded-lg p-3 bg-indigo-50/50">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[11px] font-semibold text-indigo-900 uppercase tracking-wider flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-indigo-600" /> System Administrator Account
              </span>
              <button
                type="button"
                onClick={() => handleQuickFill('admin@campus.edu', 'Admin@123')}
                className="text-[11px] font-semibold text-indigo-700 hover:text-indigo-900 underline cursor-pointer"
              >
                Auto-Fill
              </button>
            </div>
            <p className="text-[11px] text-slate-600 font-mono">admin@campus.edu / Admin@123</p>
            <p className="text-[10px] text-slate-500 mt-1">Students must register an account with their official Student ID.</p>
          </div>
        </div>

        <div className="text-center pt-2">
          <p className="text-xs text-slate-500">
            Don't have an account yet?{' '}
            <button
              onClick={() => setCurrentView('register')}
              className="text-indigo-600 font-semibold hover:underline cursor-pointer"
            >
              Register here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
