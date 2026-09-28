import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Badge } from '../components/common/Badge';
import { User, Mail, Phone, Shield, CheckCircle, AlertCircle, Save } from 'lucide-react';

export function ProfilePage({ setCurrentView }) {
  const { user, isAuthenticated, updateProfile } = useAuth();

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isAuthenticated || !user) {
    return (
      <div className="max-w-md mx-auto py-16 px-4 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Sign In Required</h2>
        <p className="text-xs text-slate-500">Please sign in to view and manage your university account profile.</p>
        <button
          onClick={() => setCurrentView('login')}
          className="px-4 py-2 bg-slate-900 text-white rounded text-xs font-semibold"
        >
          Sign In
        </button>
      </div>
    );
  }

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!fullName || !phone) {
      setErrorMsg('Full name and phone cannot be empty');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg('');
      await updateProfile(fullName, phone);
      setSuccessMsg('Profile information updated in MySQL successfully');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="pb-6 border-b border-slate-200">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">University Profile</h1>
        <p className="text-xs text-slate-500">Manage your contact details and view official campus credentials</p>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-md text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-md text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        {/* User Card Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-slate-900 text-white font-bold text-xl flex items-center justify-center font-mono">
              {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 leading-tight">{user.fullName}</h2>
              <p className="text-xs text-slate-500 font-mono mt-0.5">Student ID: {user.studentId}</p>
            </div>
          </div>
          <Badge type={user.role} label={user.role} />
        </div>

        {/* Read-Only Account Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200 text-xs">
          <div>
            <span className="text-slate-400 block mb-0.5 font-medium">Registered College Email</span>
            <span className="font-semibold text-slate-800 font-mono">{user.email}</span>
          </div>
          <div>
            <span className="text-slate-400 block mb-0.5 font-medium">Student / Staff Roll ID</span>
            <span className="font-semibold text-slate-800 font-mono">{user.studentId}</span>
          </div>
          <div>
            <span className="text-slate-400 block mb-0.5 font-medium">Role Authorization</span>
            <span className="font-semibold text-slate-800">{user.role}</span>
          </div>
          <div>
            <span className="text-slate-400 block mb-0.5 font-medium">Database Persistence</span>
            <span className="font-semibold text-slate-800 font-mono">MySQL `users` table</span>
          </div>
        </div>

        {/* Editable Profile Form */}
        <form onSubmit={handleUpdate} className="space-y-4 text-xs pt-2">
          <h3 className="font-bold text-slate-900 text-sm">Update Contact Details</h3>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Full Legal Name *</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full p-2.5 border border-slate-300 rounded-md text-sm focus:ring-1 focus:ring-indigo-600 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Contact Phone Number *</label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full p-2.5 border border-slate-300 rounded-md text-sm focus:ring-1 focus:ring-indigo-600 focus:outline-hidden"
            />
          </div>

          <div className="pt-3 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-slate-900 text-white rounded-md text-xs font-semibold hover:bg-slate-800 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{loading ? 'Saving Changes...' : 'Save Profile Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
