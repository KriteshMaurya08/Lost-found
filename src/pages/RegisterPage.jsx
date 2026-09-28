import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  validateEmail, validatePhone, validateStudentId,
  validatePassword, validateConfirmPassword, validateRequired
} from '../utils/validation';
import { User, Mail, Phone, Shield, Lock, AlertCircle, CheckCircle } from 'lucide-react';

export function RegisterPage({ setCurrentView }) {
  const { register } = useAuth();
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    studentId: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    const nameErr = validateRequired(form.fullName, 'Full Name');
    const emailErr = validateEmail(form.email);
    const phoneErr = validatePhone(form.phone);
    const idErr = validateStudentId(form.studentId);
    const passErr = validatePassword(form.password);
    const confirmErr = validateConfirmPassword(form.password, form.confirmPassword);

    if (nameErr) newErrors.fullName = nameErr;
    if (emailErr) newErrors.email = emailErr;
    if (phoneErr) newErrors.phone = phoneErr;
    if (idErr) newErrors.studentId = idErr;
    if (passErr) newErrors.password = passErr;
    if (confirmErr) newErrors.confirmPassword = confirmErr;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setLoading(true);
      setApiError(null);
      await register(form);
      setCurrentView('home');
    } catch (err) {
      setApiError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-12 space-y-6">
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Create Student / Staff Account</h1>
        <p className="text-xs text-slate-500">Register with your official college credentials to submit and track reports</p>
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
            <label className="block text-slate-700 font-semibold mb-1">Full Legal Name *</label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                required
                placeholder="Aarav Sharma"
                value={form.fullName}
                onChange={(e) => {
                  setForm({ ...form, fullName: e.target.value });
                  if (errors.fullName) setErrors({ ...errors, fullName: null });
                }}
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-md focus:ring-1 focus:ring-indigo-600 focus:outline-hidden"
              />
            </div>
            {errors.fullName && <p className="text-rose-600 mt-1 text-[11px]">{errors.fullName}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">College Email Address *</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="student@campus.edu"
                  value={form.email}
                  onChange={(e) => {
                    setForm({ ...form, email: e.target.value });
                    if (errors.email) setErrors({ ...errors, email: null });
                  }}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-md focus:ring-1 focus:ring-indigo-600 focus:outline-hidden"
                />
              </div>
              {errors.email && <p className="text-rose-600 mt-1 text-[11px]">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Phone Number *</label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="tel"
                  required
                  placeholder="9876543210"
                  value={form.phone}
                  onChange={(e) => {
                    setForm({ ...form, phone: e.target.value });
                    if (errors.phone) setErrors({ ...errors, phone: null });
                  }}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-md focus:ring-1 focus:ring-indigo-600 focus:outline-hidden"
                />
              </div>
              {errors.phone && <p className="text-rose-600 mt-1 text-[11px]">{errors.phone}</p>}
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Student / Staff ID Number *</label>
            <div className="relative">
              <Shield className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                required
                placeholder="STU-2024-108 or EMP-104"
                value={form.studentId}
                onChange={(e) => {
                  setForm({ ...form, studentId: e.target.value });
                  if (errors.studentId) setErrors({ ...errors, studentId: null });
                }}
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-md focus:ring-1 focus:ring-indigo-600 focus:outline-hidden font-mono"
              />
            </div>
            {errors.studentId && <p className="text-rose-600 mt-1 text-[11px]">{errors.studentId}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Password * (Min 6 chars)</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => {
                    setForm({ ...form, password: e.target.value });
                    if (errors.password) setErrors({ ...errors, password: null });
                  }}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-md focus:ring-1 focus:ring-indigo-600 focus:outline-hidden"
                />
              </div>
              {errors.password && <p className="text-rose-600 mt-1 text-[11px]">{errors.password}</p>}
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Confirm Password *</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={form.confirmPassword}
                  onChange={(e) => {
                    setForm({ ...form, confirmPassword: e.target.value });
                    if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: null });
                  }}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-md focus:ring-1 focus:ring-indigo-600 focus:outline-hidden"
                />
              </div>
              {errors.confirmPassword && <p className="text-rose-600 mt-1 text-[11px]">{errors.confirmPassword}</p>}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-slate-900 text-white rounded-md text-sm font-semibold hover:bg-slate-800 transition-colors cursor-pointer shadow-xs mt-2"
          >
            {loading ? 'Creating Record in MySQL...' : 'Register Account'}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-100">
          <p className="text-xs text-slate-500">
            Already registered?{' '}
            <button
              onClick={() => setCurrentView('login')}
              className="text-indigo-600 font-semibold hover:underline cursor-pointer"
            >
              Sign In to existing account
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
