import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Shield, Users, Package, CheckSquare, Sparkles,
  ArrowRight, RefreshCw, AlertCircle, Database, Layers
} from 'lucide-react';

export function AdminDashboardPage({ setCurrentView, openArchModal }) {
  const { user, isAdmin } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getAdminStats();
      setStats(data);
    } catch (err) {
      console.error('Error fetching admin statistics:', err);
      setError(err.message || 'Failed to load administrator metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto py-16 px-4 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
          <Shield className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Access Denied (403 Forbidden)</h2>
        <p className="text-xs text-slate-500">
          This portal requires administrator privileges. You are currently logged in as a Student.
        </p>
        <button
          onClick={() => setCurrentView('home')}
          className="px-4 py-2 bg-slate-900 text-white rounded text-xs font-semibold"
        >
          Return to Public Portal
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-mono text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200 mb-1">
            <span>ADMINISTRATIVE PORTAL</span>
            <span>•</span>
            <span>ROLE = ADMIN</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">University Administrative Dashboard</h1>
          <p className="text-xs text-slate-500">Campus-wide lost belongings registry overview and claim verification desk</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={openArchModal}
            className="px-3.5 py-1.5 text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200 rounded hover:bg-indigo-100 flex items-center gap-1.5 cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Viva Architecture</span>
          </button>

          <button
            onClick={fetchStats}
            className="px-3.5 py-1.5 text-xs font-medium border border-slate-300 rounded text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Stats</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Database Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs">
          <div className="flex justify-between items-center text-slate-500 text-xs font-medium mb-1">
            <span>Registered Users</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono">
            {loading ? '...' : stats?.totalUsers || 0}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Students & staff accounts</p>
        </div>

        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs">
          <div className="flex justify-between items-center text-rose-700 text-xs font-medium mb-1">
            <span>Total Lost Items</span>
            <Package className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-bold text-rose-700 font-mono">
            {loading ? '...' : stats?.totalLostItems || 0}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Active missing reports</p>
        </div>

        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs">
          <div className="flex justify-between items-center text-emerald-700 text-xs font-medium mb-1">
            <span>Total Found Items</span>
            <Package className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-emerald-700 font-mono">
            {loading ? '...' : stats?.totalFoundItems || 0}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Deposited in campus care</p>
        </div>

        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs">
          <div className="flex justify-between items-center text-amber-700 text-xs font-medium mb-1">
            <span>Pending Claims</span>
            <CheckSquare className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-amber-700 font-mono">
            {loading ? '...' : stats?.pendingClaims || 0}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Awaiting admin decision</p>
        </div>
      </div>

      {/* Secondary Status Counts */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
          <span className="text-xs text-slate-500 block">Active In Registry</span>
          <span className="text-xl font-bold text-slate-900 font-mono">{loading ? '...' : stats?.activeItems || 0}</span>
        </div>
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
          <span className="text-xs text-slate-500 block">Claim Approved</span>
          <span className="text-xl font-bold text-purple-700 font-mono">{loading ? '...' : stats?.claimedItems || 0}</span>
        </div>
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
          <span className="text-xs text-slate-500 block">Returned to Owner</span>
          <span className="text-xl font-bold text-teal-700 font-mono">{loading ? '...' : stats?.returnedItems || 0}</span>
        </div>
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
          <span className="text-xs text-slate-500 block">Resolved / Closed</span>
          <span className="text-xl font-bold text-slate-700 font-mono">{loading ? '...' : stats?.resolvedItems || 0}</span>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div
          onClick={() => setCurrentView('admin-claims')}
          className="bg-white p-6 rounded-lg border border-slate-200 hover:border-indigo-400 transition-colors cursor-pointer shadow-xs group"
        >
          <div className="flex justify-between items-start mb-3">
            <div className="p-2.5 bg-amber-50 text-amber-700 rounded-md">
              <CheckSquare className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
          </div>
          <h3 className="font-semibold text-slate-900 text-base mb-1">Review Pending Claims</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Inspect ownership proof submitted by students, verify identifying marks, and accept or reject claims with admin notes.
          </p>
        </div>

        <div
          onClick={() => setCurrentView('admin-items')}
          className="bg-white p-6 rounded-lg border border-slate-200 hover:border-indigo-400 transition-colors cursor-pointer shadow-xs group"
        >
          <div className="flex justify-between items-start mb-3">
            <div className="p-2.5 bg-indigo-50 text-indigo-700 rounded-md">
              <Package className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
          </div>
          <h3 className="font-semibold text-slate-900 text-base mb-1">Manage All Items</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Full inventory control across both Lost and Found catalogs. Update item statuses to Returned or Resolved.
          </p>
        </div>

        <div
          onClick={() => setCurrentView('admin-users')}
          className="bg-white p-6 rounded-lg border border-slate-200 hover:border-indigo-400 transition-colors cursor-pointer shadow-xs group"
        >
          <div className="flex justify-between items-start mb-3">
            <div className="p-2.5 bg-slate-100 text-slate-700 rounded-md">
              <Users className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
          </div>
          <h3 className="font-semibold text-slate-900 text-base mb-1">User Directory</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Audit registered student and staff accounts. Verify college email domains and official university Student IDs.
          </p>
        </div>
      </div>
    </div>
  );
}
