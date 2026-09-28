import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Badge } from '../components/common/Badge';
import { FileText, ArrowRight, CheckCircle2, AlertCircle, PlusCircle, Calendar, MapPin } from 'lucide-react';

export function MyReportsPage({ setCurrentView, setSelectedItemId }) {
  const { user, isAuthenticated } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL', 'LOST', 'FOUND'
  const [error, setError] = useState(null);

  const fetchMyReports = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getMyReports();
      setReports(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching my reports:', err);
      setError(err.message || 'Failed to load your reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchMyReports();
    }
  }, [isAuthenticated]);

  const handleUpdateStatus = async (id, status) => {
    try {
      await api.updateItemStatus(id, status);
      fetchMyReports();
    } catch (err) {
      alert('Failed to update report status: ' + err.message);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto py-16 px-4 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Sign In Required</h2>
        <p className="text-xs text-slate-500">You must be logged in to view your filed lost and found reports.</p>
        <button
          onClick={() => setCurrentView('login')}
          className="px-4 py-2 bg-slate-900 text-white rounded text-xs font-semibold"
        >
          Go to Sign In
        </button>
      </div>
    );
  }

  const filteredReports = activeTab === 'ALL' ? reports : reports.filter((r) => r.type === activeTab);
  const lostCount = reports.filter((r) => r.type === 'LOST').length;
  const foundCount = reports.filter((r) => r.type === 'FOUND').length;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">My Campus Reports</h1>
          <p className="text-xs text-slate-500">Items you personally reported lost or found across the college</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentView('report-lost')}
            className="px-3.5 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded hover:bg-rose-100 transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <PlusCircle className="w-3.5 h-3.5" /> Report Lost
          </button>
          <button
            onClick={() => setCurrentView('report-found')}
            className="px-3.5 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded hover:bg-emerald-100 transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <PlusCircle className="w-3.5 h-3.5" /> Report Found
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 text-xs font-medium">
        <button
          onClick={() => setActiveTab('ALL')}
          className={`pb-3 px-3 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'ALL'
              ? 'border-indigo-600 text-indigo-700 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          All Reports ({reports.length})
        </button>
        <button
          onClick={() => setActiveTab('LOST')}
          className={`pb-3 px-3 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'LOST'
              ? 'border-rose-600 text-rose-700 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Lost Belongings ({lostCount})
        </button>
        <button
          onClick={() => setActiveTab('FOUND')}
          className={`pb-3 px-3 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'FOUND'
              ? 'border-emerald-600 text-emerald-700 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Found Articles ({foundCount})
        </button>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-24 bg-slate-100 rounded-lg animate-pulse border border-slate-200" />
          ))}
        </div>
      ) : filteredReports.length > 0 ? (
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-xs">
          <div className="divide-y divide-slate-200">
            {filteredReports.map((report) => (
              <div key={report.id} className="p-4 sm:p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-slate-50/60 transition-colors">
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge type={report.type} label={report.type} size="sm" />
                    <Badge type={report.status} label={report.status} size="sm" />
                    <span className="text-xs text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded font-medium">
                      {report.category_name}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">ID: #{report.id}</span>
                  </div>

                  <h3 className="font-semibold text-slate-900 text-sm leading-snug">
                    {report.title}
                  </h3>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {report.location_name}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {report.date_reported}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  {report.status === 'ACTIVE' && (
                    <button
                      onClick={() => handleUpdateStatus(report.id, 'RESOLVED')}
                      className="px-2.5 py-1 text-xs border border-emerald-600 text-emerald-700 rounded hover:bg-emerald-50 transition-colors cursor-pointer"
                    >
                      Mark Resolved
                    </button>
                  )}
                  {report.status === 'ACTIVE' && report.type === 'FOUND' && (
                    <button
                      onClick={() => handleUpdateStatus(report.id, 'RETURNED')}
                      className="px-2.5 py-1 text-xs border border-teal-600 text-teal-700 rounded hover:bg-teal-50 transition-colors cursor-pointer"
                    >
                      Mark Returned
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setSelectedItemId(report.id);
                      setCurrentView('item-details');
                    }}
                    className="px-3 py-1.5 text-xs bg-slate-900 text-white rounded font-medium hover:bg-slate-800 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <span>View Details</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-slate-200 p-12 text-center max-w-md mx-auto space-y-3">
          <FileText className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="font-semibold text-slate-900 text-sm">You have not reported any items yet.</h3>
          <p className="text-xs text-slate-500">When you submit lost or found reports, they will be listed here.</p>
        </div>
      )}
    </div>
  );
}
